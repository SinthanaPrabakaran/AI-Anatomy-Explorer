"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"

const quizzes = [
  {
    question: "Which bone is the largest in the human body?",
    options: ["Femur", "Tibia", "Humerus", "Fibula"],
    correct: 0,
    explanation: "The femur (thighbone) is the longest and strongest bone in the human body.",
  },
  {
    question: "How many bones are in the adult human body?",
    options: ["186", "206", "226", "246"],
    correct: 1,
    explanation: "An adult human body typically has 206 bones, though this number can vary slightly.",
  },
  {
    question: "What is the smallest bone in the human body?",
    options: ["Stapes", "Incus", "Malleus", "Ossicles"],
    correct: 0,
    explanation: "The stapes (stirrup bone) in the middle ear is the smallest bone in the human body.",
  },
]

export function Quiz() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)

  const handleAnswer = (index: number) => {
    setSelected(index)
    setAnswered(true)
    if (index === quizzes[currentQuestion].correct) {
      setScore(score + 1)
    }
  }

  const handleNext = () => {
    if (currentQuestion < quizzes.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
      setSelected(null)
      setAnswered(false)
    }
  }

  const isComplete = currentQuestion === quizzes.length - 1 && answered

  return (
    <section id="quiz" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Test Your Knowledge
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Interactive quiz powered by AI</p>
        </motion.div>

        {/* Quiz Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="glass-dark border border-purple-400/30 rounded-xl p-8 md:p-12"
        >
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">
                Question {currentQuestion + 1} of {quizzes.length}
              </span>
              <span className="text-sm font-bold text-cyan-400">
                Score: {score}/{quizzes.length}
              </span>
            </div>
            <motion.div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${((currentQuestion + 1) / quizzes.length) * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-cyan-400 to-purple-400"
              />
            </motion.div>
          </div>

          {/* Question */}
          <motion.h3
            key={currentQuestion}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl md:text-3xl font-bold text-white mb-8"
          >
            {quizzes[currentQuestion].question}
          </motion.h3>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {quizzes[currentQuestion].options.map((option, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                onClick={() => handleAnswer(index)}
                disabled={answered}
                whileHover={!answered ? { scale: 1.02 } : {}}
                whileTap={!answered ? { scale: 0.98 } : {}}
                className={`w-full p-4 text-left rounded-lg font-semibold transition-all ${
                  selected === index
                    ? index === quizzes[currentQuestion].correct
                      ? "bg-green-500/30 border border-green-400 text-green-300"
                      : "bg-red-500/30 border border-red-400 text-red-300"
                    : "glass-dark border border-cyan-400/20 text-gray-300 hover:border-cyan-400/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selected === index
                        ? index === quizzes[currentQuestion].correct
                          ? "border-green-400 bg-green-400/20"
                          : "border-red-400 bg-red-400/20"
                        : "border-cyan-400/50"
                    }`}
                  >
                    {selected === index && (index === quizzes[currentQuestion].correct ? "✓" : "✗")}
                  </div>
                  {option}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Result Message */}
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-lg text-center font-semibold mb-6 ${
                selected === quizzes[currentQuestion].correct
                  ? "bg-green-500/20 text-green-300 border border-green-400/50"
                  : "bg-red-500/20 text-red-300 border border-red-400/50"
              }`}
            >
              {selected === quizzes[currentQuestion].correct ? "🎉 Correct! " : "❌ Incorrect. "}
              <p className="text-sm mt-2 text-gray-300">{quizzes[currentQuestion].explanation}</p>
            </motion.div>
          )}

          <div className="flex gap-4 justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="px-6 py-2 glass border border-cyan-400/30 text-cyan-400 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-cyan-400/50 transition-all"
            >
              ← Previous
            </motion.button>

            {isComplete ? (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setCurrentQuestion(0)
                  setSelected(null)
                  setAnswered(false)
                  setScore(0)
                }}
                className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg glow-cyan hover:shadow-lg transition-all"
              >
                Restart Quiz
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleNext}
                disabled={!answered || currentQuestion === quizzes.length - 1}
                className="px-6 py-2 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                Next →
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
