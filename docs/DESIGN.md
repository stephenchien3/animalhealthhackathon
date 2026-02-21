# Design System — CleanFeed

Based on **Tailark Veil** patterns. All UI components must follow these conventions.

---

## Colors

| Token                    | Usage                              |
|--------------------------|------------------------------------|
| `bg-background`          | Page / main content background     |
| `text-foreground`        | Primary text                       |
| `text-muted-foreground`  | Secondary / caption text           |
| `bg-muted`               | Subtle backgrounds (tags, badges)  |
| `border`                 | All borders (cards, inputs, dividers) |
| `bg-primary`             | Primary buttons, active states     |
| `text-primary-foreground`| Text on primary backgrounds        |
| `bg-sidebar` / `text-sidebar-foreground` | Sidebar navigation |
| `text-blue-600`          | Accent links, active indicators    |
| `bg-destructive`         | Error states, delete actions       |

Dark mode is fully supported via `prefers-color-scheme: dark` with all tokens remapped in `src/index.css`.

---

## Typography

| Style                                    | Usage                     |
|------------------------------------------|---------------------------|
| `text-4xl font-semibold`                 | Page title (h1)           |
| `text-3xl font-semibold`                 | Section heading (h2)      |
| `text-lg font-semibold`                  | Card title, subsection    |
| `text-sm font-medium`                    | Label, nav link           |
| `text-sm`                                | Body text, table cells    |
| `text-sm text-muted-foreground`          | Caption, helper text      |
| `text-3xl font-semibold` (inside KPI)    | KPI large number          |

Font: Inter (system fallback: `ui-sans-serif, system-ui, -apple-system, sans-serif`).

---

## Spacing

| Pattern                              | Usage                              |
|--------------------------------------|------------------------------------|
| `py-16 md:py-32`                     | Top-level page sections            |
| `mx-auto max-w-5xl px-6`            | Centered content container         |
| `space-y-6`                          | Vertical stack of cards/sections   |
| `gap-4` / `gap-6` / `gap-8`         | Grid gaps (small / medium / large) |
| `p-6`                                | Card inner padding                 |
| `px-3 py-2`                          | Input / button inner padding       |
| `px-6`                               | Header / sidebar horizontal padding|

---

## Border & Radius

| Pattern                              | Usage                           |
|--------------------------------------|---------------------------------|
| `rounded-[var(--radius)]`           | Default radius (inputs, buttons, cards) |
| `rounded-2xl` / `rounded-3xl`       | Large feature cards, hero sections |
| `border`                             | Standard 1px border             |
| `border-b`                           | Header bottom divider           |
| `border-r`                           | Sidebar right divider           |
| `shadow shadow-zinc-950/5`          | Subtle card shadow              |

`--radius` is set to `0.625rem` (10px) in the CSS theme.

---

## Buttons

### Primary
```
bg-primary text-primary-foreground shadow hover:bg-primary/90
h-10 px-4 py-2 text-sm font-medium rounded-[var(--radius)]
```
Use for main actions: "Sign in", "Add Shed", "Save".

### Outline
```
border border-input bg-background hover:bg-accent hover:text-accent-foreground
h-10 px-4 py-2 text-sm font-medium rounded-[var(--radius)]
```
Use for secondary actions: "Cancel", "Filter".

### Small
```
h-8 px-3 text-xs font-medium rounded-[var(--radius)]
```
Use for inline actions in tables: "Edit", "Delete".

### Link / Text
```
text-blue-600 hover:underline text-sm font-medium
```
Use for navigation text links.

---

## Cards

### Standard Card
```html
<div class="bg-background border rounded-[var(--radius)] p-6 shadow shadow-zinc-950/5">
  <h3 class="text-lg font-semibold">Card Title</h3>
  <p class="text-sm text-muted-foreground">Description</p>
</div>
```

### KPI Card
```html
<div class="bg-background border rounded-[var(--radius)] p-6">
  <p class="text-sm text-muted-foreground">Tracked Sheds</p>
  <p class="text-3xl font-semibold">12</p>
</div>
```

KPI cards always show: a small label (`text-sm text-muted-foreground`) above a large value (`text-3xl font-semibold`).

---

## Forms

Follow the Veil form pattern:

```html
<form class="*:space-y-3 space-y-6">
  <div>
    <label class="text-sm font-medium">Email</label>
    <input class="flex h-10 w-full rounded-[var(--radius)] border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" />
  </div>
</form>
```

- Each field group: `space-y-3` (label + input + helper)
- Between groups: `space-y-6`
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring`
- Container pattern: `has-[input:focus]:ring-2` for wrapper focus

---

## Grids

### KPI Grid (Summary / Home)
```
grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6
```
Used for the row of KPI stat cards.

### Feature / Content Grid
```
grid md:grid-cols-2 gap-6
```
Used for two-column layouts (improvement suggestions, feature cards).

### Table Layout
Full-width with horizontal scroll on small screens:
```
overflow-x-auto border rounded-[var(--radius)]
```

---

## Icons

All icons use **Lucide React**.

| Size       | Class    | Usage                        |
|------------|----------|------------------------------|
| Small      | `size-4` | Inline with text, badges     |
| Navigation | `size-5` | Sidebar nav, header actions  |

Icons are always placed **before** their label text with `gap-3` spacing in nav items.

---

## Dark Mode

Full dark mode support via `@media (prefers-color-scheme: dark)` in `src/index.css`.

All color tokens are remapped:
- `bg-background` → dark surface
- `text-foreground` → light text
- `border` → subtle dark borders
- `bg-sidebar` → dark sidebar surface

No manual `.dark` class toggling needed — it follows system preference.

---

## Per-Page Mapping

Each page maps to a Tailark Veil pattern:

| Page          | Veil Pattern     | Key Elements                          |
|---------------|------------------|---------------------------------------|
| **Login**     | veil-login       | Centered card, form fields, primary button |
| **Home**      | veil-hero        | Welcome heading, KPI grid, quick actions |
| **Summary**   | veil-stats       | KPI grid (4-col), stats list, improvement cards |
| **Database**  | veil-table       | Search + filters bar, data table, pagination |
| **Map**       | veil-feature     | Full-bleed map, slide-in detail panel |

### Login (`/login`)
- Centered vertically and horizontally (`flex min-h-screen items-center justify-center`)
- Max width `max-w-sm`
- Logo/title at top, form below, primary "Sign in" button full-width

### Home (`/`)
- Page title: `text-4xl font-semibold`
- KPI grid: 3 cards in `grid grid-cols-2 lg:grid-cols-3 gap-4`
- Welcome text + recent activity below

### Summary (`/summary`)
- Page title at top
- KPI grid: 4 cards in `grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-6`
- Statistics list with `space-y-4`
- Improvements section: cards with severity badges (warning/critical icons)

### Database (`/database`)
- Page title + "Add Shed" button in flex row
- Search bar + filter dropdowns below
- Full-width bordered table with `rounded-[var(--radius)]`
- Pagination controls at bottom

### Map (`/map`)
- Leaflet map fills available space
- Clicking a pin opens a detail panel overlay
- Detail panel: card with shed image, stats, status badge
