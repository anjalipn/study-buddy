import type { Metadata } from "next"
import { Figtree, Fraunces } from "next/font/google"

import { Providers } from "@/components/providers"
import "./globals.css"

const sans = Figtree({
  variable: "--font-sans",
  subsets: ["latin"],
})

const heading = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Study Buddy",
  description:
    "Flashcards for UK Years 1–4. A parent adds children, subjects, and year decks; kids study with big, simple cards.",
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-GB"
      className={`${sans.variable} ${heading.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
