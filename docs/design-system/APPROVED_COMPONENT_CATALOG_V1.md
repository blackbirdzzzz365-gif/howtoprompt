# Approved Component Catalog V1

## Muc dich

Catalog nay la danh sach component duoc phep dung cho feature moi.
Neu khong co trong catalog, mac dinh la `chua duoc phep` cho toi khi duoc bo sung vao design system.

## Status labels

- `approved`: da co implementation ro rang, duoc dung truc tiep
- `approved-bridge`: chua tach thanh React primitive rieng, nhung da duoc xem la contract chuan
- `hold`: da co code nhung chua duoc rollout lam contract
- `extract-next`: can tach ra thanh reusable component trong dot refactor tiep theo

## Foundation contracts

| Canonical component | Current source | Status | Use when | Notes |
| --- | --- | --- | --- | --- |
| `AppShell` | `app/layout.tsx` + `SiteHeader` + footer | approved | moi route app | Khong page nao duoc tu dung shell rieng |
| `AcademyProgressProvider` | `components/app-provider.tsx` | approved | moi page can progress, telemetry, reduced motion | Foundation state contract |
| `PrimaryHeader` | `components/site-header.tsx` | approved | global navigation | Chua tach `nav item` thanh primitive rieng |
| `PageFrame` | `.page-frame` | approved-bridge | wrap main content | Dang la CSS primitive bridge |

## Approved bridge primitives

| Canonical component | Current source | Status | Use when | Khong dung cho |
| --- | --- | --- | --- | --- |
| `ButtonPrimary` | `.button-primary` | approved-bridge | CTA chinh tren page va workbench | action thu cap, tertiary nav |
| `ButtonSecondary` | `.button-secondary` | approved-bridge | secondary CTA, list actions, related links | CTA chinh duy nhat cua page |
| `ButtonGhost` | `.button-ghost` | approved-bridge | low-emphasis action | action quan trong can contrast cao |
| `NavPill` | `.nav-link` | approved-bridge | header nav, catalog switcher, filter pill | submit action |
| `Chip` | `.chip` | approved-bridge | compact metadata | interactive nav |
| `OutlineChip` | `.outline-chip` | approved-bridge | secondary metadata | status success quan trong |
| `StatusChip` | `.status-chip` | approved-bridge | completion/unlock state | generic metadata |
| `Panel` | `.panel` | approved-bridge | major section container | small inline group |
| `PanelStrong` | `.panel.panel-strong` | approved-bridge | key hero, key section, workbench container | nested tiny card |
| `DetailCard` | `.detail-card` | approved-bridge | structured content block | top-level hero section |
| `ToolCard` | `.tool-card` | approved-bridge | sidebar helper, action toolbox | primary page body |
| `MissionCard` | `.mission-card` | approved-bridge | stage grid item | generic article card |
| `QuickRefCard` | `.quick-ref-card` | approved-bridge | unlockable cheat sheet | metrics tile |
| `SkillCard` | `.skill-card` | approved-bridge | searchable knowledge list item | generic promo card |
| `ReferenceCard` | `.reference-card` | approved-bridge | source doc / recommendation item | hero card |
| `SignalCard` | `.signal-card` | approved-bridge | short highlighted concept | long-form detail body |
| `StatCard` | `.stat-card` | approved-bridge | metric summary | dense article content |
| `TimelineCard` | `.timeline-card` | approved-bridge | event state, score result | wide section wrapper |
| `InputField` | `.input-field` | approved-bridge | single-line text input | multiline need |
| `SelectField` | `.select` | approved-bridge | finite option choice | free text |
| `TextareaField` | `.textarea`, `.textarea-field` | approved-bridge | prompt input, long request | tiny one-line input |
| `EmptyState` | `.empty-state` | approved-bridge | no data / no result / loading fallback | fatal error page |
| `StatusMessage` | `.status-message` | approved-bridge | short inline process feedback | rich validation summary |
| `CodeBlockPrompt` | `.example-prompt` | approved-bridge | command/prompt/raw doc preview | editable field |
| `ScoreBand` | `.score-band` | approved-bridge | evaluation outcome band | generic badge |

