import type { AppData, Flashcard } from "@/lib/types"

function yearCards(
  deckId: string,
  pairs: [front: string, back: string][],
): Flashcard[] {
  return pairs.map(([front, back], index) => ({
    id: `${deckId}-c${String(index + 1).padStart(2, "0")}`,
    deckId,
    kidId: null,
    front,
    back,
  }))
}

export function createSeedData(): AppData {
  const subjects = [
    { id: "subject-maths", name: "Maths" },
    { id: "subject-reading", name: "Reading" },
  ]

  const decks = subjects.flatMap((subject) =>
    ([1, 2, 3, 4] as const).map((year) => ({
      id: `deck-y${year}-${subject.id.replace("subject-", "")}`,
      subjectId: subject.id,
      year,
      title:
        year === 1 && subject.id === "subject-maths"
          ? "Number facts"
          : year === 1 && subject.id === "subject-reading"
            ? "Tricky words"
            : year === 2 && subject.id === "subject-maths"
              ? "2, 5 and 10 times tables"
              : year === 2 && subject.id === "subject-reading"
                ? "Exception words"
                : `Year ${year} ${subject.name}`,
    })),
  )

  const cards: Flashcard[] = [
    ...yearCards("deck-y1-maths", [
      ["2 + 3", "5"],
      ["5 + 5", "10"],
      ["10 − 1", "9"],
      ["4 + 6", "10"],
      ["7 − 2", "5"],
      ["8 + 1", "9"],
      ["3 + 3", "6"],
      ["9 − 4", "5"],
      ["1 + 6", "7"],
      ["10 − 7", "3"],
    ]),
    ...yearCards("deck-y1-reading", [
      ["the", "the dog ran"],
      ["and", "cats and dogs"],
      ["said", "she said hello"],
      ["to", "go to school"],
      ["he", "he can hop"],
      ["she", "she can skip"],
      ["we", "we can play"],
      ["was", "it was hot"],
      ["you", "you can do it"],
      ["my", "this is my book"],
    ]),
    ...yearCards("deck-y2-maths", [
      ["2 × 3", "6"],
      ["2 × 7", "14"],
      ["5 × 4", "20"],
      ["5 × 8", "40"],
      ["10 × 6", "60"],
      ["10 × 9", "90"],
      ["2 × 10", "20"],
      ["5 × 5", "25"],
      ["4 × 5", "20"],
      ["7 × 10", "70"],
    ]),
    ...yearCards("deck-y2-reading", [
      ["because", "I stayed in because it rained."],
      ["people", "Many people were at the park."],
      ["could", "She could see the bird."],
      ["should", "You should pack your bag."],
      ["would", "He would like a pear."],
      ["who", "Who is at the door?"],
      ["whole", "I ate the whole apple."],
      ["any", "Have you got any pencils?"],
      ["many", "There are many books."],
      ["children", "The children lined up."],
    ]),
  ]

  return {
    version: 1,
    pin: null,
    kids: [],
    subjects,
    decks,
    cards,
    progress: [],
  }
}
