import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const OUTPUT_URL = new URL("../app/data/github-contributions.json", import.meta.url);
const OUTPUT_PATH = fileURLToPath(OUTPUT_URL);
const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const FALLBACK_DATA = "null\n";
const DEFAULT_LOGIN = "pavel-voronin";

const query = `
  query GitHubContributions($login: String!) {
    user(login: $login) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              color
              contributionCount
              contributionLevel
              date
            }
          }
        }
      }
    }
  }
`;

async function writeFallbackData() {
  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, FALLBACK_DATA);
}

function getRequiredEnv(name) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function toErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function assertContributionCalendar(value) {
  if (typeof value !== "object" || value === null) {
    throw new Error("GitHub response does not include a contribution calendar.");
  }

  const calendar = value;
  if (!Number.isInteger(calendar.totalContributions)) {
    throw new Error("GitHub response has an invalid total contribution count.");
  }

  if (!Array.isArray(calendar.weeks)) {
    throw new Error("GitHub response has an invalid contribution weeks list.");
  }

  return calendar;
}

function normalizeContributionDay(value) {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const date = typeof value.date === "string" ? value.date : null;
  const count = Number.isInteger(value.contributionCount) ? value.contributionCount : null;
  const level = typeof value.contributionLevel === "string" ? value.contributionLevel : null;
  const color = typeof value.color === "string" ? value.color : null;

  if (date === null || count === null || level === null || color === null || count < 0) {
    return null;
  }

  return {
    date,
    count,
    level,
    color,
  };
}

function createContributionData(calendar) {
  const days = calendar.weeks
    .flatMap((week) => Array.isArray(week?.contributionDays) ? week.contributionDays : [])
    .map(normalizeContributionDay)
    .filter(Boolean)
    .sort((firstDay, secondDay) => firstDay.date.localeCompare(secondDay.date));

  if (days.length === 0) {
    throw new Error("GitHub response produced no contribution days.");
  }

  return {
    source: "github-graphql",
    fetchedAt: new Date().toISOString(),
    totalContributions: calendar.totalContributions,
    days,
  };
}

async function fetchContributionData(token, login) {
  const response = await fetch(GITHUB_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "pavel-voronin-github-io-build",
    },
    body: JSON.stringify({
      query,
      variables: {
        login,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    const message = payload.errors
      .map((error) => error?.message)
      .filter(Boolean)
      .join("; ");

    throw new Error(`GitHub GraphQL returned errors: ${message || "unknown error"}.`);
  }

  const calendar = assertContributionCalendar(
    payload?.data?.user?.contributionsCollection?.contributionCalendar,
  );

  return createContributionData(calendar);
}

async function main() {
  await writeFallbackData();

  const token = getRequiredEnv("GH_CONTRIBUTIONS_TOKEN");
  if (token === null) {
    console.warn("GH_CONTRIBUTIONS_TOKEN is not set. GitHub contribution widget will be hidden.");
    return;
  }

  const login = getRequiredEnv("GH_CONTRIBUTIONS_LOGIN") ?? DEFAULT_LOGIN;

  try {
    const contributionData = await fetchContributionData(token, login);
    await writeFile(OUTPUT_PATH, `${JSON.stringify(contributionData, null, 2)}\n`);
    console.log(`Fetched GitHub contribution data for ${login}.`);
  } catch (error) {
    await writeFallbackData();
    console.warn(`GitHub contribution widget will be hidden: ${toErrorMessage(error)}`);
  }
}

await main();
