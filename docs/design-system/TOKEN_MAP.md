# Token Map

## Muc tieu

Token map nay chot mot hierarchy ro rang:

- `primitive tokens` cho raw values
- `semantic tokens` cho meaning
- `component tokens` cho tung family UI

Pilot 1 chua sua code, nhung khoa ten va huong migrate de cac pilot sau khong tiep tuc them raw values vao page.

## Layer 1: primitive tokens dang co

Token hien dang dinh nghia trong `app/globals.css`:

### Color primitives

```css
--ink-900
--ink-700
--ink-500
--sand-050
--sand-100
--sand-200
--fog-blue
--signal-cyan
--mission-amber
--alert-coral
--success-moss
```

### Existing semantic-ish aliases

```css
--background
--foreground
--muted
--panel
--panel-strong
--border
--shadow
```

### Radius primitives

```css
--radius-xl
--radius-lg
--radius-md
```

### Font aliases

```css
--font-sans
--font-mono
```

## Khoang trong token hien tai

Dang thieu cac nhom sau:

- spacing scale
- typography scale naming
- motion duration va easing
- z-index tokens
- semantic surface states
- semantic interactive states
- component token names cho button/card/form

## Layer 2: semantic token map de chot cho v1

De xuat v1 cho `startup-polished` family:

```css
:root {
  /* canvas + text */
  --color-canvas: var(--sand-050);
  --color-canvas-elevated: var(--sand-100);
  --color-text-primary: var(--ink-900);
  --color-text-secondary: var(--ink-700);
  --color-text-muted: var(--ink-500);

  /* surfaces */
  --color-surface-default: var(--panel);
  --color-surface-strong: var(--panel-strong);
  --color-surface-outline: var(--border);
  --color-surface-grid: rgba(39, 65, 95, 0.06);

  /* accents */
  --color-accent-primary: var(--signal-cyan);
  --color-accent-secondary: var(--mission-amber);
  --color-accent-info: var(--fog-blue);
  --color-feedback-success: var(--success-moss);
  --color-feedback-danger: var(--alert-coral);

  /* radius */
  --radius-surface-lg: var(--radius-xl);
  --radius-surface-md: var(--radius-lg);
  --radius-control: var(--radius-md);
  --radius-pill: 999px;

  /* shadow */
  --shadow-surface-lg: var(--shadow);
  --shadow-surface-sm: 0 12px 36px rgba(19, 34, 56, 0.08);

  /* spacing */
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-7: 28px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;

  /* type */
  --text-eyebrow: 0.76rem;
  --text-body-sm: 0.94rem;
  --text-body-md: 1rem;
  --text-title-md: 1.6rem;
  --text-title-lg: 2.25rem;
  --text-hero: clamp(2.7rem, 6vw, 5.4rem);

  /* motion */
  --duration-fast: 160ms;
  --duration-base: 220ms;
  --easing-standard: ease;

  /* z */
  --z-header: 40;
  --z-overlay: 60;
}
```

## Layer 3: component token families

### Action tokens

```css
--button-primary-bg: var(--color-accent-primary);
--button-primary-fg: white;
--button-secondary-bg: rgba(24, 183, 176, 0.1);
--button-secondary-fg: var(--color-text-primary);
--button-ghost-fg: var(--color-text-secondary);
--button-radius: var(--radius-pill);
```

### Surface tokens

```css
--panel-bg: var(--color-surface-default);
--panel-bg-strong: var(--color-surface-strong);
--panel-border: var(--color-surface-outline);
--panel-radius: var(--radius-surface-lg);
--panel-shadow: var(--shadow-surface-lg);
```

### Card tokens

```css
--card-bg: var(--color-surface-strong);
--card-border: var(--color-surface-outline);
--card-radius: var(--radius-surface-md);
--card-gap: var(--space-4);
```

### Form tokens

```css
--field-bg: rgba(255, 255, 255, 0.72);
--field-border: var(--color-surface-outline);
--field-border-focus: var(--color-accent-primary);
--field-radius: var(--radius-control);
```

### Status tokens

```css
--status-success-bg: color-mix(in srgb, var(--color-feedback-success) 12%, white);
--status-warn-bg: color-mix(in srgb, var(--color-accent-secondary) 14%, white);
--status-danger-bg: color-mix(in srgb, var(--color-feedback-danger) 14%, white);
--status-neutral-bg: color-mix(in srgb, var(--color-text-secondary) 8%, white);
```

## Token to current UI family map

| UI family | Current classes | Token family phai dung |
| --- | --- | --- |
| Shell | `app-shell`, `app-backdrop`, `page-frame`, `site-header` | canvas, surface, z, shadow |
| Buttons | `button-primary`, `button-secondary`, `button-ghost`, `nav-link` | action tokens |
| Panels | `panel`, `panel-strong`, `section-block` | surface tokens |
| Cards | `detail-card`, `tool-card`, `mission-card`, `skill-card`, `timeline-card`, `ops-card` | card + status tokens |
| Chips | `chip`, `outline-chip`, `status-chip` | action + status tokens |
| Forms | `select`, `textarea`, `input-field`, `textarea-field` | form tokens |
| Feedback | `empty-state`, `status-message`, `score-band` | status tokens |

## Migration rules

### Rule 1

Khong them raw `rgba(...)`, raw `box-shadow`, raw `border-radius` moi vao page/component code.

### Rule 2

Khong them `style={{ marginTop: ... }}` moi neu gia tri do lap lai nhieu hon 2 lan. Chuyen thanh spacing utility hoac primitive spacing prop.

### Rule 3

Token moi phai duoc dat ten theo meaning:

- dung `color-text-muted`
- khong dung `gray-500`

### Rule 4

Primitives cu co the giu ten cu trong giai doan bridge, nhung semantic token moi phai tro thanh source of truth.

## Muc tieu implementation tiep theo

Thu tu tach token hop ly:

1. `color` + `radius` + `shadow`
2. `spacing`
3. `type`
4. `motion`
5. component tokens cho `button`, `surface`, `field`
