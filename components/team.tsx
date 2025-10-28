"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"

const teamMembers = [
  {
    name: "Saumya Agarwal",
    avatar: "👩‍🔬",
    role: "Lead Researcher",
    bio: "Expert in anatomy research and educational content development."
  },
  {
    name: "Sinthana P",
    avatar: "👨‍💻",
    role: "Developer",
    bio: "Full-stack developer with expertise in educational technology."
  },
  {
    name: "Meghna Mandawra",
    avatar: "👩‍🎨",
    role: "Designer",
    bio: "Creative UI/UX designer focused on intuitive learning experiences."
  },
  {
    name: "Kavya R",
    avatar: "👨‍💻",
    role: "Developer",
    bio: "Specialized in interactive web applications and 3D visualization."
  }
]

export function Team() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const [hoveredMember, setHoveredMember] = useState<number | null>(null)

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
    <section id="team" className="py-20 px-4">
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
              Meet Our Team
            </span>
          </h2>
          <p className="text-gray-400 text-lg">Passionate experts building the future of learning</p>
        </motion.div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid md:grid-cols-3 gap-8"
        >
          {teamMembers.map((member, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              onMouseEnter={() => setHoveredMember(index)}
              onMouseLeave={() => setHoveredMember(null)}
              whileHover={{ y: -10 }}
              className="glass-dark border border-cyan-400/20 rounded-xl p-8 text-center hover:border-cyan-400/50 transition-all group relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
                animate={hoveredMember === index ? { opacity: 0.15 } : { opacity: 0 }}
              />

              <div className="relative z-10">
                {/* Avatar */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  animate={hoveredMember === index ? { scale: 1.15 } : { scale: 1 }}
                  className="text-7xl mb-4 inline-block"
                >
                  {member.avatar}
                </motion.div>

                {/* Name */}
                <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>

                {/* Role */}
                <p className="text-cyan-400 font-semibold mb-3">{member.role}</p>

                {/* Bio */}
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{member.bio}</p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={hoveredMember === index ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                  transition={{ duration: 0.3 }}
                  className="flex justify-center gap-4"
                >
                  {["Twitter", "LinkedIn", "GitHub"].map((social, i) => (
                    <motion.button
                      key={social}
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/50 text-cyan-400 text-xs font-bold hover:bg-cyan-400/40 transition-all"
                    >
                      {social[0]}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
