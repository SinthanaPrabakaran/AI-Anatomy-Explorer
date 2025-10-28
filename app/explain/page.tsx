"use client"

import { useState } from "react"

const API_BASE = "" // use Next.js internal proxy routes

export default function ExplainPage() {
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{ role: "user" | "assistant"; content: string }[]>([])

  async function send() {
    if (!message.trim()) return
    const prompt = message
    setMessage("")
    setError(null)
    setLoading(true)
    setHistory((h) => [...h, { role: "user", content: prompt }])
    try {
      const res = await fetch(`/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: prompt }),
      })
      const data = await res.json()
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to get explanation")
      }
      setHistory((h) => [...h, { role: "assistant", content: data.response as string }])
    } catch (e: any) {
      setError(e?.message || "Failed to contact chat service. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-blue-500/10 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Smart Explanations</span>
          </h1>
          <p className="text-center text-gray-400 mb-6">Ask anatomy questions and get concise answers</p>

          <div className="glass-dark border border-cyan-400/30 rounded-xl p-4 mb-4 flex gap-3">
            <input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask any anatomy question..."
              className="flex-1 p-3 rounded-lg bg-black/40 border border-cyan-400/30 text-white"
              onKeyDown={(e) => { if (e.key === "Enter") send() }}
            />
            <button onClick={send} disabled={loading} className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg disabled:opacity-50">
              {loading ? "Sending..." : "Send"}
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-red-300 border border-red-400/50 bg-red-500/10 mb-4">{error}</div>
          )}

          <div className="glass-dark border border-purple-400/30 rounded-xl p-6 space-y-4">
            {history.length === 0 && (
              <div className="text-gray-400">No messages yet. Try: "Explain the blood flow through the heart."</div>
            )}
            {history.map((m, idx) => (
              <div key={idx} className={m.role === "user" ? "text-white" : "text-cyan-200"}>
                <div className="text-xs uppercase tracking-wider text-gray-400 mb-1">{m.role === "user" ? "You" : "Assistant"}</div>
                <div className="whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}



