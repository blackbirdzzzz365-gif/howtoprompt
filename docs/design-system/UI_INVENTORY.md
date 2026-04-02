# UI Inventory

## Snapshot

- Repo: `howtoprompt-main`
- Framework: `Next.js 16.2.1` + `React 19.2.4` + `TypeScript`
- Styling: `Tailwind CSS v4` + mot file global CSS lon tai `app/globals.css`
- UI shell: `app/layout.tsx`
- Global client state: `components/app-provider.tsx`
- Page routes hien tai: `14` route page + `not-found`
- Component files hien tai: `14` file trong `components/`
- Design system maturity: `bridge state`
  Nghia la da co visual language kha ro, nhung chua co layer primitive/composite duoc dong goi thanh system chuan.

## UI layers hien tai

### 1. Shell va global state

- `AppProvider`
  Giu `activePathSlug`, `completedMissionSlugs`, `quickRefIds`, `achievements`, `reducedMotion`, `recordEvent`, mission completion.
- `SiteHeader`
  Global navigation + reduced motion toggle.
- `layout.tsx`
  Dinh nghia `app-shell`, `app-backdrop`, `page-frame`, footer links.

### 2. Learning navigation surfaces

- `MissionMap`
  Grid de vao stage, co completion state va CTA practice.
- `PathChooser`
  Chon learning path, ghi event `path_focus`.
- `QuickRefWallet`
  Card wallet theo trang thai `locked/unlocked`.
- `ProgressRail`
  Da implement nhung chua duoc mount o route nao.

### 3. Practice va workbench surfaces

- `PromptLab`
  Prompt evaluator workbench.
- `SimulatorPanel`
  Choice-based simulator workbench.
- `SocialListeningArena`
  Narrative quest board + role-based explainer.

### 4. Knowledge atlas surfaces

- `SkillAtlasDirectory`
  Search/filter/list catalog.
- `SkillAtlasDetail`
  Detail page cho mot skill.
- `SkillAdvisorPanel`
  AI advisor de shortlist skill.
- `SkillExplainPanel`
  AI explainer cho tung skill.

### 5. Ops va telemetry

- `OpsSummary`
  Telemetry snapshot + recent events.

## Route to UI ownership map

| Route | Pattern | Primary UI ownership | Data/state source | Notes |
| --- | --- | --- | --- | --- |
| `/` | hero landing + stacked sections | `SiteHeader`, `PathChooser`, `MissionMap` | `lib/content`, `AppProvider` | Home page dang dong vai tro campaign landing page |
| `/missions` | catalog index | `MissionMap` | `lib/content` | Mission listing page |
| `/missions/[slug]` | detail + sticky aside | page-level markup + `MissionMap` | `lib/content` | Chua co dedicated `MissionDetail` composite |
| `/prompt-lab` | practice workbench | `PromptLab` | `AppProvider`, `/api/attempts/prompt-evaluation` | Page-level composite da kha ro |
| `/quick-ref` | wallet grid | `QuickRefWallet` | `lib/content`, `AppProvider` | Unlock state-driven |
| `/simulator` | practice workbench | `SimulatorPanel` | `AppProvider`, `/api/attempts/scenario-step` | Co query-param scenario entry |
| `/ops` | telemetry dashboard | `OpsSummary` | `/api/ops/summary` | Page nay vua la docs deck vua la dashboard |
| `/social-listening-arena` | narrative quest board | `SocialListeningArena` | local quest config + `AppProvider` | Page story-driven, rat opinionated |
| `/social-listening-arena/skills` | atlas directory | `SkillAtlasDirectory`, `SkillAdvisorPanel` | `lib/skill-atlas*` | Default skill atlas catalog |
| `/social-listening-arena/skills/[slug]` | atlas detail | `SkillAtlasDetail`, `SkillExplainPanel` | `lib/skill-atlas*` | Detail page voi raw docs va related skills |
| `/social-listening-arena/skills-vm-codex` | atlas directory | `SkillAtlasDirectory`, `SkillAdvisorPanel` | `lib/skill-atlas*` | Same pattern, catalog doi |
| `/social-listening-arena/skills-vm-codex/[slug]` | atlas detail | `SkillAtlasDetail`, `SkillExplainPanel` | `lib/skill-atlas*` | Same pattern, catalog doi |
| `/social-listening-arena/skills-vm-openclaw` | atlas directory | `SkillAtlasDirectory`, `SkillAdvisorPanel` | `lib/skill-atlas*` | Same pattern, catalog doi |
| `/social-listening-arena/skills-vm-openclaw/[slug]` | atlas detail | `SkillAtlasDetail`, `SkillExplainPanel` | `lib/skill-atlas*` | Same pattern, catalog doi |
| `not-found` | simple recovery page | page-level markup | none | Co the chuan hoa thanh fallback pattern |

