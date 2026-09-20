import { KidDeckPage } from "@/app/kid/[kidId]/deck/[deckId]/kid-deck-page"

export default function Page({
  params,
}: {
  params: Promise<{ kidId: string; deckId: string }>
}) {
  return <KidDeckPage params={params} />
}
