import type { WordDetails } from "@/lib/types"
import { cn } from "@/lib/utils"

export function VocabularyCard({
  term,
  word,
  addedOn,
  className,
}: {
  term: string
  word: WordDetails
  addedOn?: string
  className?: string
}) {
  return (
    <article
      className={cn(
        "rounded-2xl bg-white px-5 py-6 text-left text-[#2d3340] sm:px-8 sm:py-7",
        className,
      )}
    >
      <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">{term}</h2>
      {addedOn ? (
        <p className="mt-2 text-sm text-[#6b7280]">Added {addedOn}</p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {word.partsOfSpeech.map((part) => (
          <span
            key={part}
            className="rounded-md bg-[#e8f0ff] px-2.5 py-1 text-sm font-medium text-[#4d7cff]"
          >
            {part}
          </span>
        ))}
        <span className="text-sm text-[#6b7280]">
          <span className="font-semibold text-[#4d7cff]">Level {word.level}</span>{" "}
          ({word.band})
        </span>
      </div>

      {word.theme ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-[#6b7280]">{word.theme.name}:</span>
          {word.theme.values.map((value) => (
            <span
              key={value}
              className="rounded-full bg-[#eef0f3] px-2.5 py-0.5 text-[#5b6472]"
            >
              {value}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 grid gap-8 border-t border-[#eceff3] pt-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.9fr)]">
        <div className="space-y-5">
          <section>
            <h3 className="font-semibold">Definitions:</h3>
            <ol className="mt-2 list-decimal space-y-1 pl-5 leading-7 text-[#4b5563]">
              {word.definitions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </section>
          {word.usageContext ? (
            <section>
              <h3 className="font-semibold">Usage Context:</h3>
              <p className="mt-2 rounded-lg bg-[#e8f0ff] px-4 py-3 text-[#4d7cff]">
                {word.usageContext}
              </p>
            </section>
          ) : null}
        </div>

        <div className="space-y-5">
          {word.synonyms.length > 0 ? (
            <section>
              <h3 className="font-semibold">Synonyms:</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {word.synonyms.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-[#e5f8ea] px-2.5 py-1 text-sm text-[#2f9e5f]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
          {word.antonyms.length > 0 ? (
            <section>
              <h3 className="font-semibold">Antonyms:</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {word.antonyms.map((item) => (
                  <span
                    key={item}
                    className="rounded-md bg-[#fde8e8] px-2.5 py-1 text-sm text-[#e05a5a]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
          {word.additionalInfo ? (
            <section className="rounded-xl bg-[#fff6d6] px-4 py-3 text-[#c48a12]">
              <h3 className="font-semibold">Additional Info:</h3>
              <p className="mt-1 leading-6">{word.additionalInfo}</p>
            </section>
          ) : null}
        </div>
      </div>

      {word.examples.length > 0 ? (
        <section className="mt-6 border-t border-[#eceff3] pt-5">
          <h3 className="font-semibold">Example Sentences:</h3>
          <ol className="mt-2 list-decimal space-y-1 pl-5 leading-7 text-[#4b5563]">
            {word.examples.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      ) : null}
    </article>
  )
}
