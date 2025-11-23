"use client"

import { useRef } from "react"

export default function FileUpload({ files, onChange }: { files: File[]; onChange: (files: File[]) => void }) {
  const inputRef = useRef<HTMLInputElement | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files ? Array.from(e.target.files) : []
    onChange(list)
  }

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const list = Array.from(e.dataTransfer.files || [])
    if (list.length) onChange(list)
  }

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">File đính kèm</div>
      <div
        className="border border-dashed border-border rounded-lg p-4 text-center text-sm text-muted-foreground hover:bg-muted/50"
        onDrop={onDrop}
        onDragOver={onDragOver}
        onClick={() => inputRef.current?.click()}
      >
        Kéo thả file vào đây hoặc bấm để chọn
        <input ref={inputRef} type="file" multiple className="hidden" onChange={onFileChange} />
      </div>
      {files.length > 0 && (
        <div className="text-xs text-muted-foreground">{files.map((f) => f.name).join(', ')}</div>
      )}
    </div>
  )
}

