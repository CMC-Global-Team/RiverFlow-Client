"use client"

import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { useTranslation } from "react-i18next"

export default function BackButton() {
  const router = useRouter()
  const { t } = useTranslation('editor')

  const handleBack = () => {
    router.push("/dashboard/mindmaps")
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleBack}
      className="hover:bg-muted transition-colors"
      title={t("backButton.title")}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
  )
}

