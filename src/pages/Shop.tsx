import { useState, useMemo } from 'react'
import { Search, SlidersHorizontal, X, Clock } from 'lucide-react'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { categories } from '../data/products'
import type { ProductCategory } from '../types'

const SORT_OPTIONS = [
  { value: 'default', label: 'Анхдагч' },
  { value: 'price_asc', label: 'Үнэ: бага → их' },
  { value: 'price_desc', label: 'Үнэ: их → бага' },
  { value: 'rating', label: 'Үнэлгээгээр' },
  { value: 'name', label: 'Нэрээр' },
]

export default function Shop() {
  const { state } = useApp()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<ProductCategory | 'all'>('all')
  const [sort, setSort] = useState('default')
  const [onlyOrganic, setOnlyOrganic] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [maxPrice, setMaxPrice] = useState(10000)

  const filtered = useMemo(() => {
    let list = [...state.products]
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.nameEn.toLowerCase().includes(search.toLowerCase()))
    if (category !== 'all') list = list.filter(p => p.category === category)
    if (onlyOrganic) list = list.filter(p => p.isOrganic)
    list = list.filter(p => {
      const ep = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price
      return ep <= maxPrice
    })
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break
      case 'price_desc': list.sort((a, b) => b.price - a.price); break
      case 'rating': list.sort((a, b) => b.rating - a.rating); break
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break
    }
    return list
  }, [state.products, search, category, onlyOrganic, sort, maxPrice])

  const hasFilter = category !== 'all' || onlyOrganic || search || maxPrice < 10000
  const clearFilters = () => { setCategory('all'); setOnlyOrganic(false); setSearch(''); setMaxPrice(10000) }

  return (
    <div className="min-h-screen bg-cream">
      {/* Page header */}
      <div className="bg-forest text-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="label-mono text-lime/70 mb-1 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5" /> Өдөр бүр 07:30-д шалгасан
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold">Дэлгүүр</h1>
          <p className="text-white/60 mt-1">{state.products.length} төрлийн бүтээгдэхүүн бэлэн байна</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search + sort bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink/30" />
            <input
              type="text"
              placeholder="Бүтээгдэхүүн хайх..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-cream-dark bg-white rounded-sm pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-lime focus:border-transparent"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="w-4 h-4 text-ink/30 hover:text-ink/60" />
              </button>
            )}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="border border-cream-dark bg-white rounded-sm px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-lime sm:w-48"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-sm text-sm font-medium border transition-colors ${showFilters ? 'bg-forest text-white border-forest' : 'bg-white text-ink border-cream-dark hover:border-forest'}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Шүүлт
            {hasFilter && <span className="w-2 h-2 rounded-full bg-lime" />}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white border border-cream-dark rounded-sm p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="label-mono text-ink/60">Шүүлтүүр</span>
              {hasFilter && (
                <button onClick={clearFilters} className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1">
                  <X className="w-3 h-3" /> Арилгах
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="label-mono text-ink/50 mb-2">Ангилал</p>
                <div className="space-y-1.5">
                  {categories.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="radio"
                        name="category"
                        checked={category === c.id}
                        onChange={() => setCategory(c.id as ProductCategory | 'all')}
                        className="accent-lime"
                      />
                      <span className="text-sm text-ink/80 group-hover:text-ink">{c.emoji} {c.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="label-mono text-ink/50 mb-2">Дээд үнэ</p>
                <input
                  type="range"
                  min={500}
                  max={10000}
                  step={500}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-lime"
                />
                <p className="text-sm text-forest font-semibold mt-1">{maxPrice.toLocaleString('mn-MN')}₮ хүртэл</p>
              </div>
              <div>
                <p className="label-mono text-ink/50 mb-2">Нэмэлт шүүлт</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyOrganic}
                    onChange={e => setOnlyOrganic(e.target.checked)}
                    className="accent-lime"
                  />
                  <span className="text-sm text-ink/80">🌱 Зөвхөн органик</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-6">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id as ProductCategory | 'all')}
              className={`px-3 py-1.5 rounded-sm text-sm font-medium transition-colors border ${
                category === c.id
                  ? 'bg-forest text-white border-forest'
                  : 'bg-white text-ink/70 border-cream-dark hover:border-forest hover:text-ink'
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-5xl mb-4 block">🔍</span>
            <p className="font-serif text-xl text-ink mb-2">Бүтээгдэхүүн олдсонгүй</p>
            <p className="text-ink/50 text-sm mb-4">Шүүлтийг өөрчилж дахин хайж үзнэ үү</p>
            <button onClick={clearFilters} className="btn-outline">Шүүлт арилгах</button>
          </div>
        ) : (
          <>
            <p className="label-mono text-ink/40 mb-4">{filtered.length} бүтээгдэхүүн</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
