"use client"

import { motion } from "framer-motion"

export function Footer() {
  const currentYear = new Date().getFullYear()

  const socialLinks = [
    { icon: "𝕏", label: "Twitter" },
    { icon: "in", label: "LinkedIn" },
    { icon: "f", label: "Facebook" },
    { icon: "ig", label: "Instagram" },
  ]

  return (
    <footer className="border-t border-cyan-400/20 glass-dark py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-lg glow-cyan" />
              <span className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                AI Anatomy
              </span>
            </div>
            <p className="text-gray-400 text-sm">Transforming anatomy education with AI and 3D technology.</p>
          </motion.div>

          {/* Product */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4 className="font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {["Features", "Pricing", "Demo", "API"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {["About", "Blog", "Careers", "Contact"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Legal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              {["Privacy", "Terms", "Security", "Cookies"].map((item) => (
                <li key={item}>
                  <a href="#" className="hover:text-cyan-400 transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-400/10 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <p className="text-gray-400 text-sm">© {currentYear} AI Anatomy Explorer. All rights reserved.</p>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href="#"
                  whileHover={{ scale: 1.2, color: "#22d3ee" }}
                  className="w-10 h-10 rounded-full glass border border-cyan-400/30 flex items-center justify-center text-gray-400 hover:text-cyan-400 transition-colors"
                  title={social.label}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
