# Study Buddy — project memory

Read this before changing the app. Anjali (parent) built this for her children (UK Years 1–4). GitHub: https://github.com/anjalipn/study-buddy

`AGENTS.md` is Next.js framework boilerplate. **This file is the product context.**

## What it is

A flashcard web app. A parent adds children and shared year decks. Each child picks a named profile (no child password) and studies. Year 4 Vocabulary cards match XL Education layout. Weekly words group vocabulary Sunday–Saturday for revise and quiz.

## Stack

- Next.js 16 App Router, React 19, TypeScript, Tailwind 4, shadcn/ui
- Dev server: `npm run dev` → http://127.0.0.1:4721
- Data: **Neon Postgres** in production (Vercel). **localStorage** only when no database URL + `SESSION_SECRET`
- Auth: four-digit **family PIN** checked on the server → **httpOnly session cookie**. Not an API key. Neon `DATABASE_URL` never goes to the browser.

## Important product rules

- Weekly lists run **Sunday–Saturday**. A word added any day in that range belongs to that week.
- Vocabulary `addedAt` is stored on each card. Seed Year 4 words: darkly, boredom, angry, library, mention.
- XL bulk import is paste (the XL site needs a login). Parser: `src/lib/parse-xl-words.ts`
- CSV-in-GitHub was rejected: the browser cannot write the repo. Shared words go through the API → Neon.
- Do not add a second component library. Do not add extra auth products.

## Key routes and files

| Area | Path |
| --- | --- |
| Kid home | `src/app/kid/[kidId]/kid-home-page.tsx` |
| Weekly words | `src/app/kid/[kidId]/weekly/` |
| Study / quiz | `src/components/study-session.tsx`, `src/components/week-quiz.tsx` |
| Weeks | `src/lib/weeks.ts` (`startOfWeek` = Sunday) |
| Store | `src/lib/store.tsx` (local vs `db` mode) |
| Neon | `src/lib/db.ts` |
| Session cookie | `src/lib/session.ts` |
| Health | `GET /api/health` → `{ database, hasDatabaseUrl, hasSessionSecret, connected }` |
| User guide (GitHub Pages) | `docs/index.html` |

## Persistence (do not regress)

Neon is **on** only if a database URL **and** `SESSION_SECRET` exist. URL may be any of: `DATABASE_URL_UNPOOLED`, `POSTGRES_URL_NON_POOLING`, `DATABASE_URL`, `POSTGRES_URL`, `POSTGRES_PRISMA_URL`.

If Neon is intended but misconfigured, **fail visibly**. Do not silently fall back to localStorage (that made every Vercel redeploy look empty).

Empty-database seed **inserts** starter decks; it must not `TRUNCATE` on boot. Full replace + truncate is only for authenticated `PUT /api/data`.

## Vercel + Neon checklist

1. Production env vars (not Preview-only): database URL **and** `SESSION_SECRET` (`openssl rand -hex 32`).
2. Connection string must be Neon **production/main**, not a preview branch.
3. Use the production host (`*.vercel.app`), not `*-git-*.vercel.app`.
4. Parent settings should say **Shared database**, not “this browser only”. Amber banner on the home screen means Neon is off.

`SESSION_SECRET` is **not** the family PIN and **not** the Neon password. Changing it only forces a new PIN login; it does not wipe Postgres.

Forgot PIN: reset from parent settings while signed in, or clear `pin_hash` in Neon SQL.

## Git

- Repo: `anjalipn/study-buddy`
- Working branch used in the original build: `cursor/study-buddy-d549` (also pushed to `main`)
- Cursor “Create repo” publishes to Cursor’s git (Origin), not GitHub. GitHub Pages ≠ the Next app; the live app is Vercel.

## GitHub Pages (this user guide)

Folder `docs/` is a static site. On GitHub: **Settings → Pages → Deploy from a branch → `main` / `/docs`**. Site: `https://anjalipn.github.io/study-buddy/`

## What not to do

- Do not put secrets in the repo (`.gitignore` ignores `.env*`, keeps `.env.example`).
- Do not talk to Neon from the browser.
- Do not re-seed with TRUNCATE when tables already have kids, cards, or a PIN.
- Do not assume preview deploy URLs share the production database.
