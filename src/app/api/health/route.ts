import { NextResponse } from "next/server"

import { databaseHealth } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json(await databaseHealth())
}
