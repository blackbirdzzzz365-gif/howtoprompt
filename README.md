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
```

## Main routes

- `/`
- `/missions`
- `/missions/[slug]`
- `/prompt-lab`
- `/simulator`
- `/quick-ref`
- `/ops`

## Notes

- Progress duoc luu local trong browser va sync them vao `.data/runtime-store.json` qua API.
- MVP phase 1 uu tien deterministic evaluation thay vi LLM critique.
- Reduced motion toggle nam tren header.
