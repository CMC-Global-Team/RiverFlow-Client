"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function BackButton() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/dashboard/mindmaps")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="hover:bg-muted transition-colors"
      title="Quay về trang trước"
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
}

