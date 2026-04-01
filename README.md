# OpenClaw x Codex Mission Control Academy

Interactive website phase 1 de bien `OPENCLAW_CODEX_USER_GUIDE.md` thanh:

- mission-first onboarding
- Prompt Lab co deterministic scoring
- hidden-system simulator
- quick ref wallet
- progress + telemetry nhe

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- Zod
- File-backed runtime store cho local MVP

## Run local

```bash
cd /Users/nguyenquocthong/project/setup-workflow/site
pnpm install
pnpm dev
```

App chay mac dinh tai `http://localhost:3000`.

## Scripts

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm sync:skills
```

## Main routes

- `/`
- `/missions`
- `/missions/[slug]`
- `/prompt-lab`
- `/social-listening-arena`
- `/social-listening-arena/skills`
- `/social-listening-arena/skills/[slug]`
- `/simulator`
- `/quick-ref`
- `/ops`

## Notes

- Progress duoc luu local trong browser va sync them vao `.data/runtime-store.json` qua API.
- Skill Atlas duoc sync tu local Codex skills thanh `data/skill-atlas.generated.json` bang `pnpm sync:skills`.
- AI advisor/explainer goi `https://llm.chiasegpu.vn/v1/chat/completions`; API key duoc user nhap truc tiep tren web.
- MVP phase 1 uu tien deterministic evaluation thay vi LLM critique.
- Reduced motion toggle nam tren header.
