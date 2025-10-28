"use client"

import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { Features } from "@/components/features"
import { Demo3D } from "@/components/demo-3d"
import { Quiz } from "@/components/quiz"
import { Team } from "@/components/team"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-purple-500/5 to-blue-500/10 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <Navbar />
      <Hero />
      <Features />
      <Demo3D />
      <Quiz />
      <Team />
      <Footer />
    </main>
  )
}
