import type { WordDetails } from "@/lib/types"

const PARTS_OF_SPEECH = new Set([
  "noun",
  "verb",
  "adjective",
  "adverb",
  "pronoun",
  "preposition",
  "conjunction",
  "interjection",
  "determiner",
  "article",
])

const SECTION_HEADERS = [
  "definitions",
  "usage context",
  "synonyms",
  "antonyms",
  "additional info",
  "example sentences",
] as const

type Section = (typeof SECTION_HEADERS)[number]

export type ParsedXlWord = {
  term: string
  details: WordDetails
}

function normalize(text: string): string[] {
  return text
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trim())
}

function headerName(line: string): Section | null {
  const cleaned = line.replace(/:$/, "").trim().toLowerCase()
  return SECTION_HEADERS.find((name) => name === cleaned) ?? null
}

function isPartOfSpeech(line: string): boolean {
  return PARTS_OF_SPEECH.has(line.toLowerCase())
}

function isIgnorable(line: string): boolean {
  return line.length === 0 || /^image not available$/i.test(line)
}

function looksLikeCardStart(lines: string[], index: number): boolean {
  const term = lines[index]
  if (!term || term.includes(":") || headerName(term) || isPartOfSpeech(term)) {
    return false
  }
  if (/^level\s+\d+/i.test(term) || /^image not available$/i.test(term)) {
    return false
  }
  let sawPos = false
  for (let i = index + 1; i < Math.min(index + 10, lines.length); i += 1) {
    const line = lines[i]
    if (isIgnorable(line)) continue
    if (isPartOfSpeech(line)) {
      sawPos = true
      continue
    }
    if (sawPos && /^level\s+\d+/i.test(line)) return true
    return false
  }
  return false
}

function takeUntilHeader(lines: string[], start: number): {
  values: string[]
  next: number
} {
  const values: string[] = []
  let i = start
  while (i < lines.length) {
    const line = lines[i]
    if (headerName(line) || looksLikeCardStart(lines, i)) break
    if (!isIgnorable(line)) values.push(line)
    i += 1
  }
  return { values, next: i }
}

function parseTheme(lines: string[], start: number): {
  theme?: WordDetails["theme"]
  next: number
} {
  let i = start
  while (i < lines.length && isIgnorable(lines[i])) i += 1
  if (!lines[i] || !lines[i].endsWith(":") || headerName(lines[i])) {
    return { next: i }
  }
  const name = lines[i].slice(0, -1).trim()
  i += 1
  const values: string[] = []
  while (i < lines.length) {
    if (headerName(lines[i]) || looksLikeCardStart(lines, i)) break
    if (!isIgnorable(lines[i])) values.push(lines[i])
    i += 1
  }
  return { theme: { name, values }, next: i }
}

function parseCardSlice(lines: string[]): ParsedXlWord | null {
  if (lines.length === 0) return null
  const term = lines[0]
  let i = 1
  const partsOfSpeech: string[] = []
  while (i < lines.length && (isIgnorable(lines[i]) || isPartOfSpeech(lines[i]))) {
    if (isPartOfSpeech(lines[i])) partsOfSpeech.push(lines[i].toLowerCase())
    i += 1
  }
  const levelMatch = lines[i]?.match(/^level\s+(\d+)/i)
  if (!term || partsOfSpeech.length === 0 || !levelMatch) return null
  const level = levelMatch[1]
  i += 1
  let band = "Intermediate"
  const bandMatch = lines[i]?.match(/^\((.+)\)$/)
  if (bandMatch) {
    band = bandMatch[1]
    i += 1
  }

  const themed = parseTheme(lines, i)
  i = themed.next

  const sections: Record<Section, string[]> = {
    definitions: [],
    "usage context": [],
    synonyms: [],
    antonyms: [],
    "additional info": [],
    "example sentences": [],
  }

  while (i < lines.length) {
    const header = headerName(lines[i])
    if (!header) {
      i += 1
      continue
    }
    i += 1
    const { values, next } = takeUntilHeader(lines, i)
    sections[header] = values
    i = next
  }

  if (sections.definitions.length === 0) return null

  return {
    term,
    details: {
      partsOfSpeech,
      level,
      band,
      theme: themed.theme,
      definitions: sections.definitions,
      usageContext: sections["usage context"].join(" ") || undefined,
      synonyms: sections.synonyms,
      antonyms: sections.antonyms,
      additionalInfo: sections["additional info"].join(" ") || undefined,
      examples: sections["example sentences"],
    },
  }
}

export function parseXlWordPaste(text: string): {
  words: ParsedXlWord[]
  error: string | null
} {
  const lines = normalize(text)
  const starts: number[] = []
  for (let i = 0; i < lines.length; i += 1) {
    if (looksLikeCardStart(lines, i)) starts.push(i)
  }

  if (starts.length === 0) {
    return {
      words: [],
      error:
        "That paste did not look like an XL word card. Copy the word, part of speech, level, definitions, and examples, then try again.",
    }
  }

  const words: ParsedXlWord[] = []
  for (let s = 0; s < starts.length; s += 1) {
    const end = s + 1 < starts.length ? starts[s + 1] : lines.length
    const parsed = parseCardSlice(lines.slice(starts[s], end))
    if (parsed) words.push(parsed)
  }

  if (words.length === 0) {
    return {
      words: [],
      error: "Found word headings, but could not read their definitions.",
    }
  }

  return { words, error: null }
}

export function detailsFromForm(input: {
  term: string
  partsOfSpeech: string
  level: string
  band: string
  themeName: string
  themeValues: string
  definitions: string
  usageContext: string
  synonyms: string
  antonyms: string
  additionalInfo: string
  examples: string
}): ParsedXlWord | null {
  const term = input.term.trim()
  const partsOfSpeech = input.partsOfSpeech
    .split(/[,\n]/)
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean)
  const definitions = input.definitions
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  if (!term || partsOfSpeech.length === 0 || !input.level.trim() || definitions.length === 0) {
    return null
  }
  const themeValues = input.themeValues
    .split(/[,\n]/)
    .map((value) => value.trim())
    .filter(Boolean)
  return {
    term,
    details: {
      partsOfSpeech,
      level: input.level.trim(),
      band: input.band.trim() || "Intermediate",
      theme:
        input.themeName.trim() || themeValues.length > 0
          ? {
              name: input.themeName.trim() || "theme",
              values: themeValues,
            }
          : undefined,
      definitions,
      usageContext: input.usageContext.trim() || undefined,
      synonyms: splitLines(input.synonyms),
      antonyms: splitLines(input.antonyms),
      additionalInfo: input.additionalInfo.trim() || undefined,
      examples: splitLines(input.examples),
    },
  }
}

function splitLines(value: string): string[] {
  return value
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}
