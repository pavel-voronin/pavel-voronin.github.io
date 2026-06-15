<template>
  <span v-if="hasContributionWidget" class="contributionWidget" :aria-label="widgetLabel">
    <span class="contributionGrid" :title="totalContributionsLabel" aria-hidden="true">
      <span
        v-for="day in contributionDays"
        :key="day.id"
        :class="day.className"
      />
    </span>
    <span v-if="hasCurrentStreak" class="streakLabel">
      <Icon name="lucide:flame" class="streakIcon" />
      <span class="streakText">{{ currentStreak }}-day streak</span>
    </span>
    <span v-else class="fullContributionCount">
      <Icon name="lucide:activity" class="contributionIcon" />
      <span class="fullContributionText">{{ totalContributions }} commits</span>
    </span>
    <span class="compactContributionCount">
      <Icon v-if="hasCurrentStreak" name="lucide:flame" class="streakIcon" />
      <Icon v-else name="lucide:activity" class="contributionIcon" />
      <span class="compactContributionText">{{ compactContributionText }}</span>
    </span>
  </span>
</template>

<script setup lang="ts">
import githubContributions from "~/data/github-contributions.json";

type ContributionClass =
  | "contributionEmpty"
  | "contributionLow"
  | "contributionMedium"
  | "contributionHigh"
  | "contributionPeak";

type ContributionDay = {
  id: string;
  className: ContributionClass;
  count: number;
};

type GitHubContributionDay = {
  date: string;
  count: number;
  level: string;
};

type GitHubContributions = {
  fetchedAt: string;
  totalContributions: number;
  days: GitHubContributionDay[];
};

const CONTRIBUTION_LEVEL_CLASSES: Record<string, ContributionClass> = {
  NONE: "contributionEmpty",
  FIRST_QUARTILE: "contributionLow",
  SECOND_QUARTILE: "contributionMedium",
  THIRD_QUARTILE: "contributionHigh",
  FOURTH_QUARTILE: "contributionPeak",
};
const VISIBLE_CONTRIBUTION_DAYS = 14;

function resolveFetchDate(fetchedAt: string): string | null {
  const timestamp = Date.parse(fetchedAt);
  if (!Number.isFinite(timestamp)) {
    return null;
  }

  return new Date(timestamp).toISOString().slice(0, 10);
}

function isGitHubContributionDay(value: unknown): value is GitHubContributionDay {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const day = value as Partial<GitHubContributionDay>;

  return (
    typeof day.date === "string" &&
    typeof day.level === "string" &&
    Number.isInteger(day.count) &&
    day.count >= 0
  );
}

function resolveGitHubContributions(value: unknown): GitHubContributions | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const data = value as Partial<GitHubContributions>;
  const fetchedDate = typeof data.fetchedAt === "string"
    ? resolveFetchDate(data.fetchedAt)
    : null;

  if (
    fetchedDate === null ||
    !Number.isInteger(data.totalContributions) ||
    data.totalContributions < 0 ||
    !Array.isArray(data.days) ||
    data.days.length < VISIBLE_CONTRIBUTION_DAYS ||
    !data.days.every(isGitHubContributionDay)
  ) {
    return null;
  }

  return {
    fetchedAt: data.fetchedAt,
    totalContributions: data.totalContributions,
    days: data.days,
  };
}

function resolveContributionClass(day: GitHubContributionDay): ContributionClass {
  const levelClass = CONTRIBUTION_LEVEL_CLASSES[day.level];
  if (levelClass) {
    return levelClass;
  }

  if (day.count === 0) {
    return "contributionEmpty";
  }

  if (day.count <= 2) {
    return "contributionLow";
  }

  if (day.count <= 4) {
    return "contributionMedium";
  }

  if (day.count <= 6) {
    return "contributionHigh";
  }

  return "contributionPeak";
}

function createContributionDays(days: GitHubContributionDay[]): ContributionDay[] {
  return days.map((day) => ({
    id: day.date,
    className: resolveContributionClass(day),
    count: day.count,
  }));
}

function resolveCurrentStreak(days: GitHubContributionDay[], fetchedAt: string | null): number {
  let streak = 0;
  const fetchedDate = fetchedAt === null ? null : resolveFetchDate(fetchedAt);
  const lastDay = days.at(-1);
  const trailingTodayOffset = lastDay?.count === 0 && lastDay.date === fetchedDate ? 1 : 0;

  for (let index = days.length - 1 - trailingTodayOffset; index >= 0; index -= 1) {
    if (days[index].count === 0) {
      break;
    }

    streak += 1;
  }

  return streak;
}

const contributionData = resolveGitHubContributions(githubContributions);
const hasContributionWidget = contributionData !== null;
const allContributionDays = contributionData?.days ?? [];
const contributionDays = createContributionDays(allContributionDays.slice(-VISIBLE_CONTRIBUTION_DAYS));
const currentStreak = resolveCurrentStreak(allContributionDays, contributionData?.fetchedAt ?? null);
const hasCurrentStreak = currentStreak >= 2;
const totalContributions = contributionData?.totalContributions ?? 0;
const totalContributionsLabel = `${totalContributions} commits in the last year`;
const streakText = hasCurrentStreak ? `${currentStreak}-day streak, ` : "";
const compactContributionText = hasCurrentStreak ? `${currentStreak}d` : `${totalContributions}`;
const widgetLabel = `${streakText}${totalContributionsLabel}`;

</script>

<style scoped>
@reference "~/assets/css/main.css";

.contributionWidget {
  @apply ml-auto flex min-w-0 shrink items-center gap-1.5 overflow-hidden whitespace-nowrap text-xs leading-none text-muted;
}

.contributionGrid {
  @apply grid shrink-0 grid-cols-7 grid-rows-2 gap-0.5;
}

.contributionEmpty {
  @apply size-1.5 rounded-[2px] bg-[#ebedf0];
}

.contributionLow {
  @apply size-1.5 rounded-[2px] bg-[#9be9a8];
}

.contributionMedium {
  @apply size-1.5 rounded-[2px] bg-[#40c463];
}

.contributionHigh {
  @apply size-1.5 rounded-[2px] bg-[#30a14e];
}

.contributionPeak {
  @apply size-1.5 rounded-[2px] bg-[#216e39];
}

.streakLabel {
  @apply flex shrink-0 items-center gap-1;
}

.streakIcon {
  @apply size-4 shrink-0 text-[#f97316];
}

.streakText {
  @apply shrink-0;
}

.fullContributionCount {
  @apply flex shrink-0 items-center gap-1;
}

.compactContributionCount {
  @apply hidden shrink-0 items-center gap-1 tabular-nums;
}

.contributionIcon {
  @apply size-4 shrink-0 text-[#f97316];
}

.fullContributionText {
  @apply shrink-0;
}

.compactContributionText {
  @apply shrink-0;
}

@container (width < 18.5rem) {
  .streakLabel,
  .fullContributionCount {
    @apply hidden;
  }

  .compactContributionCount {
    @apply inline-flex;
  }
}

@container (width < calc(17.4ch + 2px)) {
  .compactContributionCount {
    @apply hidden;
  }
}
</style>
