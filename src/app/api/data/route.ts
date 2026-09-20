import { NextResponse } from "next/server"

import { requireSession } from "@/lib/api-auth"
import { loadAppData, saveAppData } from "@/lib/db"
import type { AppData } from "@/lib/types"

export const dynamic = "force-dynamic"

export async function GET() {
  const denied = await requireSession()
  if (denied) return denied
  const data = await loadAppData()
  return NextResponse.json(data)
}

export async function PUT(request: Request) {
  const denied = await requireSession()
  if (denied) return denied
  let data: AppData
  try {
    data = (await request.json()) as AppData
  } catch {
    return NextResponse.json({ error: "Could not read the saved data." }, { status: 400 })
  }
  if (
    data?.version !== 1 ||
    !Array.isArray(data.kids) ||
    !Array.isArray(data.subjects) ||
    !Array.isArray(data.decks) ||
    !Array.isArray(data.cards) ||
    !Array.isArray(data.progress)
  ) {
    return NextResponse.json({ error: "That data did not look valid." }, { status: 400 })
  }
  await saveAppData(data)
  return NextResponse.json(await loadAppData())
}
