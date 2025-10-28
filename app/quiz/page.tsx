"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"

type QuizItem = {
  question: string
  options: string[]
  answer: string
  explanation: string
}

const API_BASE = "" // use Next.js internal proxy routes

export default function QuizPage() {
  const [organ, setOrgan] = useState("heart")
  const [difficulty, setDifficulty] = useState("medium")
  const [numQuestions, setNumQuestions] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<QuizItem[] | null>(null)
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const currentItem = useMemo(() => (quiz ? quiz[current] : null), [quiz, current])

  async function generateQuiz() {
    setLoading(true)
    setError(null)
    setQuiz(null)
    setCurrent(0)
    setSelected(null)
    setAnswered(false)
    setScore(0)
    try {
      const res = await fetch(`/api/quiz`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organ, difficulty, num_questions: numQuestions }),
      })
      const data = await res.json()
      if (!res.ok || data.status !== "success") {
        throw new Error(data.message || "Failed to generate quiz")
      }
      setQuiz(data.quiz as QuizItem[])
    } catch (e: any) {
      setError(e?.message || "Failed to contact quiz service. Is the backend running?")
    } finally {
      setLoading(false)
    }
  }

  function handleAnswer(index: number) {
    if (!currentItem) return
    setSelected(index)
    setAnswered(true)
    const correctIndex = currentItem.options.findIndex(
      (opt) => opt.trim().toLowerCase().startsWith(currentItem.answer.trim().toLowerCase()) || opt.trim().toLowerCase() === currentItem.answer.trim().toLowerCase()
    )
    if (index === correctIndex) setScore((s) => s + 1)
  }

  function nextQuestion() {
    if (!quiz) return
    if (current < quiz.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1)
      setSelected(null)
      setAnswered(false)
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Interactive Quiz</span>
          </h1>
          <p className="text-center text-gray-400 mb-10">Generate anatomy quizzes powered by AI</p>

          <div className="glass-dark border border-cyan-400/30 rounded-xl p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              <input
                value={organ}
                onChange={(e) => setOrgan(e.target.value)}
                placeholder="Organ (e.g., heart)"
                className="w-full p-3 rounded-lg bg-black/40 border border-cyan-400/30 text-white"
              />
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-3 rounded-lg bg-black/40 border border-cyan-400/30 text-white"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <input
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 5)}
                className="w-full p-3 rounded-lg bg-black/40 border border-cyan-400/30 text-white"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={generateQuiz}
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-lg disabled:opacity-50"
              >
                {loading ? "Generating..." : "Generate Quiz"}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-lg text-red-300 border border-red-400/50 bg-red-500/10 mb-6">{error}</div>
          )}

          {quiz && currentItem && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-dark border border-purple-400/30 rounded-xl p-8">
              <div className="mb-6 flex justify-between">
                <span className="text-sm text-gray-400">Question {current + 1} of {quiz.length}</span>
                <span className="text-sm font-bold text-cyan-400">Score: {score}/{quiz.length}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">{currentItem.question}</h2>
              <div className="space-y-3 mb-6">
                {currentItem.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    disabled={answered}
                    className={`w-full p-4 text-left rounded-lg font-semibold transition-all ${
                      selected === i
                        ? "bg-cyan-500/20 border border-cyan-400 text-cyan-200"
                        : "glass-dark border border-cyan-400/20 text-gray-300 hover:border-cyan-400/50"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {answered && (
                <div className="p-4 rounded-lg text-cyan-200 bg-cyan-500/10 border border-cyan-400/40 mb-6">
                  {currentItem.explanation}
                </div>
              )}
              <div className="flex justify-between">
                <button onClick={prevQuestion} disabled={current === 0} className="px-6 py-2 glass border border-cyan-400/30 text-cyan-400 rounded-lg disabled:opacity-50">← Previous</button>
                {current === (quiz.length - 1) ? (
                  <button onClick={() => { setQuiz(null); setScore(0); setCurrent(0); }} className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg">Finish</button>
                ) : (
                  <button onClick={nextQuestion} disabled={!answered} className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-lg disabled:opacity-50">Next →</button>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </main>
  )
}



