# Study Buddy

Flashcards for UK school Years 1–4. A parent adds children, subjects, and shared year decks. Each child picks a named profile and can add personal cards on top of the year deck. Study mode flips cards and tracks Know / Still learning. Weekly words groups vocabulary Sunday–Saturday for revise and quiz.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4721](http://127.0.0.1:4721).

Without database env vars, the app stores data in **this browser only** (localStorage). That is the preview default.

## Share across devices (Vercel + Neon)

GitHub does not host a database. The small stack is: this Next.js app on Vercel, Postgres on Neon.

1. Create a GitHub repo for this project and import it on [Vercel](https://vercel.com).
2. Create a project on [Neon](https://neon.tech) and copy the connection string.
3. In Vercel → Project → Settings → Environment Variables, add **both**, enabled for **Production** (not Preview only):
   - `DATABASE_URL` — Neon **production/main** branch connection string (the Neon Vercel integration may also set `POSTGRES_URL`; either works)
   - `SESSION_SECRET` — a long random string (`openssl rand -hex 32`). Neon does not create this; without it the app will not use the database.
4. Redeploy the **Production** deployment. Open the production URL (`your-app.vercel.app`), not a unique preview URL (`your-app-git-….vercel.app`). Preview deploys can get a fresh empty Neon branch each time.

The browser talks only to the Next.js API. Neon credentials stay on the server. After you set a four-digit **family PIN**, the API sets an httpOnly session cookie (90 days). Enter that PIN once on each device; children then just pick their name.

If you forget the PIN, reset from parent settings while signed in, or clear `pin_hash` in the Neon SQL editor.

## How to use it

1. Set the family / parent PIN.
2. Add each child with a name, school year, and avatar.
3. Edit shared year decks (Maths and Reading are already there for Years 1–2).
4. A child picks their profile, opens a deck, and studies.
5. Year 4 Vocabulary: open **Cards**, then **Add words**. Paste one or many cards copied from XL Education. Shared words saved while Neon is connected appear on every signed-in device.
6. **Weekly words** groups vocabulary by the Sunday–Saturday week it was added. Revise or quiz that week.

## Stack

Next.js, TypeScript, Tailwind CSS, shadcn/ui. Optional Neon Postgres via Vercel.

Project memory for later sessions: [CLAUDE.md](./CLAUDE.md). Family user guide (GitHub Pages): [docs/index.html](./docs/index.html).
