"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"

const features = [
  {
    icon: "🎯",
    title: "3D Visualization",
    description: "Interactive 3D models of anatomical structures with real-time rotation and zoom",
    gradient: "from-cyan-400 to-blue-500",
    details: "Explore every angle with smooth, responsive controls",
  },
  {
    icon: "🏷️",
    title: "AI Labeling",
    description: "Intelligent automatic labeling system powered by advanced AI algorithms",
    gradient: "from-purple-400 to-pink-500",
    details: "Automatic identification of anatomical components",
  },
  {
    icon: "❓",
    title: "Interactive Quizzes",
    description: "Adaptive quiz system that learns your progress and adjusts difficulty",
    gradient: "from-blue-400 to-cyan-500",
    details: "Personalized learning paths based on your performance",
  },
  {
    icon: "💡",
    title: "Smart Explanations",
    description: "AI-generated contextual explanations for every anatomical component",
    gradient: "from-pink-400 to-purple-500",
    details: "Deep learning insights at your fingertips",
  },
]

export function Features() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  }

  return (
    <section id="features" className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
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
              Powerful Features
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Everything you need for immersive anatomy learning</p>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              whileHover={{ y: -10, boxShadow: "0 0 30px rgba(34,211,238,0.3)" }}
              className="group glass-dark border border-cyan-400/20 rounded-xl p-8 hover:border-cyan-400/50 transition-all cursor-pointer relative overflow-hidden"
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-xl transition-opacity`}
                animate={hoveredIndex === index ? { opacity: 0.15 } : { opacity: 0 }}
              />

              <div className="relative z-10">
                <motion.div
                  animate={hoveredIndex === index ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-5xl mb-4 inline-block"
                >
                  {feature.icon}
                </motion.div>

                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>

                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={hoveredIndex === index ? { opacity: 1, height: "auto" } : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 pt-4 border-t border-cyan-400/20"
                >
                  <p className="text-cyan-300 text-sm font-semibold">{feature.details}</p>
                </motion.div>

                {/* Animated border accent */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                  className={`h-1 bg-gradient-to-r ${feature.gradient} mt-4 rounded-full`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
