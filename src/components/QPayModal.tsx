import { useEffect, useRef, useState } from 'react'
import { X, CheckCircle, RefreshCw, Smartphone, ExternalLink } from 'lucide-react'
import { createInvoice, checkPayment, isPaid, type QPayInvoice } from '../services/qpay'

interface Props {
  orderId: string
  amount: number
  description: string
  onSuccess: () => void
  onClose: () => void
}

type Step = 'loading' | 'ready' | 'checking' | 'paid' | 'error'

const POLL_INTERVAL = 3000 // ms

export default function QPayModal({ orderId, amount, description, onSuccess, onClose }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [invoice, setInvoice] = useState<QPayInvoice | null>(null)
  const [error, setError] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearTimers = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  const startPolling = (inv: QPayInvoice) => {
    pollRef.current = setInterval(async () => {
      try {
        setStep('checking')
        const result = await checkPayment(inv.invoice_id)
        if (isPaid(result)) {
          clearTimers()
          setStep('paid')
          setTimeout(onSuccess, 1500)
        } else {
          setStep('ready')
        }
      } catch {
        setStep('ready') // keep showing QR, silently retry
      }
    }, POLL_INTERVAL)

    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000)
  }

  const load = async () => {
    setStep('loading')
    setError('')
    setElapsed(0)
    try {
      const inv = await createInvoice(orderId, amount, description)
      setInvoice(inv)
      setStep('ready')
      startPolling(inv)
    } catch (e) {
      setError(String(e).replace('Error: ', ''))
      setStep('error')
    }
  }

  useEffect(() => {
    load()
    return clearTimers
  }, [])

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white rounded-sm shadow-2xl w-full max-w-sm overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-forest text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              {/* QPay logo text */}
              <div className="w-8 h-8 bg-lime rounded-sm flex items-center justify-center font-bold text-forest text-sm">Q</div>
              <div>
                <p className="font-serif font-semibold">QPay төлбөр</p>
                <p className="label-mono text-white/50 text-xs">{amount.toLocaleString('mn-MN')}₮</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* LOADING */}
            {step === 'loading' && (
              <div className="flex flex-col items-center py-10 gap-4">
                <RefreshCw className="w-8 h-8 text-lime animate-spin" />
                <p className="text-sm text-ink/60">QPay нэхэмжлэл үүсгэж байна...</p>
              </div>
            )}

            {/* READY / CHECKING */}
            {(step === 'ready' || step === 'checking') && invoice && (
              <>
                <p className="text-sm text-ink/60 text-center mb-3">
                  QR кодыг уншуулж эсвэл доорх холбоосоор нэвтэрнэ үү
                </p>

                {/* QR code */}
                <div className="flex justify-center mb-4">
                  <div className="relative">
                    <img
                      src={`data:image/png;base64,${invoice.qr_image}`}
                      alt="QPay QR"
                      className="w-48 h-48 rounded-sm border-4 border-cream"
                    />
                    {step === 'checking' && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-sm">
                        <RefreshCw className="w-6 h-6 text-lime animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center mb-4">
                  <span className="label-mono text-ink/40">Хүлээгдэж байна {mins}:{secs}</span>
                </div>

                {/* Bank app deep links */}
                {invoice.urls && invoice.urls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {invoice.urls.slice(0, 6).map(u => (
                      <a
                        key={u.name}
                        href={u.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-1 p-2 rounded-sm bg-cream hover:bg-cream-dark transition-colors"
                      >
                        <img src={u.logo} alt={u.name} className="w-8 h-8 rounded-sm object-contain" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                        <span className="label-mono text-ink/60 text-center leading-tight">{u.name}</span>
                      </a>
                    ))}
                  </div>
                )}

                {/* Short URL fallback */}
                {invoice.qPay_shortUrl && (
                  <a
                    href={invoice.qPay_shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full bg-cream border border-cream-dark rounded-sm py-2.5 text-sm text-forest hover:bg-cream-dark transition-colors"
                  >
                    <Smartphone className="w-4 h-4" />
                    Аппаар нэвтрэх
                    <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                  </a>
                )}

                <p className="text-xs text-ink/30 text-center mt-3">
                  Та төлбөр хийсний дараа автоматаар баталгаажна
                </p>
              </>
            )}

            {/* PAID */}
            {step === 'paid' && (
              <div className="flex flex-col items-center py-10 gap-3">
                <div className="w-16 h-16 rounded-sm bg-lime/20 flex items-center justify-center">
                  <CheckCircle className="w-9 h-9 text-lime-dark" />
                </div>
                <p className="font-serif text-xl font-bold text-ink">Төлбөр амжилттай!</p>
                <p className="text-sm text-ink/50">Захиалга баталгаажлаа</p>
              </div>
            )}

            {/* ERROR */}
            {step === 'error' && (
              <div className="flex flex-col items-center py-8 gap-4">
                <p className="text-sm text-red-600 text-center bg-red-50 border border-red-200 rounded-sm p-3 w-full">{error}</p>
                <p className="text-xs text-ink/40 text-center">
                  QPay тест горимд зөвхөн жинхэнэ credentials-тай ажиллана.
                </p>
                <button onClick={load} className="btn-forest text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" /> Дахин оролдох
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
