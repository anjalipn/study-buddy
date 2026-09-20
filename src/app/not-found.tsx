import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-5 px-6 py-10">
      <h1 className="font-heading text-2xl font-semibold">Page not found</h1>
      <p className="text-base leading-7 text-muted-foreground">
        That page is not part of Study Buddy. Go back to the profiles screen to
        pick a child or open parent settings.
      </p>
      <Button asChild className="h-12 w-fit px-5 text-base">
        <Link href="/">Back to profiles</Link>
      </Button>
    </div>
  )
}
