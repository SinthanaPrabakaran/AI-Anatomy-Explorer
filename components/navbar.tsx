"use client"

import { motion } from "framer-motion"
import { useState } from "react"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navItems = ["Home", "Demo", "Features", "Team", "Contact"]

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 w-full z-50 glass-dark border-b border-cyan-400/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div whileHover={{ scale: 1.05 }} className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg glow-cyan" />
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              AI Anatomy
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-8">
            {navItems.map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                whileHover={{ color: "#22d3ee" }}
                className="text-sm font-medium text-gray-300 hover:text-cyan-400 transition-colors"
              >
                {item}
              </motion.a>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 20px rgba(34,211,238,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="hidden md:block px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-full glow-cyan"
          >
            Get Started
          </motion.button>

          {/* Mobile Menu Button */}
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-cyan-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden pb-4 space-y-2"
          >
            {navItems.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="block px-4 py-2 text-gray-300 hover:text-cyan-400 transition-colors"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </div>
    </motion.nav>
  )
}
