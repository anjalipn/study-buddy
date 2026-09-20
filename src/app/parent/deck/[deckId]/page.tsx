import { ParentDeckPage } from "@/app/parent/deck/[deckId]/parent-deck-page"

export default function Page({
  params,
}: {
  params: Promise<{ deckId: string }>
}) {
  return <ParentDeckPage params={params} />
}
