declare module '#build/nuxt-icon-client-bundle' {
  import type { IconifyIcon } from '@iconify/types'

  export function init(addIcon: (name: string, data: IconifyIcon | null) => boolean): void
}
