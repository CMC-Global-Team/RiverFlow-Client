"use client"

export default function CreditCost({ balance, cost }: { balance: number; cost: number }) {
  const enough = balance >= cost
  return (
    <div className={`text-sm ${enough ? 'text-muted-foreground' : 'text-destructive'}`}>
      Yêu cầu: {cost} credit • Số dư: {balance} credit
    </div>
  )
}

