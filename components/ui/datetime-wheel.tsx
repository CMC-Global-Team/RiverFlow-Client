"use client"

import { useMemo } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function pad2(n: number) { return String(n).padStart(2, '0') }

export default function DateTimeWheel({
  value,
  onChange,
  className,
  label,
}: {
  value: string
  onChange: (v: string) => void
  className?: string
  label?: string
}) {
  const d = value ? new Date(value) : new Date()
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = d.getHours()
  const minute = d.getMinutes()

  const years = useMemo(() => {
    const now = new Date().getFullYear()
    const arr: number[] = []
    for (let y = now - 5; y <= now + 5; y++) arr.push(y)
    return arr
  }, [])
  const months = Array.from({ length: 12 }, (_, i) => i + 1)
  const days = useMemo(() => {
    const last = new Date(year, month, 0).getDate()
    return Array.from({ length: last }, (_, i) => i + 1)
  }, [year, month])
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 60 }, (_, i) => i)

  const update = (part: 'y' | 'm' | 'd' | 'h' | 'i', v: number) => {
    const nd = new Date(value || new Date())
    if (part === 'y') nd.setFullYear(v)
    if (part === 'm') nd.setMonth(v - 1)
    if (part === 'd') nd.setDate(v)
    if (part === 'h') nd.setHours(v)
    if (part === 'i') nd.setMinutes(v)
    const iso = `${nd.getFullYear()}-${pad2(nd.getMonth() + 1)}-${pad2(nd.getDate())}T${pad2(nd.getHours())}:${pad2(nd.getMinutes())}`
    onChange(iso)
  }

  return (
    <div className={`flex items-center gap-2 ${className || ''}`}>
      {label && <div className="text-xs text-muted-foreground w-10">{label}</div>}
      <Select value={String(year)} onValueChange={(v) => update('y', Number(v))}>
        <SelectTrigger className="h-8 w-20 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{years.map((y) => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}</SelectContent>
      </Select>
      <Select value={String(month)} onValueChange={(v) => update('m', Number(v))}>
        <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{months.map((m) => (<SelectItem key={m} value={String(m)}>{pad2(m)}</SelectItem>))}</SelectContent>
      </Select>
      <Select value={String(day)} onValueChange={(v) => update('d', Number(v))}>
        <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{days.map((dd) => (<SelectItem key={dd} value={String(dd)}>{pad2(dd)}</SelectItem>))}</SelectContent>
      </Select>
      <Select value={String(hour)} onValueChange={(v) => update('h', Number(v))}>
        <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{hours.map((h) => (<SelectItem key={h} value={String(h)}>{pad2(h)}</SelectItem>))}</SelectContent>
      </Select>
      <Select value={String(minute)} onValueChange={(v) => update('i', Number(v))}>
        <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
        <SelectContent>{minutes.map((mi) => (<SelectItem key={mi} value={String(mi)}>{pad2(mi)}</SelectItem>))}</SelectContent>
      </Select>
    </div>
  )
}

