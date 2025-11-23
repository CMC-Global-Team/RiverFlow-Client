"use client"

import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload } from "lucide-react"

export default function FileUploader({ onFilesSelected, disabled = false }: { onFilesSelected: (files: File[]) => void; disabled?: boolean }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const handleClick = () => {
    if (disabled) return
    inputRef.current?.click()
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onFilesSelected(files)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className="relative">
      <Input ref={inputRef} type="file" multiple onChange={handleChange} className="hidden" />
      <Button variant="outline" size="sm" onClick={handleClick} disabled={disabled} className="gap-2">
        <Upload className="h-4 w-4" />
        Upload
      </Button>
    </div>
  )
}

