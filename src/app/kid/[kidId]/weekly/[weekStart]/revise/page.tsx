import { WeeklyRevisePage } from "@/app/kid/[kidId]/weekly/[weekStart]/revise/weekly-revise-page"

export default function Page({
  params,
}: {
  params: Promise<{ kidId: string; weekStart: string }>
}) {
  return <WeeklyRevisePage params={params} />
}
