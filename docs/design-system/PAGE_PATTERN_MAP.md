# Page Pattern Map

## Muc dich

Moi page moi trong `howtoprompt-main` phai map vao mot pattern ro rang.
Khong duoc tao page theo kieu "xep class cho xong".

## Pattern summary

| Pattern ID | Pattern name | Dung cho | Current routes |
| --- | --- | --- | --- |
| `P0` | App shell | tat ca routes | all |
| `P1` | Hero landing | trang vao campaign / homepage | `/` |
| `P2` | Catalog index | map, list, browse | `/missions` |
| `P3` | Detail with sticky aside | entity detail + next action | `/missions/[slug]` |
| `P4` | Practice workbench | evaluate, simulate, thao tac co ket qua | `/prompt-lab`, `/simulator` |
| `P5` | Reference wallet | unlockable card collection | `/quick-ref` |
| `P6` | Hybrid ops dashboard | docs deck + telemetry | `/ops` |
| `P7` | Narrative quest board | story-led learning flow | `/social-listening-arena` |
| `P8` | Knowledge atlas directory | search + filter + browse | `/social-listening-arena/skills`, `/social-listening-arena/skills-vm-codex`, `/social-listening-arena/skills-vm-openclaw` |
| `P9` | Knowledge atlas detail | detail explorer + AI assist | `/social-listening-arena/skills/[slug]`, `/social-listening-arena/skills-vm-codex/[slug]`, `/social-listening-arena/skills-vm-openclaw/[slug]` |
| `P10` | Recovery fallback | 404 / empty high-level route | `not-found` |

## Pattern detail

### P0. App shell

- Required structure:
  `AppProvider` -> `app-shell` -> `app-backdrop` -> `SiteHeader` -> `page-frame` -> footer
- Required for:
  moi route app
- Do not:
  duplicate header, bypass `page-frame`, them page-level global nav rieng

### P1. Hero landing

- Dung khi:
  feature can mo dau mot campaign hoac product loop bang hero split layout
- Required building blocks:
  `PanelStrong`, `ButtonPrimary`, `ButtonSecondary`, `StatCard`, `SignalCard`
- Layout shape:
  hero split + section stack + CTA clusters + proof/stat surfaces
- Current route:
  `/`
- Future reuse:
  landing cho module hoc moi, app intro, campaign intro

### P2. Catalog index

- Dung khi:
  page chinh la browse mot tap entity co y nghia tien trinh
- Required building blocks:
  `PanelStrong`, `MissionMap`
- Layout shape:
  intro section -> catalog grid
- Current route:
  `/missions`
- Future reuse:
  skill paths, modules, lesson maps

### P3. Detail with sticky aside

- Dung khi:
  can mot body detail + mot sidebar de next action, trap list, related items
- Required building blocks:
  `DetailCard`, `ToolCard`, `ButtonPrimary`, `ButtonSecondary`
- Layout shape:
  `detail-grid` voi body trai va `sticky-console` phai
- Current route:
  `/missions/[slug]`
- Future reuse:
  lesson detail, playbook detail, guide detail
- Refactor note:
  nen extract thanh `MissionDetailLayout` truoc khi co them 2 page detail moi

### P4. Practice workbench

- Dung khi:
  user can nhap input, bam action, nhan ket qua, va doc guidance ben canh
- Required building blocks:
  `PromptLab` hoac `SimulatorPanel`
- Layout shape:
  body form / interaction + sticky aside ket qua / rubric / timeline
- Current routes:
  `/prompt-lab`, `/simulator`
- Future reuse:
  evaluator, wizard, practice sandbox, simulator
- Guardrail:
  khong dung pattern nay cho read-only docs page

### P5. Reference wallet

- Dung khi:
  can grid cac card unlockable, reusable, copy-safe
- Required building blocks:
  `QuickRefWallet`, `QuickRefCard`, `Chip`
- Layout shape:
  intro section -> wallet grid
- Current route:
  `/quick-ref`
- Future reuse:
  template wallet, command wallet, cheat sheet wallet

### P6. Hybrid ops dashboard

- Dung khi:
  can vua doc facts/commands vua xem so lieu hoac recent events
- Required building blocks:
  `DetailCard`, `OpsSummary`, `StatCard`, `TimelineCard`
- Layout shape:
  docs deck section -> telemetry section
- Current route:
  `/ops`
- Future reuse:
  operator dashboard, release deck, runtime overview
- Refactor note:
  pattern nay nen tach thanh `OpsFactDeck` + `OpsSnapshot`

### P7. Narrative quest board

- Dung khi:
  page day mot workflow phuc tap bang narrative roles, quest steps, good move / bad move
- Required building blocks:
  `SocialListeningArena`, `SignalCard`, `DetailCard`, `ButtonPrimary`
- Layout shape:
  quest rail + role grid + turn-by-turn details
- Current route:
  `/social-listening-arena`
- Future reuse:
  onboarding board, process story, role training
- Guardrail:
  chi dung khi storytelling la ban chat cua UX

### P8. Knowledge atlas directory

- Dung khi:
  can search + filter + browse mot knowledge catalog
- Required building blocks:
  `SkillAtlasDirectory`, `SkillAdvisorPanel`, `SkillCard`, `NavPill`
- Layout shape:
  intro + catalog switch + stats + toolbar + result grid + advisory aside
- Current routes:
  `/social-listening-arena/skills`
  `/social-listening-arena/skills-vm-codex`
  `/social-listening-arena/skills-vm-openclaw`
- Future reuse:
  playbook library, prompt library, policy library, component explorer

### P9. Knowledge atlas detail

- Dung khi:
  can mot detail explorer cho mot entity co raw source, sections, related items, AI explain
- Required building blocks:
  `SkillAtlasDetail`, `SkillExplainPanel`, `DetailCard`, `ToolCard`, `CodeBlockPrompt`
- Layout shape:
  detail body + helper aside
- Current routes:
  `/social-listening-arena/skills/[slug]`
  `/social-listening-arena/skills-vm-codex/[slug]`
  `/social-listening-arena/skills-vm-openclaw/[slug]`
- Future reuse:
  doc explorer, policy explorer, prompt detail, template detail

### P10. Recovery fallback

- Dung khi:
  404, route not found, hoac fallback route can dua user ve flow chinh
- Required building blocks:
  `PanelStrong`, `ButtonPrimary`, `ButtonSecondary`
- Layout shape:
  mot section recovery duy nhat, CTA ro
- Current route:
  `not-found`

## Feature-to-pattern decision guide

| Neu feature moi la... | Thi pattern mac dinh la... |
| --- | --- |
| campaign entry / onboarding hero | `P1` |
| map / index cua lesson, stage, module | `P2` |
| detail page co action sidebar | `P3` |
| evaluator, simulator, form-driven practice | `P4` |
| card wallet co unlock state | `P5` |
| runtime / metrics / ops deck | `P6` |
| workflow hoc theo storytelling va roles | `P7` |
| searchable knowledge library | `P8` |
| doc explorer cua mot item | `P9` |
| error / fallback | `P10` |

## Rules truoc khi tao page moi

1. Chon mot pattern ID.
2. Liet ke approved components se dung.
3. Neu page can ket hop 2 pattern, phai co mot pattern chinh va mot pattern phu.
4. Neu page khong fit pattern nao, phai mo de xuat pattern moi truoc khi code.
