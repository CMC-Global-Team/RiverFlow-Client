"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
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
  const presets = [50000, 100000, 200000, 500000]
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Coins className="h-5 w-5"/>Nạp credit</SheetTitle>
        </SheetHeader>
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="text-sm">Số tiền</div>
            <div className="flex flex-wrap gap-2">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-md px-3 py-1 border ${amount === p ? 'bg-primary text-white border-primary' : 'bg-muted text-foreground border-border'}`}
                >
                  {fmt(p)}
                </button>
              ))}
            </div>
            <Input type="number" value={amount} onChange={(e) => setAmount(parseInt(e.target.value || "0", 10))} />
            <div className="text-xs text-muted-foreground">Số tiền: {fmt(amount)} đ</div>
          </div>
          <Button onClick={onSubmit} disabled={loading} className="w-full">
            {loading ? "Đang tạo mã" : "Tạo mã nạp"}
          </Button>
          {qrUrl && (
            <div className="space-y-3">
              <div className="text-sm">Quét QR bằng app ngân hàng</div>
              <img src={qrUrl} alt="QR nạp" className="w-full max-w-xs rounded border" />
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
        <SheetFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Đóng</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
