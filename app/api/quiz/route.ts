import { NextResponse } from "next/server"

const API_BASE = process.env.NEUROMAP_API_URL || process.env.NEXT_PUBLIC_NEUROMAP_API_URL || "http://127.0.0.1:5000"

export async function POST(request: Request) {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    const body = await request.json()
    const res = await fetch(`${API_BASE}/api/quiz`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(timeout)
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e: any) {
    const message = (e?.name === "AbortError")
      ? `Upstream timeout contacting Flask at ${API_BASE}. Ensure it is running.`
      : `Cannot reach Flask at ${API_BASE}. Start it or set NEUROMAP_API_URL. (${e?.message || "unknown error"})`
    return NextResponse.json({ status: "error", message }, { status: 502 })
  }
}