## Approved composites

| Component | Status | Use when | Main inputs | Notes |
| --- | --- | --- | --- | --- |
| `MissionMap` | approved | can present stage progression / entry map | `missions`, `compact?` | Composite tot nhat de tai su dung cho stage systems |
| `PathChooser` | approved | can pick 1 trong nhieu learning / journey path | `paths` | Gop UI + progress action |
| `QuickRefWallet` | approved | can show unlockable reference cards | `items` | Hop cho handbook-style unlock content |
| `OpsSummary` | approved | can show telemetry snapshot + recent feed | fetch tu `/api/ops/summary` | Nen tach card primitives sau |
| `SkillAdvisorPanel` | approved | can ask AI de shortlist skill/doc | `catalogId`, `apiBasePath`, `detailBasePath` | AI-assisted aside |
| `SkillExplainPanel` | approved | can ask AI explain chi tiet mot entity | `catalogId`, `apiBasePath`, `skillSlug` | Detail-page aside |
| `SkillAtlasDirectory` | approved | can search/filter/list knowledge entities | catalog metadata + list items | Strong candidate de generalize thanh directory pattern |
| `SkillAtlasDetail` | approved | can doc chi tiet mot knowledge entity | catalog metadata + entity detail | Strong candidate de generalize thanh detail explorer |
| `PromptLab` | approved | feature la evaluator/workbench co form + result sidebar | internal state + API calls | Page-level workbench, khong dung nhu card nho |
| `SimulatorPanel` | approved | feature la branch-choice simulator | query param + API calls | Page-level workbench |
| `SocialListeningArena` | approved | feature la quest board / scenario narrative | local config + progress events | Rat opinionated, khong dung cho CRUD page thong thuong |
| `ProgressRail` | hold | can show campaign progress o shell | progress state | Chi rollout sau khi chot shell placement |

## Components can dung truoc khi dev feature

| Feature need | Chon component truoc | Backup duoc phep |
| --- | --- | --- |
| Hero entry page | `PanelStrong` + `ButtonPrimary` + `ButtonSecondary` + `StatCard` | `SignalCard` cho sub-sections |
| Learning catalog | `MissionMap` | `MissionCard` grid neu can catalog moi |
| Unlockable references | `QuickRefWallet` | `QuickRefCard` bridge primitive |
| Prompt practice feature | `PromptLab` pattern | `DetailCard` + `ToolCard` + form primitives |
| Choice simulator | `SimulatorPanel` pattern | `TimelineCard` + `ScoreBand` |
| Searchable knowledge directory | `SkillAtlasDirectory` | `SkillCard` + `SkillAdvisorPanel` |
| Knowledge detail page | `SkillAtlasDetail` | `DetailCard` + `SkillExplainPanel` |
| Metrics / ops view | `OpsSummary` | `StatCard` + `TimelineCard` |
| Story / quest UI | `SocialListeningArena` | `SignalCard` + `DetailCard` |

## Khong duoc lam trong v1

- Tao mot button variant moi chi de doi mau.
- Tao card moi bang cach copy `detail-card` roi sua tay trong page.
- Nhung them form styles truc tiep vao page component.
- Tao mot knowledge directory moi ma khong dua tren `SkillAtlasDirectory` pattern.
- Dung `SocialListeningArena` nhu mot general dashboard.

## Extraction backlog ngay sau v1

1. Extract `Button`, `Chip`, `SurfaceCard`, `Field` thanh React bridge primitives.
2. Extract `MissionDetailSidebar` tu route `/missions/[slug]`.
3. Extract `OpsDeckSection` tu route `/ops`.
4. Xac dinh co dua `ProgressRail` vao shell hay bo han.
