"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { useState } from "react"

export function Demo3D() {
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true })
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileUpload = () => {
    setIsUploading(true)
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 100) {
        setUploadProgress(100)
        clearInterval(interval)
        setTimeout(() => {
          setIsUploading(false)
          setUploadProgress(0)
        }, 1000)
      } else {
        setUploadProgress(progress)
      }
    }, 300)
  }

  return (
    <section id="demo" className="py-20 px-4">
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
            <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">3D Demo</span>
          </h2>
          <p className="text-gray-400 text-lg">Upload your textbook and explore in 3D</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* 3D Model Viewer */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="glass-dark border border-cyan-400/20 rounded-xl p-8 min-h-96 flex items-center justify-center relative overflow-hidden group hover:border-cyan-400/50 transition-all"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <motion.div
              animate={{ rotateX: [0, 360], rotateY: [0, 360] }}
              transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="relative z-10 text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                className="text-8xl mb-4"
              >
                🧠
              </motion.div>
              <p className="text-gray-300 font-semibold">Interactive 3D Model</p>
              <p className="text-gray-500 text-sm mt-2">Drag to rotate • Scroll to zoom</p>
            </motion.div>
          </motion.div>

          {/* File Upload */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            <motion.div
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              whileHover={!isUploading ? { borderColor: "rgba(34,211,238,0.8)" } : {}}
              className={`glass-dark border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
                isDragging ? "border-cyan-400 bg-cyan-500/10" : "border-cyan-400/30"
              }`}
            >
              <motion.div
                animate={isUploading ? { scale: [1, 1.1, 1] } : {}}
                transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY }}
                className="text-5xl mb-4"
              >
                📤
              </motion.div>
              <h3 className="text-xl font-bold text-white mb-2">Upload Textbook</h3>
              <p className="text-gray-400 mb-4">Drag and drop your PDF or image here</p>

              {isUploading ? (
                <div className="space-y-3">
                  <motion.div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${uploadProgress}%` }}
                      transition={{ duration: 0.3 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    />
                  </motion.div>
                  <p className="text-sm text-cyan-400 font-semibold">{Math.round(uploadProgress)}% Uploading...</p>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleFileUpload}
                  className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold rounded-lg glow-cyan hover:shadow-2xl transition-all"
                >
                  Choose File
                </motion.button>
              )}
            </motion.div>

            {/* Features List */}
            <div className="space-y-3">
              {["Supports PDF, PNG, JPG", "AI-powered extraction", "Instant 3D generation"].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-300 cursor-pointer"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: i * 0.2 }}
                    className="w-2 h-2 bg-cyan-400 rounded-full"
                  />
                  {feature}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
