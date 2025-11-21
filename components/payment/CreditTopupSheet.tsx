"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { createTopupIntent } from "@/services/payment/payment.service"
import { getUserProfile } from "@/services/auth/update-user.service"
import { useAuth } from "@/hooks/auth/useAuth"
import { Coins, CreditCard, Lock, AlertCircle, CheckCircle } from "lucide-react"

interface CreditTopupSheetProps {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export default function CreditTopupSheet({ open, onOpenChange }: CreditTopupSheetProps) {
  const [amount, setAmount] = useState<number>(0)
  const [loading, setLoading] = useState(false)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [code, setCode] = useState<string | null>(null)
  const { updateUser, user } = useAuth()
  const presets = [10000, 50000, 100000, 200000, 500000, 1000000]
  const fmt = (v: number) => new Intl.NumberFormat('vi-VN').format(v)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [method, setMethod] = useState<"qr" | "stripe" | null>(null)
  const [initialCredit, setInitialCredit] = useState<number>(user?.credit ?? 0)
  const [isPaid, setIsPaid] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const onSubmit = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await createTopupIntent(amount)
      setQrUrl(res.qrUrl)
      setCode(res.code)
      if (!res.qrUrl || !res.code) {
        setErrorMessage("Không thể tạo mã nạp. Vui lòng thử lại.")
      }
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

  const handleSelect = (p: number) => {
    if (loading) return
    setAmount(p)
  }

  const onNext = async () => {
    if (step === 1) {
      setStep(2)
      return
    }
    if (step === 2) {
      if (method === "qr") {
        await onSubmit()
        setStep(3)
      }
      return
    }
  }

  const onBack = () => {
    if (step === 2) {
      setStep(1)
      return
    }
    if (step === 3) {
      setStep(2)
      return
    }
  }

  useEffect(() => {
    if (open) {
      setInitialCredit(user?.credit ?? 0)
      setStep(1)
      setMethod(null)
      setQrUrl(null)
      setCode(null)
      setIsPaid(false)
      setIsPolling(false)
      setErrorMessage(null)
    }
  }, [open])

  useEffect(() => {
    if (step === 3 && method === "qr" && qrUrl && !isPaid) {
      setIsPolling(true)
      const id = setInterval(async () => {
        const profile = await getUserProfile()
        if (user) {
          updateUser({ ...user, credit: profile.credit ?? user.credit })
        }
        const newCredit = profile.credit ?? 0
        if (newCredit > initialCredit) {
          setIsPaid(true)
          setIsPolling(false)
        }
      }, 5000)
      return () => {
        clearInterval(id)
        setIsPolling(false)
      }
    }
  }, [step, method, qrUrl])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl md:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Coins className="h-5 w-5"/>Nạp credit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">{step === 1 ? "Bước 1/3: Chọn credit" : step === 2 ? "Bước 2/3: Chọn phương thức thanh toán" : "Bước 3/3: Thanh toán"}</div>
            <div className="text-xs text-muted-foreground">{amount > 0 ? `${fmt(amount)} đ` : ""}</div>
          </div>
          <div className="min-h-[360px] md:min-h-[420px]">

          {step === 1 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {presets.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`rounded-lg border p-3 text-center transition ${amount === p ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:bg-muted'}`}
                  aria-label={`Nạp ${fmt(p)} đ`}
                >
                  <div className="text-lg font-semibold">{fmt(p)} đ</div>
                  <div className="text-xs text-muted-foreground">Nạp nhanh</div>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod("qr")}
                className={`rounded-lg border p-3 text-center transition ${method === 'qr' ? 'border-primary ring-2 ring-primary/30 bg-primary/5' : 'border-border hover:bg-muted'}`}
              >
                <div className="flex items-center justify-center gap-2"><Coins className="h-4 w-4"/>Chuyển khoản QR</div>
                <div className="text-xs text-muted-foreground mt-1">Khuyến nghị</div>
              </button>
              <div className="relative">
                <button
                  type="button"
                  disabled
                  className="rounded-lg border p-3 text-center w-full cursor-not-allowed opacity-50"
                >
                  <div className="flex items-center justify-center gap-2"><CreditCard className="h-4 w-4"/>Stripe</div>
                  <div className="text-xs text-muted-foreground mt-1">Tạm thời khóa</div>
                </button>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-4 items-stretch h-full">
              <div className="space-y-3 flex flex-col h-full">
                <div className="rounded-lg border p-3 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Số tiền</div>
                  <div className="font-medium text-right">{fmt(amount)} đ</div>
                  <div className="text-muted-foreground">Phương thức</div>
                  <div className="font-medium text-right">{method === 'qr' ? 'Chuyển khoản QR' : 'Không xác định'}</div>
                </div>
                {loading && (
                  <div className="text-sm text-muted-foreground">Đang tạo mã QR...</div>
                )}
                {qrUrl && (
                  <>
                    <div className="text-sm">Quét QR bằng app ngân hàng</div>
                    <img src={qrUrl} alt="QR nạp" className="w-full max-w-xs rounded border mx-auto md:mx-0" />
                    {code && (
                      <div className="flex items-center justify-between rounded-md border p-2">
                        <span className="text-xs">Nội dung chuyển khoản</span>
                        <span className="text-sm font-medium">{code}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="space-y-3 flex flex-col h-full">
                {errorMessage && (
                  <div className="flex items-center gap-2 text-destructive text-sm"><AlertCircle className="h-4 w-4"/>{errorMessage}</div>
                )}
                <div className="rounded-lg border p-4">
                  <div className="text-sm mb-2">Trạng thái giao dịch</div>
                  <div className="text-sm">
                    {isPaid ? (
                      <span className="text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4"/>Giao dịch thành công. Credit đã cập nhật.</span>
                    ) : isPolling ? (
                      <span className="text-muted-foreground">Đang chờ xác nhận giao dịch...</span>
                    ) : (
                      <span className="text-muted-foreground">Chưa có giao dịch.</span>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border p-4 text-sm space-y-2">
                  <div className="font-medium">Lưu ý</div>
                  <div>• Chuyển đúng số tiền và nội dung mã hiển thị.</div>
                  <div>• Sau khi chuyển, hệ thống sẽ tự xác nhận trong vài phút.</div>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
        <DialogFooter>
          <div className="w-full space-y-3">
            <div className="flex items-center justify-between">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${step > 1 ? 'bg-primary text-white' : step === 1 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>1</div>
              <div className={`h-0.5 flex-1 mx-2 ${step > 1 ? 'bg-primary' : 'bg-border'}`}></div>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${step > 2 ? 'bg-primary text-white' : step === 2 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>2</div>
              <div className={`h-0.5 flex-1 mx-2 ${step > 2 ? 'bg-primary' : 'bg-border'}`}></div>
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs ${step === 3 ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>3</div>
            </div>
            <div className="grid grid-cols-3 text-center text-xs">
              <div className={step === 1 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Chọn credit</div>
              <div className={step === 2 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Chọn phương thức thanh toán</div>
              <div className={step === 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}>Xác nhận thanh toán</div>
            </div>
            <div className="flex items-center justify-between w-full">
              <Button variant="outline" onClick={() => onBack()} disabled={step === 1}>Quay lại</Button>
              {step < 3 ? (
                <Button onClick={() => onNext()} disabled={(step === 1 && amount <= 0) || (step === 2 && method !== 'qr')}>Tiếp theo</Button>
              ) : (
                <Button onClick={() => onOpenChange(false)}>Đóng</Button>
              )}
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
