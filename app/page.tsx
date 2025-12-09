"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"

import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import FeaturesSection from "@/components/features-section"
import CTASection from "@/components/cta-section"
import Footer from "@/components/footer"
import AuthModal from "@/components/auth/auth-modal"

function HomeComponent() {
  const [authModal, setAuthModal] = useState<{ isOpen: boolean; tab: "login" | "signup" }>({
    isOpen: false,
    tab: "login",
  })

  // Logic mới để đọc URL
  const searchParams = useSearchParams()
  useEffect(() => {
    // Kiểm tra xem URL có ?showLogin=true không
    const showLogin = searchParams.get('showLogin')
    if (showLogin === 'true') {
      // Nếu có, gọi hàm mở modal
      handleAuthClick('login')
    }
  }, [searchParams])


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

export default function Home() {
  return (
    // <Suspense> là bắt buộc để 'useSearchParams' hoạt động
    <Suspense>
      <HomeComponent />
    </Suspense>
  )
}