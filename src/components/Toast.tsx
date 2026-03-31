import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { ToastMessage } from '../types'

const ICONS: Record<ToastMessage['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
}
const COLORS: Record<ToastMessage['type'], string> = {
  success: 'bg-forest text-white',
  error: 'bg-red-600 text-white',
  info: 'bg-ink text-white',
}

export default function ToastContainer() {
  const { state } = useApp()
  if (state.toasts.length === 0) return null

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 items-center pointer-events-none">
      {state.toasts.map(t => {
        const Icon = ICONS[t.type]
        return (
          <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-sm shadow-lg text-sm font-medium ${COLORS[t.type]} fade-in-up pointer-events-auto`}>
            <Icon className="w-4 h-4 shrink-0" />
            {t.message}
          </div>
        )
      })}
    </div>
  )
}
