<template>
  <div class="page">
    <TopBar />

    <div class="columns">
      <aside class="sidebar">
        <div class="sidebarInner">
          <Sidebar />
        </div>
      </aside>

      <div class="content">
        <main class="contentBody">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
@reference "~/assets/css/main.css";

.page {
  @apply min-h-screen bg-surface text-body font-sans;
}

.columns {
  @apply mx-auto min-h-screen w-full max-w-340 grid text-lg;
  grid-template-columns: 1fr;
}

@variant sidenav {
  .columns {
    grid-template-columns: minmax(0, 24rem) calc(var(--content-guard) * 2 + var(--content-max));
  }
}

.sidebar {
  @apply hidden sidenav:sticky sidenav:top-0 sidenav:flex sidenav:h-dvh sidenav:self-start sidenav:overflow-y-auto sidenav:overscroll-y-contain border-r border-edge/70 px-8 py-12;
}

.sidebarInner {
  @apply ml-auto w-full max-w-74;
  container-type: inline-size;
}

.content {
  @apply min-h-screen;
}

.contentBody {
  @apply pt-8 pb-12 sidenav:py-12 font-sans;
  padding-inline: var(--content-guard);
  max-width: calc(var(--content-guard) * 2 + var(--content-max));
  min-width: calc(var(--content-guard) * 2 + var(--content-min));
  margin-inline: auto;
  container-name: content;
  container-type: inline-size;
}
</style>
