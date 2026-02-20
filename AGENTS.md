# Project Rules

## Styling

- Use only Tailwind utility classes.
- Do not write raw CSS. Only exception is tailwindcss way to define base layer
- Elements may have ONLY one class - semantic name
- All styles applied by @apply directive in `<style scoped>` blocks in Vue components.
- JavaScript is strictly forbidden for layout and responsive behavior in markup. Do not calculate sizes/positions/visibility in JS; use Tailwind/CSS only.
