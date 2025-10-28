"use client"

import { motion, Variants } from "framer-motion"
import { useState, useEffect } from "react"

// Counter animation component
const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = end / (duration * 60)
    const timer = setInterval(() => {
      start += increment
      if (start >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 1000 / 60)
    return () => clearInterval(timer)
  }, [end, duration])

  return <span>{count.toLocaleString()}</span>
}

export function Hero() {
  // ✅ Type-safe variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      // ✅ Fix: Framer Motion expects easing function/array, not string
      transition: { duration: 0.8, ease: ["easeOut"] },
    },
  }

  const AnimatedText = ({ text, className }: { text: string; className: string }) => (
    <span>
      {text.split("").map((char, index) => (
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
            ease: ["easeOut"],
          }}
          className={className}
        >
          {char}
        </motion.span>
      ))}
    </span>
  )

  return (
    <section id="home" className="min-h-screen flex items-center justify-center pt-20 px-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl mx-auto"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="inline-block mb-6">
          <div className="glass px-4 py-2 rounded-full border border-cyan-400/50">
            <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              ✨ The Future of Learning
            </span>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
        >
          <div>
            <AnimatedText
              text="Turn Any Textbook"
              className="bg-gradient-to-r from-cyan-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
            />
          </div>
          <br />
          <div>
            <AnimatedText text="into a 3D Learning Lab" className="text-white" />
          </div>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto"
        >
          AI 3D Self-Testing for Anatomy Learning
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(34,211,238,0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-bold rounded-lg glow-cyan hover:shadow-2xl transition-all"
          >
            Try Demo
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168,85,247,0.6)" }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 glass border border-purple-400/50 text-white font-bold rounded-lg glow-purple hover:bg-purple-500/20 transition-all"
          >
            Learn More
          </motion.button>
        </motion.div>

        {/* Floating 3D Preview */}
        <motion.div variants={itemVariants} className="mt-16 relative h-64 md:h-96">
          <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl border border-cyan-400/30 glass flex items-center justify-center"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🧬</div>
              <p className="text-gray-300">3D Anatomy Model Preview</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="mt-20 grid grid-cols-3 gap-6 max-w-2xl mx-auto"
        >
          {[
            { label: "Students", value: 50000 },
            { label: "Models", value: 500 },
            { label: "Accuracy", value: 99 },
          ].map((stat, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              className="glass border border-cyan-400/20 rounded-lg p-4 hover:border-cyan-400/50 transition-all"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                <AnimatedCounter end={stat.value} />
                {stat.label === "Accuracy" && "%"}
                {stat.label === "Students" && "+"}
              </div>
              <p className="text-gray-400 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  )
}
