import { NextResponse } from "next/server"

import { isDatabaseConfigured } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ database: isDatabaseConfigured() })
}
