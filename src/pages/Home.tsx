import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Clock, Truck, Shield, Star, MessageCircle, Phone, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

const TICKER_ITEMS = [
  '✓ Өдөр бүр 07:30-д шалгадаг',
  '● Барс захаас шууд',
  '✓ 2 цагийн дотор хүргэлт',
  '● Шинэхэн баталгаа',
  '✓ Чанарын хяналт',
  '● Root to Table',
  '✓ Муу ногоо хэзээ ч хүрдэггүй',
  '● Өдөр бүр шинэ нөөц',
]

const TRUST_ITEMS = [
  { icon: CheckCircle, title: 'Өдөр бүр шалгадаг', desc: 'Барс зах дээрээс 07:30-д шалгаж, зөвхөн сайн чанарын ногоог авдаг.' },
  { icon: Clock, title: '2 цагийн хүргэлт', desc: 'Захиалга өгснөөс хойш 2 цагийн дотор таны хаалган дээр хүргэнэ.' },
  { icon: Shield, title: 'Бүрэн ил тод', desc: 'Бүтээгдэхүүн бүр нь хаанаас ирснийг, хэзээ шалгасныг харуулдаг.' },
  { icon: Star, title: 'Чанарын баталгаа', desc: 'Таны захиалга 100% сэтгэл ханамжтай байна, эс тэгвэл буцаан олгоно.' },
]

const STEPS = [
  { num: '01', time: '07:30', title: 'Барс захаас шалгана', desc: 'Манай баг өдөр бүр 07:30-д Барс зах дээр очиж бүтээгдэхүүн бүрийг шалгадаг.' },
  { num: '02', time: '08:00', title: 'Чанарын шүүлт', desc: 'Зөвхөн хамгийн сайн чанарын ногоог сонгон авч, нөөцийн мэдээллийг шинэчилдэг.' },
  { num: '03', time: '09:00+', title: 'Та захиалга өгнө', desc: 'Апп эсвэл вэбсайтаар захиалга өгч, хаяг, хугацаагаа сонгоно.' },
  { num: '04', time: '+2ц', title: '2 цагийн дотор хүргэнэ', desc: 'Туршлагатай жолооч таны хаалган дээр хүргэж, чанарыг баталгаажуулна.' },
]

const TESTIMONIALS = [
  { name: 'Оюунцэцэг Б.', location: 'Баянзүрх, УБ', rating: 5, text: 'Үнэхээр шинэхэн ногоо. Захиалсан өдрөөс хойш 1.5 цагт хүргэсэн. Цаашид ч захиална!' },
  { name: 'Батболд Д.', location: 'Сүхбаатар, УБ', rating: 5, text: 'Дэлгүүрийн ногоонд харьцуулахад илүү шинэ, илүү хямд. Гайхалтай үйлчилгээ.' },
  { name: 'Сарантуяа Г.', location: 'Хан-Уул, УБ', rating: 5, text: 'Органик луувандаа маш их дуртай. Хүргэлт цагтаа ирдэг, жолооч маш эелдэг.' },
]

const ORDER_METHODS = [
  { icon: '💻', title: 'Онлайн', desc: 'groot.mn дээрээс захиална' },
  { icon: '📸', title: 'Instagram', desc: '@groot.mn рүү мессеж илгээнэ' },
  { icon: '📞', title: 'Утас', desc: '7700-1234 дугаарт залгана' },
  { icon: '💬', title: 'WhatsApp', desc: '9900-5678 дугаарт бичнэ' },
]

