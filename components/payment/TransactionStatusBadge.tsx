import { CheckCircle2, Clock, XCircle, AlertCircle, MinusCircle } from "lucide-react"

interface TransactionStatusBadgeProps {
  status: string
}

export default function TransactionStatusBadge({ status }: TransactionStatusBadgeProps) {
  const normalizedStatus = status?.toLowerCase() || 'unknown'

  let config = {
    label: status,
    className: "bg-gray-100 text-gray-700 border-gray-200",
    icon: MinusCircle,
  }

  switch (normalizedStatus) {
    case 'processed':
    case 'matched':
      config = {
        label: "Thành công",
        className: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100",
        icon: CheckCircle2,
      }
      break
    case 'pending':
      config = {
        label: "Đang xử lý",
        className: "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
        icon: Clock,
      }
      break
    case 'invalid':
      config = {
        label: "Thất bại",
        className: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100",
        icon: XCircle,
      }
      break
    case 'ignored':
      config = {
        label: "Đã hủy/Bỏ qua",
        className: "bg-gray-100 text-gray-600 border-gray-200",
        icon: AlertCircle,
      }
      break
    default:
        break
  }

  const Icon = config.icon

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors ${config.className}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </div>
  )
}