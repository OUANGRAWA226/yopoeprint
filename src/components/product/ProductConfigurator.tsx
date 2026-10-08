'use client'

import { useState, useMemo } from 'react'
import { Product, ProductFormat, ProductPaper, ProductOption } from '@/types'
import { calculatePrice, formatPrice } from '@/lib/data'
import { useCartStore } from '@/hooks/useCart'
import { ShoppingCart, Upload, FileCheck, ChevronDown } from 'lucide-react'

interface ConfiguratorProps {
 product: Product
}

export function ProductConfigurator({ product }: ConfiguratorProps) {
 const [selectedFormat, setFormat] = useState<ProductFormat>(product.formats[0])
 const [selectedPaper, setPaper] = useState<ProductPaper>(product.papers[0])
 const [selectedFinish, setFinish] = useState<ProductOption>(product.finishes[0])
 const [selectedQuantity, setQuantity] = useState<number>(product.quantities[1] ?? product.quantities[0])
 const [rectoverso, setRectoverso] = useState(false)
 const [designOption, setDesignOption]= useState<'upload' | 'template' | 'design'>('upload')
 const [addedToCart, setAddedToCart] = useState(false)

 const addItem = useCartStore((s) => s.addItem)

 const { total, unitPrice } = useMemo(
 () => calculatePrice(product, selectedQuantity, selectedFinish.priceModifier ?? 0, rectoverso),
 [product, selectedQuantity, selectedFinish, rectoverso]
 )

 const handleAddToCart = () => {
 addItem({
 id: `${product.id}-${Date.now()}`,
 product,
 quantity: selectedQuantity,
 format: selectedFormat,
 paper: selectedPaper,
 finish: selectedFinish,
 rectoverso,
 unitPrice,
 totalPrice: total,
 })
 setAddedToCart(true)
 setTimeout(() => setAddedToCart(false), 2000)
 }

 return (
 <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">

 {/* Product Name & Rating */}
 <div className="mb-5">
 <h1 className="font-display text-2xl font-bold text-foreground mb-1">
 {product.name}
 </h1>
 <div className="flex items-center gap-3 text-sm text-gray-400">
 <span className="text-primary">★★★★★</span>
 <span>4.9 · 127 avis</span>
 <span>·</span>
 <span className="text-emerald-600 font-medium">
 ✓ Livraison sous {product.deliveryDays}j
 </span>
 </div>
 </div>

 {/* Format */}
 <ConfigSection label="Format">
 <div className="grid grid-cols-4 gap-2">
 {product.formats.map((f) => (
 <button
 key={f.id}
 onClick={() => setFormat(f)}
 className={`p-2.5 rounded-lg border-2 text-center transition-all
 ${selectedFormat.id === f.id
 ? 'border-border bg-secondary text-foreground'
 : 'border-gray-100 hover:border-gray-300 text-gray-600'
 }`}
 >
 <span className="block text-sm font-bold">{f.label}</span>
 <span className="block text-[10px] text-gray-400 mt-0.5">{f.dimensions}</span>
 </button>
 ))}
 </div>
 </ConfigSection>

 {/* Paper */}
 <ConfigSection label="Papier / Support">
 <div className="space-y-2">
 {product.papers.map((p) => (
 <button
 key={p.id}
 onClick={() => setPaper(p)}
 className={`w-full flex items-center justify-between px-4 py-2.5
 rounded-lg border-2 text-left transition-all
 ${selectedPaper.id === p.id
 ? 'border-border bg-secondary'
 : 'border-gray-100 hover:border-gray-200'
 }`}
 >
 <div>
 <span className="text-sm font-semibold text-foreground">{p.label}</span>
 <span className="block text-xs text-gray-400 mt-0.5">{p.description}</span>
 </div>
 {selectedPaper.id === p.id && (
 <span className="text-foreground font-bold text-xs">✓</span>
 )}
 </button>
 ))}
 </div>
 </ConfigSection>

 {/* Quantity */}
 <ConfigSection label="Quantité">
 <div className="flex flex-wrap gap-2">
 {product.quantities.map((q) => (
 <button
 key={q}
 onClick={() => setQuantity(q)}
 className={`px-4 py-2 rounded-lg border-2 text-sm font-semibold transition-all
 ${selectedQuantity === q
 ? 'border-border bg-foreground text-white'
 : 'border-gray-100 text-gray-600 hover:border-gray-300'
 }`}
 >
 {new Intl.NumberFormat('fr-FR').format(q)}
 </button>
 ))}
 </div>
 </ConfigSection>

 {/* Finish */}
 <ConfigSection label="Finition">
 <div className="grid grid-cols-2 gap-2">
 {product.finishes.map((f) => (
 <button
 key={f.id}
 onClick={() => setFinish(f)}
 className={`px-3 py-2 rounded-lg border-2 text-left transition-all
 ${selectedFinish.id === f.id
 ? 'border-primary bg-primary'
 : 'border-gray-100 hover:border-gray-200'
 }`}
 >
 <span className="block text-xs font-semibold text-foreground">{f.label}</span>
 {f.priceModifier ? (
 <span className="block text-[10px] text-gray-400">
 +{formatPrice(f.priceModifier)}
 </span>
 ) : (
 <span className="block text-[10px] text-emerald-600">Inclus</span>
 )}
 </button>
 ))}
 </div>
 </ConfigSection>

 {/* Recto/Verso */}
 <ConfigSection label="Impression">
 <div className="flex gap-3">
 {['Recto simple', 'Recto/Verso'].map((opt, i) => (
 <button
 key={opt}
 onClick={() => setRectoverso(i === 1)}
 className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all
 ${rectoverso === (i === 1)
 ? 'border-border bg-secondary text-foreground'
 : 'border-gray-100 text-gray-500 hover:border-gray-200'
 }`}
 >
 {opt}
 </button>
 ))}
 </div>
 </ConfigSection>

 {/* Design Upload */}
 <ConfigSection label="Votre design">
 <div className="flex gap-2 mb-3">
 {[
 { key: 'upload', label: '📁 Uploader mon fichier' },
 { key: 'template', label: '🎨 Utiliser un template' },
 { key: 'design', label: '✏️ Faire concevoir' },
 ].map(({ key, label }) => (
 <button
 key={key}
 onClick={() => setDesignOption(key as typeof designOption)}
 className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all
 ${designOption === key
 ? 'border-border bg-secondary text-foreground'
 : 'border-gray-100 text-gray-500 hover:border-gray-200'
 }`}
 >
 {label}
 </button>
 ))}
 </div>

 {designOption === 'upload' && (
 <div className="border-2 border-dashed border-gray-200 rounded-xl p-5
 text-center hover:border-border transition-colors cursor-pointer">
 <Upload size={24} className="mx-auto text-gray-300 mb-2" />
 <p className="text-sm font-medium text-gray-500">
 Glissez votre fichier ici ou cliquez pour parcourir
 </p>
 <p className="text-xs text-gray-400 mt-1">PDF, AI, PSD, JPG · Max 50MB · 300 dpi min</p>
 </div>
 )}

 {designOption === 'template' && (
 <div className="bg-secondary rounded-xl p-4 text-center">
 <p className="text-sm text-foreground font-medium">
 🎨 Parcourir les templates disponibles
 </p>
 </div>
 )}

 {designOption === 'design' && (
 <div className="bg-primary rounded-xl p-4 text-center">
 <p className="text-sm text-primary font-medium">
 ✏️ Notre équipe créative vous accompagne — délai 24h ouvrées
 </p>
 </div>
 )}
 </ConfigSection>

 {/* Price & CTA */}
 <div className="mt-6 p-4 bg-secondary rounded-2xl">
 <div className="flex items-end justify-between mb-4">
 <div>
 <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Prix total</p>
 <p className="font-display text-3xl font-bold text-foreground">
 {new Intl.NumberFormat('fr-FR').format(total)}{' '}
 <span className="text-sm font-body font-normal text-gray-400">FCFA</span>
 </p>
 <p className="text-xs text-gray-400 mt-1">
 soit {unitPrice} FCFA / pièce · {selectedQuantity} exemplaires
 </p>
 </div>
 <div className="text-right">
 <p className="text-xs text-emerald-600 font-medium">✓ Vérification fichier incluse</p>
 <p className="text-xs text-emerald-600 font-medium">✓ Livraison sous {product.deliveryDays}j</p>
 </div>
 </div>

 <button
 onClick={handleAddToCart}
 className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl
 font-bold text-base transition-all duration-300
 ${addedToCart
 ? 'bg-emerald-600 text-white'
 : 'bg-foreground text-white hover:bg-foreground hover:-translate-y-0.5 shadow-elevation'
 }`}
 >
 {addedToCart ? (
 <>
 <FileCheck size={18} />
 Ajouté au panier !
 </>
 ) : (
 <>
 <ShoppingCart size={18} />
 Ajouter au panier
 </>
 )}
 </button>
 </div>

 </div>
 )
}

function ConfigSection({ label, children }: { label: string; children: React.ReactNode }) {
 return (
 <div className="mb-5">
 <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
 {label}
 </label>
 {children}
 </div>
 )
}
