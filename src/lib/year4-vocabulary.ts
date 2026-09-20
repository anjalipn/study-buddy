import type { Flashcard, WordDetails } from "@/lib/types"

export const YEAR_4_VOCAB_DECK_ID = "deck-y4-reading"
export const YEAR_4_VOCAB_TITLE = "Year 4 Vocabulary"

type WordInput = {
  word: string
  details: WordDetails
}

export function formatWordBack(details: WordDetails): string {
  const lines: string[] = [
    details.partsOfSpeech.join(", "),
    `Level ${details.level} (${details.band})`,
  ]
  if (details.theme) {
    lines.push(`${details.theme.name}: ${details.theme.values.join(", ")}`)
  }
  lines.push("", "Definitions:")
  for (const definition of details.definitions) {
    lines.push(`• ${definition}`)
  }
  if (details.usageContext) {
    lines.push("", "Usage:", details.usageContext)
  }
  if (details.synonyms.length > 0) {
    lines.push("", "Synonyms:", details.synonyms.join(", "))
  }
  if (details.antonyms.length > 0) {
    lines.push("", "Antonyms:", details.antonyms.join(", "))
  }
  if (details.additionalInfo) {
    lines.push("", details.additionalInfo)
  }
  if (details.examples.length > 0) {
    lines.push("", "Examples:")
    for (const example of details.examples) {
      lines.push(`• ${example}`)
    }
  }
  return lines.join("\n")
}

function wordCard(input: WordInput): Flashcard {
  return {
    id: `word-y4-${input.word.toLowerCase()}`,
    deckId: YEAR_4_VOCAB_DECK_ID,
    kidId: null,
    front: input.word,
    back: formatWordBack(input.details),
    word: input.details,
    addedAt: new Date().toISOString(),
  }
}

export const YEAR_4_VOCABULARY_CARDS: Flashcard[] = [
  wordCard({
    word: "darkly",
    details: {
      partsOfSpeech: ["adverb"],
      level: "6",
      band: "Intermediate",
      theme: { name: "emotion", values: ["shadowy", "ominous"] },
      definitions: [
        "in a manner that is shadowy, gloomy, or mysterious.",
        "in a way that suggests sadness or negativity.",
        "in a gloomy or ominous manner.",
      ],
      usageContext: "used in storytelling or mystery genres.",
      synonyms: ["gloomily", "ominously", "somberly", "sadly"],
      antonyms: ["brightly", "cheerfully", "happily", "lightly"],
      additionalInfo:
        "often used in descriptions of mood or setting in literature.",
      examples: [
        "The sky darkly loomed over the city as the storm approached.",
        "She smiled darkly, knowing what would happen next.",
        "The atmosphere in the room was darkly foreboding.",
        "He looked darkly at the situation, knowing it was bad.",
      ],
    },
  }),
  wordCard({
    word: "boredom",
    details: {
      partsOfSpeech: ["noun"],
      level: "5",
      band: "Intermediate",
      theme: { name: "emotion", values: ["tedious", "monotonous"] },
      definitions: [
        "a state of being bored or uninterested in something.",
        "lack of interest or excitement.",
        "a feeling of dissatisfaction or ennui.",
      ],
      usageContext: "often used in school-related contexts.",
      synonyms: ["disinterest", "tedium", "ennui", "restlessness"],
      antonyms: ["excitement", "interest", "passion", "enthusiasm"],
      additionalInfo:
        "commonly used to describe a lack of interest or engagement.",
      examples: [
        "Boredom crept over him as the class dragged on.",
        "She felt a wave of boredom as she waited for her turn.",
        "The movie was so boring it filled me with boredom.",
        "He couldnt shake the boredom from his face.",
      ],
    },
  }),
  wordCard({
    word: "angry",
    details: {
      partsOfSpeech: ["adjective"],
      level: "5",
      band: "Intermediate",
      theme: { name: "emotion", values: ["enraged", "irritated"] },
      definitions: [
        "feeling strong displeasure or hostility.",
        "showing frustration or rage.",
        "a strong feeling of displeasure.",
      ],
      usageContext: "common in everyday conversations.",
      synonyms: ["furious", "mad", "irritated", "enraged"],
      antonyms: ["calm", "happy", "content", "pleased"],
      additionalInfo: "frequently used to describe strong emotions.",
      examples: [
        "She was angry when she found out her favourite toy was broken.",
        "The teacher was angry after the students kept talking.",
        "He felt angry at the unfair decision.",
        "I could see the angry look on his face as he stormed out.",
      ],
    },
  }),
  wordCard({
    word: "library",
    details: {
      partsOfSpeech: ["noun"],
      level: "4",
      band: "Intermediate",
      theme: { name: "Space", values: ["books", "reading", "study"] },
      definitions: [
        "a building or room containing collections of books and media",
        "a collection of literary resources",
        "a place for reading, study, or research",
      ],
      usageContext: "School/Research",
      synonyms: ["collection", "archive", "repository", "bookstore"],
      antonyms: [],
      additionalInfo: "often used in educational and public contexts",
      examples: [
        "She borrowed a book from the library",
        "The library is open until 8 pm today",
        "He spends a lot of time in the library",
        "The library offers digital resources",
      ],
    },
  }),
  wordCard({
    word: "mention",
    details: {
      partsOfSpeech: ["verb", "noun"],
      level: "4",
      band: "Intermediate",
      theme: { name: "Communication", values: ["say", "refer", "speak-of"] },
      definitions: [
        "refer to something briefly and without going into detail",
        "a reference to something",
        "an act of referring to something",
      ],
      usageContext: "Stories/Conversations",
      synonyms: ["refer", "cite", "allude", "hint"],
      antonyms: ["ignore", "overlook", "neglect", "disregard"],
      additionalInfo: "often used in contexts of communication",
      examples: [
        "She mentioned the meeting during lunch",
        "He got a mention in the report",
        "The document mentions the new policy",
        "Did you mention this to anyone else?",
      ],
    },
  }),
]
