import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ShoppingCart, Heart, Plus, Minus, Package, Calendar, Award, Leaf, Truck } from 'lucide-react'
import { useApp } from '../context/AppContext'

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const { state, addToCart, toggleFavorite, isFavorite } = useApp()
  const navigate = useNavigate()

  const product = state.products.find(p => p.id === productId)
  const [qty, setQty] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<string | null>(
    product?.variants?.[0]?.id ?? null
  )

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center text-center px-4">
        <div>
          <span className="text-5xl block mb-4">🔍</span>
          <p className="font-serif text-xl text-ink mb-2">Бүтээгдэхүүн олдсонгүй</p>
          <button onClick={() => navigate('/shop')} className="btn-forest mt-4">Дэлгүүр рүү буцах</button>
        </div>
      </div>
    )
  }

  const fav = isFavorite(product.id)
  const isSoldOut = product.stock === 0
  const isLow = product.stock > 0 && product.stock <= 20

  const activeVariant = product.variants?.find(v => v.id === selectedVariant)
  const basePrice = activeVariant ? activeVariant.price : product.price
  // Apply discount to both base price and variant prices
  const effectivePrice = product.discount
    ? Math.round(basePrice * (1 - product.discount / 100))
    : basePrice

  // Wholesale pricing
  const isWholesale = product.wholesalePrice && product.minWholesaleQty && qty >= product.minWholesaleQty
  const displayPrice = isWholesale ? product.wholesalePrice! : effectivePrice

  // Related products
  const related = state.products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  const handleAddToCart = () => {
    addToCart(product, qty)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-forest text-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-white/60 hover:text-white text-sm mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Буцах
          </button>
          <p className="text-white/40 text-xs font-mono uppercase tracking-wide">
            Дэлгүүр / {product.category} / {product.name}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image hero */}
          <div className={`relative bg-gradient-to-br ${product.bgGradient} rounded-sm flex items-center justify-center h-72 md:h-96 overflow-hidden`}>
            {product.image
              ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              : <span className="text-8xl select-none">{product.emoji}</span>
            }
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {isSoldOut
                ? <span className="font-mono text-xs uppercase tracking-wide px-2 py-0.5 bg-gray-100 text-gray-500 border border-gray-200 rounded-sm">Дууссан</span>
                : isLow
                ? <span className="badge-limited">Хязгаарлагдмал</span>
                : <span className="badge-fresh">● Шинэ</span>
              }
              {product.isOrganic && <span className="badge-organic">🌱 Органик</span>}
              {product.discount && (
                <span className="font-mono text-xs px-2 py-0.5 bg-red-100 text-red-600 border border-red-200 rounded-sm uppercase tracking-wide">-{product.discount}%</span>
              )}
            </div>
            {/* Favorite */}
            {state.user?.role === 'customer' && (
              <button
                onClick={() => toggleFavorite(product.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-sm bg-white shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
              >
                <Heart className={`w-5 h-5 ${fav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </button>
            )}
          </div>

          {/* Product info */}
          <div className="flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h1 className="font-serif text-2xl md:text-3xl font-bold text-ink leading-tight">{product.name}</h1>
              <span className="label-mono text-ink/40 mt-2 shrink-0">/{product.unit}</span>
            </div>
            {product.nameEn && <p className="text-ink/40 text-sm mb-3">{product.nameEn}</p>}

            {/* Origin + badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="label-mono bg-cream px-2 py-1 rounded-sm border border-cream-dark text-ink/60">
                📍 {product.origin}
              </span>
              {product.freeDelivery && (
                <span className="label-mono bg-lime/10 text-lime-dark border border-lime/20 px-2 py-1 rounded-sm flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Үнэгүй хүргэлт
                </span>
              )}
              {product.isOrganic && (
                <span className="label-mono bg-forest/10 text-forest border border-forest/20 px-2 py-1 rounded-sm flex items-center gap-1">
                  <Leaf className="w-3 h-3" /> Органик
                </span>
              )}
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-4">
                <p className="label-mono text-ink/50 mb-2">Савлагааны сонголт</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v.id)}
                      className={`px-3 py-2 rounded-sm border text-sm font-semibold transition-colors ${selectedVariant === v.id ? 'border-forest bg-forest text-white' : 'border-cream-dark bg-cream hover:border-forest/40 text-ink'}`}
                    >
                      {v.name} — {v.price.toLocaleString('mn-MN')}₮
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <span className="font-serif font-bold text-forest text-3xl">
                  {displayPrice.toLocaleString('mn-MN')}₮
                </span>
                {product.discount && !isWholesale && (
                  <span className="text-sm text-ink/30 line-through">{basePrice.toLocaleString('mn-MN')}₮</span>
                )}
                {isWholesale && (
                  <span className="label-mono text-lime-dark">бөөний үнэ</span>
                )}
              </div>

              {/* Wholesale info */}
              {product.wholesalePrice && product.minWholesaleQty && (
                <div className="mt-2 bg-lime/10 border border-lime/20 rounded-sm px-3 py-2 text-xs text-lime-dark">
                  <Package className="w-3.5 h-3.5 inline mr-1" />
                  <strong>{product.minWholesaleQty}+</strong> {product.unit} захиалбал бөөний үнэ:{' '}
                  <strong>{product.wholesalePrice.toLocaleString('mn-MN')}₮/{product.unit}</strong>
                </div>
              )}
            </div>

            {/* Stock info */}
            {isSoldOut ? (
              <div className="mb-4 text-sm text-red-500 font-semibold">Нөөц дууссан</div>
            ) : isLow ? (
              <div className="mb-4 text-sm text-gold font-semibold">⚠️ Зөвхөн {product.stock} {product.unit} үлдсэн</div>
            ) : (
              <div className="mb-4 text-sm text-lime-dark font-semibold">✓ Нөөцтэй ({product.stock} {product.unit})</div>
            )}

            {/* Quantity + Add to cart */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center gap-2 border border-cream-dark rounded-sm bg-cream">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark transition-colors rounded-l-sm">
                  <Minus className="w-4 h-4 text-ink" />
                </button>
                <span className="w-10 text-center font-bold text-ink">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark transition-colors rounded-r-sm">
                  <Plus className="w-4 h-4 text-ink" />
                </button>
              </div>
              <button
                disabled={isSoldOut}
                onClick={handleAddToCart}
                className="flex-1 btn-forest py-2.5 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                Сагсанд нэмэх
              </button>
            </div>

            {/* Description */}
            {product.description && (
              <div className="mb-4">
                <p className="label-mono text-ink/50 mb-1.5">Тайлбар</p>
                <p className="text-sm text-ink/70 leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Dates */}
            {(product.packagedAt || product.certifiedAt) && (
              <div className="flex flex-wrap gap-3">
                {product.packagedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-ink/50">
                    <Calendar className="w-3.5 h-3.5 text-lime-dark" />
                    Савласан: <span className="font-semibold text-ink/70">{product.packagedAt}</span>
                  </div>
                )}
                {product.certifiedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-ink/50">
                    <Award className="w-3.5 h-3.5 text-lime-dark" />
                    Баталгаажуулсан: <span className="font-semibold text-ink/70">{product.certifiedAt}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h2 className="font-serif text-xl font-bold text-ink mb-4">Ижил төрлийн бүтээгдэхүүн</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const ep = p.discount ? Math.round(p.price * (1 - p.discount / 100)) : p.price
                return (
                  <Link
                    key={p.id}
                    to={`/shop/${p.id}`}
                    className="card group flex flex-col overflow-hidden hover:border-t-2 hover:border-t-lime transition-all"
                  >
                    <div className={`bg-gradient-to-br ${p.bgGradient} flex items-center justify-center h-28`}>
                      {p.image
                        ? <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        : <span className="text-4xl group-hover:scale-110 transition-transform">{p.emoji}</span>
                      }
                    </div>
                    <div className="p-2.5">
                      <p className="font-semibold text-ink text-xs truncate">{p.name}</p>
                      <p className="font-serif font-bold text-forest text-sm mt-0.5">{ep.toLocaleString('mn-MN')}₮</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
