import { StudyPage } from "@/app/kid/[kidId]/study/[deckId]/study-page"

export default function Page({
  params,
}: {
  params: Promise<{ kidId: string; deckId: string }>
}) {
  return <StudyPage params={params} />
}
