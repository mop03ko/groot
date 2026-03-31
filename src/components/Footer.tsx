import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-forest-dark text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <div className="font-serif font-bold text-2xl text-white mb-1 flex items-center gap-2">
              GROOT
              <span className="w-2 h-2 bg-lime rounded-full pulse-dot" />
            </div>
            <p className="label-mono text-lime/80 mb-4">Root to Table</p>
            <p className="text-sm leading-relaxed text-white/50">
              Монголын хамгийн найдвартай шинэ ногооны хүргэлтийн үйлчилгээ. Барс зах дээрээс өдөр бүр 07:30-д шалгадаг.
            </p>
            <p className="mt-4 italic font-serif text-white/60 text-sm">
              "муу ногоо хэзээ ч хүрдэггүй"
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center hover:bg-lime transition-colors"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center hover:bg-lime transition-colors"><Facebook className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="label-mono text-white/40 mb-4">Холбоосууд</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { to: '/', label: 'Нүүр хуудас' },
                { to: '/shop', label: 'Бүтээгдэхүүн' },
                { to: '/dashboard', label: 'Миний захиалга' },
                { to: '#', label: 'Бидний тухай' },
                { to: '#', label: 'Ажлын байр' },
              ].map(({ to, label }) => (
                <li key={label}>
                  <Link to={to} className="hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="label-mono text-white/40 mb-4">Мэдээлэл</h3>
            <ul className="space-y-2.5 text-sm">
              {['Хүргэлтийн нөхцөл', 'Буцаалт, солилт', 'Нууцлалын бодлого', 'Үйлчилгээний нөхцөл', 'Тусламж, дэмжлэг'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="label-mono text-white/40 mb-4">Холбоо барих</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-lime shrink-0" />
                <span>7700-1234, 9900-5678</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-lime shrink-0" />
                <span>info@groot.mn</span>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-lime shrink-0 mt-0.5" />
                <span>УБ, Сүхбаатар дүүрэг, 1-р хороо</span>
              </li>
            </ul>
            <div className="mt-5 p-3 bg-white/5 rounded-sm border border-white/10">
              <p className="label-mono text-white/30 mb-1">Ажлын цаг</p>
              <p className="text-sm text-white font-medium">Мя–Ба: 08:00–22:00</p>
              <p className="text-sm text-white font-medium">Бя–Ня: 09:00–20:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/30">© 2024 Groot.mn. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-4 text-xs text-white/30">
            <span>QPay</span><span>Visa</span><span>MasterCard</span><span>Khan Bank</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
