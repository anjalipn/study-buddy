# Study Buddy

Flashcards for UK school Years 1–4. A parent (admin) adds children, subjects, and shared year decks. Each child picks a named profile — no passwords — and can add personal cards on top of the year deck. Study mode flips cards and tracks Know / Still learning.

Everything is stored in this browser with localStorage. There is no account service and no database.

Year 1 and Year 2 Maths and Reading decks are seeded so the app is usable as soon as a parent adds a child. Year 4 Vocabulary includes a first set of word cards.

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4721](http://127.0.0.1:4721).

## How to use it

1. Tap **I’m a parent** and set a four-digit PIN.
2. Add each child with a name, school year, and avatar.
3. Edit shared year decks (Maths and Reading are already there for Years 1–2).
4. On the home screen, a child picks their profile, opens a deck, and studies.
5. Year 4 Vocabulary: open **Cards**, then **Add words**. Paste one or many cards copied from XL Education (word, part of speech, level, definitions, examples). A parent adds them to the shared deck; a child adds them as personal cards. The XL website itself needs a login, so paste is the bulk import for now.
6. **Weekly words** is a separate section on the child’s home screen. Every vocabulary card stores the date it was added. Words are grouped Sunday–Saturday into this week, last week, and older weeks — a word added any day from Sunday through Saturday counts for that week. The child can open a word, revise that week’s cards, or take a multiple-choice quiz for that week.

Forgot the PIN? Reset this device from the PIN screen. That clears local data and restores the seeded decks.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui.

## Stack

Next.js, TypeScript, Tailwind CSS, and shadcn/ui.
