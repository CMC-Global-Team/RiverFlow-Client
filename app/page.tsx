"use client"

import { useState } from "react"
import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth/auth-modal"

export default function Home() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "login",
  })

  const handleAuthClick = (tab: "login" | "signup") => {
    setAuthModal({ isOpen: true, tab })
  }

  return (
    <main className="min-h-screen bg-background">
      <Header onAuthClick={handleAuthClick} />
      <HeroSection onGetStarted={() => handleAuthClick("signup")} />
      <FeaturesSection />
      <CTASection onGetStarted={() => handleAuthClick("signup")} />
      <Footer />
      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal({ ...authModal, isOpen: false })}
        initialTab={authModal.tab}
      />
    </main>
  )
}
