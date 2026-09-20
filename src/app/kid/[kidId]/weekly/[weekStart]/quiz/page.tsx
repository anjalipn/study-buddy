import { WeeklyQuizPage } from "@/app/kid/[kidId]/weekly/[weekStart]/quiz/weekly-quiz-page"

export default function Page({
  params,
}: {
  params: Promise<{ kidId: string; weekStart: string }>
}) {
  return <WeeklyQuizPage params={params} />
}
