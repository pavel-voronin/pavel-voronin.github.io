import { joinURL } from "ufo"

const activeScopes = new Map<string, number>()
const cleanupTimers = new Map<string, number>()
const reloadFlagKey = "embedos-coi-reloaded"

function getWorkerUrl(): string {
  const { app } = useRuntimeConfig()
  return new URL(joinURL(app.baseURL, "coi-serviceworker.min.js"), window.location.origin).href
}

function getScope(): string {
  const { app } = useRuntimeConfig()
  const route = useRoute()
  return new URL(joinURL(app.baseURL, route.path), window.location.origin).href
}

async function unregisterWorkerRegistration(scope: string, scriptUrl: string) {
  if (!("serviceWorker" in navigator)) {
    return
  }

  const registrations = await navigator.serviceWorker.getRegistrations()
  await Promise.all(
    registrations
      .filter((registration) => registration.scope === scope && registration.active?.scriptURL === scriptUrl)
      .map((registration) => registration.unregister()),
  )
}

export function useCoiWorker() {
  if (import.meta.client) {
    const scriptUrl = getWorkerUrl()
    const scope = getScope()

    if (import.meta.dev) {
      console.debug("[coi]", "init", {
        scope,
        scriptUrl,
        isolated: window.crossOriginIsolated,
      })
    }

    if (window.crossOriginIsolated) {
      window.sessionStorage.removeItem(reloadFlagKey)
    }

    const nextCount = (activeScopes.get(scope) ?? 0) + 1
    activeScopes.set(scope, nextCount)

    if (cleanupTimers.has(scope)) {
      window.clearTimeout(cleanupTimers.get(scope))
      cleanupTimers.delete(scope)
    }

    if ("serviceWorker" in navigator && window.isSecureContext) {
      void navigator.serviceWorker
        .register(scriptUrl, { scope })
        .then(async () => {
          if (import.meta.dev) {
            console.debug("[coi]", "registered", {
              scope,
              scriptUrl,
            })
          }

          await navigator.serviceWorker.ready

          if (window.crossOriginIsolated || window.sessionStorage.getItem(reloadFlagKey) === "1") {
            if (import.meta.dev) {
              console.debug("[coi]", "skip-reload", {
                isolated: window.crossOriginIsolated,
                reloadFlag: window.sessionStorage.getItem(reloadFlagKey),
              })
            }
            return
          }

          if (import.meta.dev) {
            console.debug("[coi]", "reload", {
              scope,
              scriptUrl,
            })
          }
          window.sessionStorage.setItem(reloadFlagKey, "1")
          window.location.reload()
        })
        .catch((error) => {
          if (import.meta.dev) {
            console.debug("[coi]", "register-failed", {
              scope,
              scriptUrl,
              message: error instanceof Error ? error.message : String(error),
            })
          }
        })
    }

    onBeforeUnmount(() => {
      const next = Math.max(0, (activeScopes.get(scope) ?? 0) - 1)
      if (next > 0) {
        activeScopes.set(scope, next)
        return
      }

      activeScopes.delete(scope)

      cleanupTimers.set(scope, window.setTimeout(() => {
        cleanupTimers.delete(scope)

        if ((activeScopes.get(scope) ?? 0) !== 0) {
          return
        }

        if (import.meta.dev) {
          console.debug("[coi]", "unregister", {
            scope,
            scriptUrl,
          })
        }

        void unregisterWorkerRegistration(scope, scriptUrl).catch(() => {})
      }, 0))
    })
  }
}
