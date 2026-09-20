import { KidHomePage } from "@/app/kid/[kidId]/kid-home-page"

export default function Page({
  params,
}: {
  params: Promise<{ kidId: string }>
}) {
  return <KidHomePage params={params} />
}
