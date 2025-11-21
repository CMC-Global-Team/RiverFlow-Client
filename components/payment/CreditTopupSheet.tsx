"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createTopupIntent } from "@/services/payment/payment.service"
import { getUserProfile } from "@/services/auth/get-user.service"
import { useAuth } from "@/hooks/auth/useAuth"
import { Coins } from "lucide-react"

interface CreditTopupSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function CreditTopupSheet({ open, onOpenChange }: CreditTopupSheetProps) {
  const [amount, setAmount] = useState<number>(50000)
  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const { updateUser, user } = useAuth()
  const presets = [10000, 50000, 100000, 200000, 500000, 1000000]
  const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v)

  const onSubmit = async () => {
    setLoading(true)
    try {
      const res = await createTopupIntent(amount)
      setQrUrl(res.qrUrl)
      setCode(res.code)
    } finally {
      setLoading(false)
    }
  }

  const refreshCredit = async () => {
    const profile = await getUserProfile()
    if (user) {
      updateUser({ ...user, credit: profile.credit ?? user.credit })
    }
  }

  const handleSelect = async (p: number) => {
    if (loading) return
    setAmount(p)
    await onSubmit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Coins className="h-5 w-5"/>Nạp credit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {presets.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => handleSelect(p)}
                className={`rounded-lg border p-3 text-center transition ${amount === p ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:bg-muted'}`}
                disabled={loading}
                aria-label={`Nạp ${fmt(p)} đ`}
              >
                <div className="text-lg font-semibold">{fmt(p)} đ</div>
                <div className="text-xs text-muted-foreground">Nạp nhanh</div>
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-sm text-muted-foreground">Đang tạo mã QR...</div>
          )}

          {qrUrl && (
            <div className="space-y-3">
              <div className="text-sm">Quét QR bằng app ngân hàng</div>
              <img src={qrUrl} alt="QR nạp" className="w-full max-w-xs rounded border mx-auto" />
              {code && (
                <div className="flex items-center justify-between rounded-md border p-2">
                  <span className="text-xs">Nội dung chuyển khoản</span>
                  <span className="text-sm font-medium">{code}</span>
                </div>
              )}
              <Button onClick={refreshCredit} variant="outline" className="w-full">Cập nhật credit</Button>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
