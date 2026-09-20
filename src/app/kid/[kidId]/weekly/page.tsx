import { WeeklyWordsPage } from "@/app/kid/[kidId]/weekly/weekly-words-page"

export default function Page({ params }: { params: Promise<{ kidId: string }> }) {
  return <WeeklyWordsPage params={params} />
}