export default function Home() {
  const { state, addToCart } = useApp()
  const featured = state.products.filter(p => p.isFeatured).slice(0, 4)

  return (
    <div className="min-h-screen bg-cream">

      {/* Ticker */}
      <div className="bg-forest-dark overflow-hidden py-2.5">
        <div className="ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="bg-forest text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Left */}
            <div>
              <p className="label-mono text-lime/80 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-lime rounded-full pulse-dot" />
                Шинэ нөөц бэлэн байна
              </p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                Root to<br /><span className="text-lime">Table</span>
              </h1>
              <p className="text-white/70 text-lg leading-relaxed mb-4 max-w-md">
                Барс зах дээрээс өдөр бүр 07:30-д шалгаж, 2 цагийн дотор таны хаалган дээр хүргэдэг.
              </p>
              <p className="font-serif italic text-white/40 mb-8">
                "муу ногоо хэзээ ч хүрдэггүй"
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/shop" className="btn-primary flex items-center gap-2">
                  Захиалах <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#how-it-works" className="btn-outline border-white/30 text-white hover:bg-white/10 hover:text-white">
                  Хэрхэн ажилладаг вэ?
                </a>
              </div>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mt-10 pt-8 border-t border-white/10">
                {[
                  { val: '500+', label: 'Хэрэглэгч' },
                  { val: '07:30', label: 'Шалгах цаг' },
                  { val: '2 цаг', label: 'Хүргэлт' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-serif font-bold text-2xl text-lime">{s.val}</div>
                    <div className="label-mono text-white/40">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live product card */}
            <div className="hidden md:block">
              <div className="bg-white rounded-sm p-5 text-ink max-w-sm ml-auto shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <span className="label-mono text-forest">Өнөөдрийн нөөц</span>
                  <span className="badge-fresh">● Шинэ</span>
                </div>
                {featured.slice(0, 3).map(p => {
                  const ep = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price
                  const isLow = p.stock > 0 && p.stock <= 20
                  return (
                    <div key={p.id} className="flex items-center gap-3 py-2.5 border-b border-cream last:border-0">
                      <span className="text-2xl">{p.emoji}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-ink">{p.name}</p>
                        <p className="label-mono text-ink/40">Шалгасан {p.checkedTime} · {p.market}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-forest text-sm">{ep.toLocaleString()}₮/{p.unit}</p>
                        {isLow
                          ? <span className="badge-limited text-xs">Хязгаарлагдмал</span>
                          : <span className="badge-fresh text-xs">{p.stock} бэлэн</span>
                        }
                      </div>
                    </div>
                  )
                })}
                <Link to="/shop" className="btn-forest w-full mt-4 text-sm flex items-center justify-center gap-2">
                  Бүгдийг харах <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { emoji: '🥦', label: 'Ногоо', to: '/shop?cat=vegetable', desc: '12 төрөл' },
            { emoji: '🍎', label: 'Жимс', to: '/shop?cat=fruit', desc: '4 төрөл' },
            { emoji: '🌿', label: 'Ногоон', to: '/shop?cat=herb', desc: '2 төрөл' },
            { emoji: '🌱', label: 'Органик', to: '/shop?cat=organic', desc: '2 төрөл' },
          ].map(c => (
            <Link key={c.label} to={c.to} className="card p-4 flex items-center gap-3 hover:border-lime hover:border group transition-all">
              <span className="text-3xl">{c.emoji}</span>
              <div>
                <p className="font-semibold text-ink group-hover:text-forest">{c.label}</p>
                <p className="label-mono text-ink/40">{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="label-mono text-lime-dark mb-1">Онцлох бүтээгдэхүүн</p>
            <h2 className="section-title">Өнөөдрийн шилмэл</h2>
          </div>
          <Link to="/shop" className="text-sm text-forest hover:text-lime flex items-center gap-1 font-medium transition-colors">
            Бүгдийг харах <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* Trust bar */}
      <section className="bg-forest text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_ITEMS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-sm bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="font-serif font-semibold mb-1">{title}</h3>
                <p className="text-white/50 text-xs leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="label-mono text-lime-dark mb-2">Процесс</p>
          <h2 className="section-title">Хэрхэн ажилладаг вэ?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {STEPS.map((step, i) => (
            <div key={step.num} className="relative flex flex-col items-center text-center px-4">
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-px bg-forest/20" style={{ left: '50%' }} />
              )}
              <div className="w-16 h-16 rounded-sm bg-forest text-white flex flex-col items-center justify-center mb-4 relative z-10 shadow-md">
                <span className="label-mono text-lime text-xs">{step.time}</span>
                <span className="font-serif font-bold text-lg">{step.num}</span>
              </div>
              <h3 className="font-serif font-semibold text-ink mb-2">{step.title}</h3>
              <p className="text-sm text-ink/50 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Promise banner */}
      <section className="bg-cream-dark py-14">
        <div className="max-w-3xl mx-auto text-center px-4">
          <p className="label-mono text-lime-dark mb-4">Манай амлалт</p>
          <h2 className="font-serif text-3xl md:text-5xl font-bold text-ink leading-tight mb-6">
            "Муу ногоо хэзээ ч<br />хүрдэггүй"
          </h2>
          <p className="text-ink/60 text-lg mb-8 leading-relaxed">
            Хэрэв та захиалгадаа сэтгэл ханамжгүй бол 24 цагийн дотор мэдэгдэх бөгөөд бид буцааж солих эсвэл мөнгийг нь буцаана.
          </p>
          <Link to="/shop" className="btn-forest inline-flex items-center gap-2 py-3 px-6 text-base">
            Одоо захиалах <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <p className="label-mono text-lime-dark mb-2">Хэрэглэгчдийн сэтгэгдэл</p>
          <h2 className="section-title">Тэд юу гэж хэлдэг вэ?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="card p-5">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(t.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-gold text-gold" />)}
              </div>
              <p className="text-ink/70 text-sm leading-relaxed mb-4 italic">"{t.text}"</p>
              <div className="flex items-center gap-2 pt-3 border-t border-cream-dark">
                <div className="w-8 h-8 rounded-sm bg-forest text-white text-sm flex items-center justify-center font-serif font-bold">
                  {t.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-ink text-sm">{t.name}</p>
                  <p className="label-mono text-ink/40 flex items-center gap-1"><MapPin className="w-3 h-3" /> {t.location}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Order methods */}
      <section className="bg-forest text-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="label-mono text-lime/70 mb-2">Захиалах арга</p>
            <h2 className="font-serif text-3xl font-bold">Хэрхэн захиалах вэ?</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ORDER_METHODS.map(m => (
              <div key={m.title} className="bg-white/5 border border-white/10 rounded-sm p-5 text-center hover:bg-white/10 transition-colors cursor-pointer">
                <div className="text-4xl mb-3">{m.icon}</div>
                <h3 className="font-serif font-semibold mb-1">{m.title}</h3>
                <p className="text-white/50 text-xs">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
