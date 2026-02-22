---
title: Typography Sandbox
description: A reference page to validate blog typography styles.
date: 2025-02-04
---

# Typography Sandbox

This page collects common Markdown blocks to validate spacing, rhythm, and readability.

## Paragraphs and links

This is regular body text with an [inline link](/posts), plus some **strong text**, _emphasis_, and `inline code`. Text can also be ~~struck through~~ when something is outdated or corrected.

Good writing does not announce itself. It simply moves the reader from one sentence to the next without friction, without confusion, and without unnecessary detours into territory that does not serve the point being made. Line length, spacing, and contrast are not cosmetic — they are the infrastructure that makes extended reading comfortable. A column that is too wide forces the eye to travel too far. One that is too narrow chops thought into fragments. The right measure keeps the reader inside the text rather than aware of the page.

## Lists

### Unordered list

- One simple bullet item.
- Another item with a longer sentence to test wrapping behavior for multiline bullets.
- A nested list:
  - Nested item A
  - Nested item B

### Ordered list

1. First step.
2. Second step with additional context.
3. Third step.

### Task list

- [x] Write first draft
- [x] Add examples
- [ ] Publish and gather feedback

## Headings

# Heading 1

## Heading 2

### Heading 3

#### Heading 4

##### Heading 5

###### Heading 6

## Quote

> Design is reducing noise until the content can breathe.

## Code blocks

```ts
type PostMeta = {
  title: string;
  date: string;
  description?: string;
};

const byDateDesc = (a: PostMeta, b: PostMeta) => {
  return new Date(b.date).getTime() - new Date(a.date).getTime();
};
```

```bash
npm run dev
npm run build
```

## Table

| Token      | Usage                        | Example               |
| ---------- | ---------------------------- | --------------------- |
| Background | Page canvas color            | `bg-stone-100`        |
| Accent     | Link hover and focus moments | `text-amber-800`      |
| Divider    | Section separation           | `border-stone-300/70` |

## Horizontal rule

---

## Image and component

![Editorial desk setup](https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80)

## Keyboard input

Use <kbd>Cmd</kbd> + <kbd>K</kbd> to open quick navigation.

<InlineBadge text="Markdown + Vue component still works"></InlineBadge>