## Component inventory

| Component | Layer | Current status | Mounted today | Main responsibility |
| --- | --- | --- | --- | --- |
| `AppProvider` | foundation | approved | yes | Global progress, reduced motion, telemetry bridge |
| `SiteHeader` | shell composite | approved | yes | Primary nav + brand lockup |
| `MissionMap` | learning composite | approved | yes | Mission listing + completion CTA |
| `PathChooser` | learning composite | approved | yes | Path selection |
| `QuickRefWallet` | learning composite | approved | yes | Unlockable quick-ref cards |
| `PromptLab` | page workbench | approved | yes | Prompt evaluation flow |
| `SimulatorPanel` | page workbench | approved | yes | Scenario-choice simulator |
| `OpsSummary` | data composite | approved | yes | Snapshot cards + recent events |
| `SocialListeningArena` | page workbench | approved | yes | Quest board + role view |
| `SkillAtlasDirectory` | knowledge composite | approved | yes | Search, filter, list skills |
| `SkillAtlasDetail` | knowledge composite | approved | yes | Detail doc explorer |
| `SkillAdvisorPanel` | AI assistant composite | approved | yes | Need-to-skill recommendation |
| `SkillExplainPanel` | AI assistant composite | approved | yes | Explain-a-skill interaction |
| `ProgressRail` | shell composite | hold | no | Candidate global progress surface |

## CSS primitive inventory

`app/globals.css` dang chua gan nhu toan bo visual contract cua app. Cac nhom chinh:

- shell/layout:
  `app-shell`, `app-backdrop`, `page-frame`, `site-header`, `site-footer`
- typography/meta:
  `eyebrow`, `brand-title`, `display-title`, `section-title`, `section-copy`, `micro-label`, `mission-title`
- actions:
  `button-primary`, `button-secondary`, `button-ghost`, `nav-link`, `inline-link`
- cards/surfaces:
  `panel`, `panel-strong`, `detail-card`, `tool-card`, `mission-card`, `quick-ref-card`, `skill-card`, `timeline-card`, `reference-card`, `signal-card`, `stat-card`, `ops-card`
- status chips:
  `chip`, `outline-chip`, `status-chip`
- forms:
  `field`, `field-group`, `select`, `textarea`, `input-field`, `textarea-field`
- layout grids:
  `hero-grid`, `mission-grid`, `detail-grid`, `quick-ref-grid`, `ops-grid`, `skill-grid`, `timeline-grid`, `arena-layout`
- score/feedback:
  `score-band`, `score-grid`, `score-row`, `score-bar`, `score-fill`, `status-message`, `empty-state`

## Structural findings

### Diem manh

- Visual language kha nhat quan: warm neutral background, cyan/amber accent, rounded glass panels.
- Shell da on: sticky header, centered frame, footer navigation, reduced motion toggle.
- Workbench pages da co personality rieng, khong bi boilerplate.
- Reusable composites tot nhat hien tai la `MissionMap`, `SkillAtlasDirectory`, `SkillAtlasDetail`, `QuickRefWallet`.

### Diem yeu

- Chua co bridge primitive React components cho button, card, chip, form field.
- Nhieu `style={{ marginTop: ... }}` inline dang gan spacing contract vao page/component code.
- `globals.css` dang vua la token store, vua la primitive layer, vua la component layer.
- `ProgressRail` da viet nhung chua duoc dua vao shell, cho thay shell contract chua khoa xong.
- `missions/[slug]` va `ops` van la page markup thu cong, chua rut thanh composite ro rang.

### Ket luan inventory

Repo nay da co mot visual system rat ro, nhung chua phai design system ready. Viec refactor tiep theo khong phai la doi gu thiet ke, ma la dong goi lai contract:

- token contract
- primitive catalog
- composite catalog
- page pattern contract
