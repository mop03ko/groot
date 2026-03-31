import { ShoppingCart, Heart } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext'
import type { Product } from '../types'

interface Props { product: Product }

export default function ProductCard({ product }: Props) {
  const { addToCart, toggleFavorite, isFavorite, state, toast } = useApp()
  const navigate = useNavigate()
  const [showVariants, setShowVariants] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null)

  const effectivePrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price

  const fav = isFavorite(product.id)
  const isLow = product.stock > 0 && product.stock <= 20
  const isSoldOut = product.stock === 0
  const hasVariants = product.variants && product.variants.length > 0

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (state.user?.role !== 'customer') {
      toast('Сагслахын тулд нэвтэрч орно уу', 'error')
      navigate('/login')
      return
    }

    if (hasVariants) {
      if (!showVariants) {
        setShowVariants(true)
        return
      }
      if (!selectedVariant) {
        toast('Савлагааны сонголт хийнэ үү', 'error')
        return
      }
      addToCart(product, 1, selectedVariant)
      setShowVariants(false)
      setSelectedVariant(null)
    } else {
      addToCart(product)
    }
  }

  return (
    <div className="card group flex flex-col overflow-hidden border-t-2 border-t-transparent hover:border-t-lime transition-all duration-200">
      {/* Image — links to product detail */}
      <Link to={`/shop/${product.id}`} className="block">
        <div className={`relative bg-gradient-to-br ${product.bgGradient} flex items-center justify-center h-36 select-none overflow-hidden`}>
          {product.image
            ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            : <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{product.emoji}</span>
          }

          {/* Status badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isSoldOut ? (
              <span className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-sm">Дууссан</span>
            ) : isLow ? (
              <span className="badge-limited">Хязгаарлагдмал</span>
            ) : (
              <span className="badge-fresh">● Шинэ</span>
            )}
            {product.isOrganic && <span className="badge-organic">🌱 Органик</span>}
            {product.discount && <span className="font-mono text-xs px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded-sm uppercase tracking-wide">-{product.discount}%</span>}
          </div>

          {/* Favorite */}
          {state.user?.role === 'customer' && (
            <button
              onClick={(e) => { e.preventDefault(); toggleFavorite(product.id) }}
              className="absolute top-2 right-2 w-7 h-7 rounded-sm bg-white shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
            >
              <Heart className={`w-3.5 h-3.5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
          )}

          {/* Sold out overlay */}
          {isSoldOut && (
            <div className="absolute inset-0 bg-cream/80 flex items-center justify-center">
              <span className="label-mono text-gray-500">Нөөц дууссан</span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link to={`/shop/${product.id}`} className="block">
          <div className="flex items-start justify-between gap-1 mb-0.5">
            <h3 className="font-serif font-semibold text-ink text-sm leading-tight hover:text-forest transition-colors">{product.name}</h3>
            <span className="label-mono shrink-0 mt-0.5">/{product.unit}</span>
          </div>
          <p className="text-xs text-ink/50 mb-2 line-clamp-2 leading-relaxed flex-1">{product.description}</p>
        </Link>

        {/* Price + CTA */}
        <div className="flex flex-col mt-auto gap-2">
          {showVariants && hasVariants && (
            <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <select
                className="w-full text-xs border border-cream-dark rounded-sm px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-forest bg-white"
                value={selectedVariant || ''}
                onChange={e => { e.preventDefault(); setSelectedVariant(e.target.value); }}
                onClick={e => e.preventDefault()}
              >
                <option value="" disabled>Сонгох...</option>
                {product.variants!.map(v => (
                  <option key={v.id} value={v.id}>{v.name} - {v.price.toLocaleString('mn-MN')}₮</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-serif font-bold text-forest text-base">
                {effectivePrice.toLocaleString('mn-MN')}₮
              </span>
              {product.discount && (
                <span className="text-xs text-ink/30 line-through ml-1.5">
                  {product.price.toLocaleString('mn-MN')}₮
                </span>
              )}
            </div>
            <button
              disabled={isSoldOut}
              onClick={handleAddClick}
              className="flex items-center gap-1.5 bg-forest hover:bg-forest-light disabled:opacity-30 disabled:cursor-not-allowed text-white text-xs font-semibold px-3 py-2 rounded-sm transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {showVariants && hasVariants ? 'Нэмэх' : hasVariants ? 'Сонгох' : 'Нэмэх'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
