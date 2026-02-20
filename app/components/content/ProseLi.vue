<template>
  <li class="pl-1 text-body">
    <slot />
  </li>
</template>

<style scoped>
@reference "~/assets/css/main.css";

li :deep(ul),
li :deep(ol) {
  @apply my-1.5;
}

li :deep(input[type='checkbox']) {
  @apply mr-2 accent-subtle;
}
</style>
