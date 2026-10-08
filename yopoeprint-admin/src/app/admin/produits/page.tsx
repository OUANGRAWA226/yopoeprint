'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Upload, X, ChevronDown, Save, AlertCircle,
  ImagePlus, Package, CheckCircle
} from 'lucide-react'
import { api } from '@/lib'
import { cloudinaryService } from '@/lib/cloudinary.service'

// ── Types ─────────────────────────────────────────────────────
interface Product {
  id:          string
  slug:        string
  name:        string
  shortDesc:   string
  description: string
  category:    string
  basePrice:   number
  minQuantity: number
  badge?:      string
  active:      boolean
  imageUrl?:   string
  emoji:       string
}

// ── Données initiales simulées ────────────────────────────────
const MOCK_PRODUCTS: Product[] = [
  { id: '1', slug: 'flyer-a5-classique',       name: 'Flyer A5 classique',       shortDesc: 'Recto/Verso · Papier couché 135g',  description: '', category: 'flyers',     basePrice: 8500,  minQuantity: 500, badge: 'popular', active: true,  emoji: '📄' },
  { id: '2', slug: 'carte-de-visite-standard', name: 'Carte de visite standard', shortDesc: '85×55mm · Plusieurs finitions',      description: '', category: 'cartes',     basePrice: 6200,  minQuantity: 250, badge: 'popular', active: true,  emoji: '🪪' },
  { id: '3', slug: 'affiche-a3-premium',       name: 'Affiche A3 premium',       shortDesc: 'Papier couché brillant 200g',        description: '', category: 'affiches',   basePrice: 12000, minQuantity: 100, badge: 'new',     active: true,  emoji: '🗓️' },
  { id: '4', slug: 'brochure-3-volets',        name: 'Brochure 3 volets',        shortDesc: 'Format A4 plié · Papier satiné',    description: '', category: 'brochures',  basePrice: 18500, minQuantity: 200, badge: 'promo',   active: true,  emoji: '📚' },
  { id: '5', slug: 'kakemono-roll-up',         name: 'Kakémono Roll-up',         shortDesc: '85×200cm · Structure incluse',       description: '', category: 'roll-up',    basePrice: 28000, minQuantity: 1,   badge: undefined, active: true,  emoji: '🪧' },
  { id: '6', slug: 'tote-bag-coton',           name: 'Tote bag coton',           shortDesc: 'Sérigraphie · 38×42cm',             description: '', category: 'goodies',    basePrice: 32000, minQuantity: 20,  badge: 'new',     active: false, emoji: '🎁' },
  { id: '7', slug: 't-shirt-personnalise',     name: 'T-shirt personnalisé',     shortDesc: 'Impression DTG · Toutes tailles',   description: '', category: 'textile',    basePrice: 4500,  minQuantity: 1,   badge: undefined, active: true,  emoji: '👕' },
  { id: '8', slug: 'etiquettes-rouleau',       name: 'Étiquettes en rouleau',    shortDesc: 'Formes au choix · Papier brillant', description: '', category: 'goodies',    basePrice: 14200, minQuantity: 500, badge: 'promo',   active: true,  emoji: '🏷️' },
]

const CATEGORIES = ['flyers', 'cartes-de-visite', 'affiches', 'brochures', 'roll-up', 'goodies', 'textile', 'evenementiel', 'signaletique', 'corporate']
const BADGES     = [{ value: '',        label: 'Aucun' }, { value: 'popular', label: '⭐ Populaire' }, { value: 'new', label: '✦ Nouveau' }, { value: 'promo', label: '🔥 Promo' }]

const EMPTY = {
  slug: '', name: '', shortDesc: '', description: '', category: 'flyers',
  basePrice: 0, minQuantity: 100, badge: '', active: true, imageUrl: '', emoji: '📄',
  // Champs requis par l'API
  bgGradient: 'linear-gradient(135deg, #E8EEF8, #C5D4F0)',
  deliveryDays: 2,
  isPopular: false,
  sortOrder: 0,
  formats: [
    { id: 'format-1', label: 'Format 1', dimensions: '10 x 15 cm' }
  ],
  papers: [
    { id: 'paper-1', label: 'Papier standard', description: 'Papier standard 80g' }
  ],
  quantities: [100, 250, 500, 1000],
  finishes: [
    { id: 'none', label: 'Aucune finition', value: 'none', priceModifier: 0 }
  ],
  images: [] // Galerie d'images multiples
}

// ── Composant modal produit ───────────────────────────────────
function ProductModal({
  product, onClose, onSave
}: {
  product: Partial<Product> | null
  onClose: () => void
  onSave:  (p: any) => void
}) {
  const isNew   = !product?.id
  // Fusionner les valeurs par défaut avec les données du produit
  const [form,  setForm]    = useState<any>(() => ({
    ...EMPTY,
    ...(product || {})
  }))
  const [saving, setSaving] = useState(false)
  const [imgPreview, setImgPreview] = useState<string>(product?.imageUrl || '')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tab, setTab]       = useState<'infos' | 'config' | 'prix' | 'media'>('infos')
  const fileRef             = useRef<HTMLInputElement>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const galleryFileRef      = useRef<HTMLInputElement>(null)
  const [galleryUploadProgress, setGalleryUploadProgress] = useState(0)
  const [galleryUploading, setGalleryUploading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setHasChanges(true)
    setForm((f: any) => ({ ...f, [k]: e.target.value }))
  }
  
  const handleClose = () => {
    if (hasChanges && !window.confirm('Vous avez des modifications non enregistrées. Êtes-vous sûr de vouloir fermer?')) {
      return
    }
    onClose()
  }

  // Générer slug depuis le nom
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true)
    const name = e.target.value
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim().replace(/\s+/g, '-')
    setForm((f: any) => ({ ...f, name, slug }))
  }

  // Upload image via Cloudinary
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true)
    const file = e.target.files?.[0]
    if (!file) return

    console.log('[ProductModal] 📸 Début upload Cloudinary')
    
    try {
      // Afficher preview local en attendant
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImgPreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload vers Cloudinary
      setUploadProgress(0)
      const cloudinaryUrl = await cloudinaryService.uploadImage(file, (progress) => {
        setUploadProgress(progress)
      })
      
      console.log('[ProductModal] ✅ Image uploadée sur Cloudinary:', cloudinaryUrl)
      
      // Sauvegarder l'URL Cloudinary
      setImgPreview(cloudinaryUrl)
      setForm((f: any) => ({ ...f, imageUrl: cloudinaryUrl }))
      setUploadProgress(0)
      
    } catch (error: any) {
      console.error('[ProductModal] ❌ Erreur upload Cloudinary:', error.message)
      alert(`❌ Erreur upload: ${error.message}`)
      setImgPreview('')
      setUploadProgress(0)
    }
  }

  // Upload image pour la galerie (Recto, Verso, Détail, etc.)
  const handleGalleryImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasChanges(true)
    const file = e.target.files?.[0]
    if (!file) return

    const label = prompt('Label de cette image (ex: Recto, Verso, Détail):', 'Vue ' + (form.images?.length + 1 || 1))
    if (!label) return

    const description = prompt('Description courte (ex: Face avant du produit):')

    console.log('[ProductModal] 📸 Début upload image galerie')
    
    try {
      setGalleryUploading(true)
      setGalleryUploadProgress(0)
      
      // Upload vers Cloudinary
      const cloudinaryUrl = await cloudinaryService.uploadImage(file, (progress) => {
        setGalleryUploadProgress(progress)
      })
      
      console.log('[ProductModal] ✅ Image galerie uploadée:', cloudinaryUrl)
      
      // Ajouter l'image à la galerie
      const newImage = {
        id: 'img-' + Date.now(),
        label,
        description: description || '',
        url: cloudinaryUrl,
        order: (form.images?.length || 0)
      }
      
      setForm((f: any) => ({ 
        ...f, 
        images: [...(f.images || []), newImage]
      }))
      
      setGalleryUploadProgress(0)
      setGalleryUploading(false)
      
      // Réinitialiser l'input
      if (galleryFileRef.current) {
        galleryFileRef.current.value = ''
      }
      
    } catch (error: any) {
      console.error('[ProductModal] ❌ Erreur upload galerie:', error.message)
      alert(`❌ Erreur upload: ${error.message}`)
      setGalleryUploadProgress(0)
      setGalleryUploading(false)
    }
  }

  const handleSave = async () => {
    console.log('[ProductModal] ━━━ DÉBUT VALIDATION FORMULAIRE ━━━')
    
    if (!form.name || !form.basePrice) {
      console.error('[ProductModal] ❌ Validation échouée: nom ou prix manquant')
      alert('Veuillez remplir: Nom du produit et Prix de base')
      return
    }
    
    // Validation simple des champs requis (avec valeurs par défaut)
    const missingFields = []
    if (!form.bgGradient) missingFields.push('Gradient')
    if (!form.deliveryDays) missingFields.push('Délai de livraison')
    if (!form.formats?.length) missingFields.push('Formats')
    if (!form.papers?.length) missingFields.push('Papiers')
    if (!form.quantities?.length) missingFields.push('Quantités')
    if (!form.finishes?.length) missingFields.push('Finitions')
    
    if (missingFields.length > 0) {
      console.error('[ProductModal] ❌ Champs manquants:', missingFields)
      alert(`Champs manquants: ${missingFields.join(', ')}\n\nAllez à l'onglet "Configuration" pour les ajouter.`)
      return
    }
    
    console.log('[ProductModal] ✅ Validation réussie!')
    console.log('[ProductModal] FormData avant envoi:')
    console.log('  - Nom:', form.name)
    console.log('  - Slug:', form.slug)
    console.log('  - Category:', form.category)
    console.log('  - Emoji:', form.emoji)
    console.log('  - bgGradient:', form.bgGradient?.substring(0, 50) + '...')
    console.log('  - basePrice:', form.basePrice)
    console.log('  - minQuantity:', form.minQuantity)
    console.log('  - deliveryDays:', form.deliveryDays)
    console.log('  - formats:', form.formats)
    console.log('  - papers:', form.papers)
    console.log('  - quantities:', form.quantities)
    console.log('  - finishes:', form.finishes)
    
    setSaving(true)
    try {
      console.log('[ProductModal] 📤 Envoi des données au serveur...')
      console.log('[ProductModal] Payload complet:', JSON.stringify(form, null, 2))
      
      if (isNew) {
        console.log('[ProductModal] MODE: Création d\'un nouveau produit')
        const response = await api.post('/products', form)
        console.log('[ProductModal] ✅ Produit créé avec succès:', response)
        // Retourner l'ID reçu du serveur
        const savedProduct = { ...form, id: response.id || response._id }
        onSave(savedProduct)
        setHasChanges(false)
      } else {
        console.log('[ProductModal] MODE: Mise à jour du produit:', form.id)
        // Utiliser PUT au lieu de PATCH pour la mise à jour complète
        const response = await api.put(`/products/${form.id}`, form)
        console.log('[ProductModal] ✅ Produit mis à jour avec succès:', response)
        onSave(form)
        setHasChanges(false)
      }
    } catch (error: any) {
      console.error('[ProductModal] ❌ Erreur lors de la sauvegarde:', error.message)
      console.error('[ProductModal] Stack:', error.stack)
      // Si erreur d'auth, ne pas continuer
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        alert('❌ Authentification requise. Veuillez vous reconnecter.')
        throw error
      }
      // Pour les autres erreurs, afficher le message
      alert(`❌ Erreur: ${error.message}`)
      // Sinon, sauvegarder en local (mode démo)
      onSave(form)
      setHasChanges(false)
    } finally {
      setSaving(false)
      console.log('[ProductModal] ━━━ FIN TRAITEMENT ━━━')
    }
  }

  const inputCls = `w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl
                    text-sm outline-none focus:border-blue-mid focus:bg-white transition-all`

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center
                    justify-center p-4" onClick={handleClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh]
                      overflow-hidden flex flex-col"
           onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="font-display text-xl font-bold text-blue-deep">
              {isNew ? 'Nouveau produit' : `Modifier — ${product?.name}`}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isNew ? 'Remplissez les informations du nouveau produit' : 'Mettez à jour les informations'}
            </p>
          </div>
          <button onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center
                       text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 pt-4 border-b border-gray-100 overflow-x-auto">
          {[
            { key: 'infos', label: '📝 Infos' },
            { key: 'config',  label: '⚙️ Configuration' },
            { key: 'prix',  label: '💰 Prix' },
            { key: 'media', label: '🖼️ Media' },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setTab(key as any)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px
                          ${tab === key
                            ? 'border-blue-mid text-blue-mid'
                            : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* ── Tab Infos ─────────────────────────────────── */}
          {tab === 'infos' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Nom du produit *
                  </label>
                  <input type="text" placeholder="Ex: Flyer A5 classique"
                    value={form.name} onChange={handleNameChange}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Slug URL
                  </label>
                  <input type="text" value={form.slug} onChange={set('slug')}
                    className={`${inputCls} font-mono text-xs`} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    /produit/<strong>{form.slug || 'votre-produit'}</strong>
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Emoji
                  </label>
                  <input type="text" value={form.emoji} onChange={set('emoji')}
                    className={`${inputCls} text-2xl text-center`} maxLength={2} />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Description courte *
                </label>
                <input type="text" placeholder="Ex: Recto/Verso · Papier couché 135g · 5 formats"
                  value={form.shortDesc} onChange={set('shortDesc')}
                  className={inputCls} />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Description complète
                </label>
                <textarea rows={4} placeholder="Description détaillée du produit, spécifications techniques, conseils d'utilisation…"
                  value={form.description} onChange={set('description')}
                  className={`${inputCls} resize-none leading-relaxed`} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Catégorie *
                  </label>
                  <select value={form.category} onChange={set('category')}
                    className={`${inputCls} cursor-pointer`}>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Badge
                  </label>
                  <select value={form.badge || ''} onChange={set('badge')}
                    className={`${inputCls} cursor-pointer`}>
                    {BADGES.map((b) => (
                      <option key={b.value} value={b.value}>{b.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className={`w-11 h-6 rounded-full transition-colors relative
                                   ${form.active ? 'bg-blue-mid' : 'bg-gray-300'}`}
                       onClick={() => {
                         setHasChanges(true)
                         setForm((f: any) => ({ ...f, active: !f.active }))
                       }}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                                     transition-transform
                                     ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-blue-deep">
                    Produit {form.active ? 'actif (visible)' : 'inactif (masqué)'}
                  </span>
                </label>
              </div>
            </>
          )}

          {/* ── Tab Configuration ─────────────────────────────────── */}
          {tab === 'config' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Gradient d'arrière-plan *
                </label>
                <input type="text" placeholder="Ex: linear-gradient(135deg, #E8EEF8, #C5D4F0)"
                  value={form.bgGradient || ''} onChange={set('bgGradient')}
                  className={inputCls} />
                <div className="mt-2 h-12 rounded-lg border-2 border-gray-100"
                  style={{ background: form.bgGradient || '#f0f0f0' }} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Délai de livraison (jours) *
                  </label>
                  <input type="number" placeholder="2"
                    value={form.deliveryDays || ''} onChange={set('deliveryDays')}
                    className={inputCls} />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Ordre d'affichage
                  </label>
                  <input type="number" placeholder="0"
                    value={form.sortOrder || ''} onChange={set('sortOrder')}
                    className={inputCls} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer flex-1">
                  <div className={`w-11 h-6 rounded-full transition-colors relative
                                   ${form.isPopular ? 'bg-blue-mid' : 'bg-gray-300'}`}
                       onClick={() => {
                         setHasChanges(true)
                         setForm((f: any) => ({ ...f, isPopular: !f.isPopular }))
                       }}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow
                                     transition-transform
                                     ${form.isPopular ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                  <span className="text-sm font-medium text-blue-deep">
                    Produit populaire
                  </span>
                </label>
              </div>

              {/* Formats */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Formats disponibles *
                </label>
                <div className="space-y-2">
                  {(form.formats || []).map((fmt: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="Ex: A5" value={fmt.label} 
                        onChange={(e) => {
                          setHasChanges(true)
                          const newFormats = [...(form.formats || [])]
                          newFormats[i].label = e.target.value
                          setForm((f: any) => ({ ...f, formats: newFormats }))
                        }}
                        className={`${inputCls} flex-1`} />
                      <input type="text" placeholder="Ex: 14.8 x 21 cm" value={fmt.dimensions}
                        onChange={(e) => {
                          setHasChanges(true)
                          const newFormats = [...(form.formats || [])]
                          newFormats[i].dimensions = e.target.value
                          setForm((f: any) => ({ ...f, formats: newFormats }))
                        }}
                        className={`${inputCls} flex-1`} />
                      <button onClick={() => {
                        setHasChanges(true)
                        const newFormats = (form.formats || []).filter((_: any, idx: number) => idx !== i)
                        setForm((f: any) => ({ ...f, formats: newFormats }))
                      }}
                        className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => {
                    setHasChanges(true)
                    const newFormats = [...(form.formats || []), { id: `fmt-${Date.now()}`, label: '', dimensions: '' }]
                    setForm((f: any) => ({ ...f, formats: newFormats }))
                  }}
                    className="w-full px-3 py-2.5 text-sm bg-blue-50 text-blue-mid rounded-xl hover:bg-blue-100 transition-all font-medium">
                    + Ajouter un format
                  </button>
                </div>
              </div>

              {/* Papiers */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Types de papierDisponibles *
                </label>
                <div className="space-y-2">
                  {(form.papers || []).map((paper: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="Ex: Papier couché 135g" value={paper.label}
                        onChange={(e) => {
                          setHasChanges(true)
                          const newPapers = [...(form.papers || [])]
                          newPapers[i].label = e.target.value
                          setForm((f: any) => ({ ...f, papers: newPapers }))
                        }}
                        className={`${inputCls} flex-1`} />
                      <input type="text" placeholder="Ex: Papier couché brillant" value={paper.description}
                        onChange={(e) => {
                          setHasChanges(true)
                          const newPapers = [...(form.papers || [])]
                          newPapers[i].description = e.target.value
                          setForm((f: any) => ({ ...f, papers: newPapers }))
                        }}
                        className={`${inputCls} flex-1`} />
                      <button onClick={() => {
                        setHasChanges(true)
                        const newPapers = (form.papers || []).filter((_: any, idx: number) => idx !== i)
                        setForm((f: any) => ({ ...f, papers: newPapers }))
                      }}
                        className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => {
                    setHasChanges(true)
                    const newPapers = [...(form.papers || []), { id: `paper-${Date.now()}`, label: '', description: '' }]
                    setForm((f: any) => ({ ...f, papers: newPapers }))
                  }}
                    className="w-full px-3 py-2.5 text-sm bg-blue-50 text-blue-mid rounded-xl hover:bg-blue-100 transition-all font-medium">
                    + Ajouter un papier
                  </button>
                </div>
              </div>

              {/* Finitions */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Finitions disponibles *
                </label>
                <div className="space-y-2">
                  {(form.finishes || []).map((finish: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <input type="text" placeholder="Ex: Mat" value={finish.label}
                        onChange={(e) => {
                          setHasChanges(true)
                          const newFinishes = [...(form.finishes || [])]
                          newFinishes[i].label = e.target.value
                          setForm((f: any) => ({ ...f, finishes: newFinishes }))
                        }}
                        className={`${inputCls} flex-1`} />
                      <input type="number" placeholder="Surcoût (FCFA)" value={finish.priceModifier}
                        onChange={(e) => {
                          setHasChanges(true)
                          const newFinishes = [...(form.finishes || [])]
                          newFinishes[i].priceModifier = parseInt(e.target.value) || 0
                          setForm((f: any) => ({ ...f, finishes: newFinishes }))
                        }}
                        className={`${inputCls} w-32`} />
                      <button onClick={() => {
                        setHasChanges(true)
                        const newFinishes = (form.finishes || []).filter((_: any, idx: number) => idx !== i)
                        setForm((f: any) => ({ ...f, finishes: newFinishes }))
                      }}
                        className="px-3 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-all">
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button onClick={() => {
                    setHasChanges(true)
                    const newFinishes = [...(form.finishes || []), { id: `finish-${Date.now()}`, label: '', value: '', priceModifier: 0 }]
                    setForm((f: any) => ({ ...f, finishes: newFinishes }))
                  }}
                    className="w-full px-3 py-2.5 text-sm bg-blue-50 text-blue-mid rounded-xl hover:bg-blue-100 transition-all font-medium">
                    + Ajouter une finition
                  </button>
                </div>
              </div>

              {/* Quantités */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 block">
                  Quantités disponibles *
                </label>
                <div className="flex flex-wrap gap-2">
                  {(form.quantities || []).map((qty: number, i: number) => (
                    <div key={i} className="flex items-center gap-1 bg-blue-50 px-3 py-2 rounded-lg">
                      <span className="text-sm font-medium">{qty}</span>
                      <button onClick={() => {
                        setHasChanges(true)
                        const newQtys = (form.quantities || []).filter((_: any, idx: number) => idx !== i)
                        setForm((f: any) => ({ ...f, quantities: newQtys }))
                      }}
                        className="text-gray-400 hover:text-red-500">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <input type="number" placeholder="Ex: 100" onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value)
                      if (val > 0) {
                        setHasChanges(true)
                        const newQtys = [...(form.quantities || []), val].sort((a, b) => a - b)
                        setForm((f: any) => ({ ...f, quantities: newQtys }));
                        (e.target as HTMLInputElement).value = ''
                      }
                    }
                  }}
                    className={`${inputCls} w-32`} />
                </div>
              </div>
            </>
          )}

          {/* ── Tab Prix ──────────────────────────────────── */}
          {tab === 'prix' && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Prix de base (FCFA) *
                  </label>
                  <input type="number" placeholder="8500"
                    value={form.basePrice || ''} onChange={set('basePrice')}
                    className={inputCls} />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Prix affiché "à partir de" sur la fiche produit
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                    Quantité minimum
                  </label>
                  <input type="number" placeholder="100"
                    value={form.minQuantity || ''} onChange={set('minQuantity')}
                    className={inputCls} />
                </div>
              </div>

              {/* Paliers de prix simulés */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
                  Grille tarifaire déressive
                </label>
                <div className="bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Quantité</th>
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Prix total (FCFA)</th>
                        <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400">Prix unitaire</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[
                        { qty: form.minQuantity || 100, factor: 1 },
                        { qty: (form.minQuantity || 100) * 2, factor: 0.9 },
                        { qty: (form.minQuantity || 100) * 5, factor: 0.78 },
                        { qty: (form.minQuantity || 100) * 10, factor: 0.65 },
                      ].map(({ qty, factor }) => {
                        const total = Math.round(form.basePrice * factor)
                        const unit  = total > 0 && qty > 0 ? (total / qty).toFixed(1) : '—'
                        return (
                          <tr key={qty} className="hover:bg-white transition-colors">
                            <td className="px-4 py-2.5 font-medium">
                              {new Intl.NumberFormat('fr-FR').format(qty)} pièces
                            </td>
                            <td className="px-4 py-2.5 font-bold text-blue-mid">
                              {total > 0 ? new Intl.NumberFormat('fr-FR').format(total) : '—'}
                            </td>
                            <td className="px-4 py-2.5 text-gray-500 text-xs">
                              {unit} FCFA/u
                              {factor < 1 && (
                                <span className="ml-2 text-green-600 font-bold">
                                  -{Math.round((1 - factor) * 100)}%
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-gray-400 mt-2">
                  Grille calculée automatiquement. Modifiable depuis Paramètres → Tarification.
                </p>
              </div>
            </>
          )}

          {/* ── Tab Media ─────────────────────────────────── */}
          {tab === 'media' && (
            <>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
                  Image principale du produit
                </label>

                {/* Zone upload */}
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 rounded-2xl p-8
                             hover:border-blue-mid hover:bg-blue-pale/30 transition-all
                             cursor-pointer text-center group">
                  {imgPreview ? (
                    <div className="relative">
                      <img src={imgPreview} alt="Preview"
                           className="max-h-48 mx-auto rounded-xl object-contain" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setImgPreview(''); setForm((f: any) => ({ ...f, imageUrl: '' })) }}
                        className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white
                                   rounded-full flex items-center justify-center
                                   hover:bg-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="w-16 h-16 bg-blue-pale rounded-2xl flex items-center
                                      justify-center mx-auto mb-3 group-hover:bg-blue-mid
                                      transition-colors">
                        <ImagePlus size={28} className="text-blue-mid group-hover:text-white" />
                      </div>
                      <p className="font-bold text-blue-deep text-sm mb-1">
                        Cliquez pour uploader une image
                      </p>
                      <p className="text-xs text-gray-400">
                        JPG, PNG, WebP · Max 5 Mo · Recommandé : 800×600px
                      </p>
                    </div>
                  )}
                </div>

                <input ref={fileRef} type="file" accept="image/*"
                  className="hidden" onChange={handleImageUpload} />

                {/* Barre de progression */}
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center text-xs text-blue-600 mb-2">
                      <span className="flex items-center gap-2">
                        <Upload size={14} className="animate-spin" />
                        <strong>Upload Cloudinary en cours…</strong>
                      </span>
                      <span className="font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden border border-blue-200">
                      <div className="h-full bg-gradient-to-r from-blue-mid to-blue-deep rounded-full transition-all duration-300"
                           style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                )}
                {uploadProgress === 100 && imgPreview && (
                  <div className="mt-2 flex items-center gap-2 text-green-600 text-xs font-medium p-2 bg-green-50 rounded-lg">
                    <CheckCircle size={14} /> ✅ Image uploadée sur Cloudinary
                  </div>
                )}
              </div>

              {/* URL externe */}
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  — Ou entrez une URL d'image
                </label>
                <input type="url" placeholder="https://…"
                  value={form.imageUrl || ''}
                  onChange={(e) => {
                    set('imageUrl')(e)
                    if (e.target.value) setImgPreview(e.target.value)
                  }}
                  className={inputCls} />
              </div>

              {/* Aperçu illustration SVG */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-bold text-gray-400 mb-2">
                  Illustration SVG automatique (si pas d'image)
                </p>
                <div className="bg-gradient-to-br from-blue-pale to-[#C5D4F0]
                                rounded-xl h-32 flex items-center justify-center">
                  <span className="text-5xl">{form.emoji}</span>
                </div>
              </div>

              {/* ─── GALERIE D'IMAGES MULTIPLES ─── */}
              <div className="border-t border-gray-100 pt-4 mt-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 block">
                  Galerie d'images (Recto, Verso, Détail…)
                </label>

                {/* Zone upload galerie */}
                <div
                  onClick={() => !galleryUploading && galleryFileRef.current?.click()}
                  className={`border-2 border-dashed border-gray-200 rounded-2xl p-6
                             ${galleryUploading ? 'bg-gray-50 cursor-not-allowed' : 'hover:border-blue-mid hover:bg-blue-pale/30 cursor-pointer'}
                             transition-all text-center group`}>
                  <div>
                    <div className="w-12 h-12 bg-blue-pale rounded-xl flex items-center
                                    justify-center mx-auto mb-2 group-hover:bg-blue-mid
                                    transition-colors">
                      <ImagePlus size={20} className="text-blue-mid group-hover:text-white" />
                    </div>
                    <p className="font-bold text-blue-deep text-sm mb-1">
                      {galleryUploading ? 'Upload en cours...' : 'Ajouter une image à la galerie'}
                    </p>
                    <p className="text-xs text-gray-400">
                      JPG, PNG, WebP · Max 5 Mo
                    </p>
                  </div>
                </div>

                <input ref={galleryFileRef} type="file" accept="image/*"
                  className="hidden" onChange={handleGalleryImageUpload} disabled={galleryUploading} />

                {/* Barre de progression galerie */}
                {galleryUploadProgress > 0 && galleryUploadProgress < 100 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex justify-between items-center text-xs text-blue-600 mb-2">
                      <span className="flex items-center gap-2">
                        <Upload size={14} className="animate-spin" />
                        <strong>Upload galerie…</strong>
                      </span>
                      <span className="font-bold">{galleryUploadProgress}%</span>
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden border border-blue-200">
                      <div className="h-full bg-gradient-to-r from-blue-mid to-blue-deep rounded-full transition-all duration-300"
                           style={{ width: `${galleryUploadProgress}%` }} />
                    </div>
                  </div>
                )}

                {/* Liste des images de la galerie */}
                {form.images && form.images.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-gray-600 mb-3">
                      Images ajoutées ({form.images.length})
                    </h4>
                    <div className="space-y-2">
                      {form.images.map((img: any, idx: number) => (
                        <div key={img.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <img src={img.url} alt={img.label}
                               className="w-12 h-12 object-cover rounded" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-blue-deep truncate">{img.label}</p>
                            <p className="text-xs text-gray-400 truncate">{img.description}</p>
                          </div>
                          <button
                            onClick={() => {
                              setHasChanges(true)
                              setForm((f: any) => ({
                                ...f,
                                images: f.images.filter((_: any, i: number) => i !== idx)
                              }))
                            }}
                            className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center
                                       text-red-500 hover:text-red-600 hover:bg-red-100 transition-colors flex-shrink-0">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl border-2 border-gray-200 text-sm
                       font-medium text-gray-500 hover:border-gray-400 transition-all">
            Annuler
          </button>
          <button onClick={handleSave} disabled={saving || !form.name}
            className="flex items-center gap-2 bg-blue-mid text-white px-6 py-2.5
                       rounded-xl font-bold text-sm hover:bg-blue-deep transition-all
                       disabled:opacity-50 disabled:cursor-not-allowed">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Enregistrement…</>
              : <><Save size={15} /> {isNew ? 'Créer le produit' : 'Enregistrer'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page principale ───────────────────────────────────────────
export default function AdminProduitsPage() {
  const [products,  setProducts]  = useState<Product[]>(MOCK_PRODUCTS)
  const [search,    setSearch]    = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [modal,     setModal]     = useState<Partial<Product> | null | false>(false)
  const [deleteId,  setDeleteId]  = useState<string | null>(null)

  // Charger les produits depuis l'API au démarrage
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await api.get('/products')
        // Gérer à la fois les réponses directes et les réponses enveloppées
        const productList = Array.isArray(data) ? data : data?.data || data?.products || []
        // Transformer les données reçues au format Product
        const transformed = productList.map((p: any) => ({
          id: p.id?.toString() || '',
          slug: p.slug || '',
          name: p.name || '',
          shortDesc: p.shortDesc || '',
          description: p.description || '',
          category: p.category || 'flyers',
          basePrice: p.basePrice || 0,
          minQuantity: p.minQuantity || 100,
          badge: p.badge || '',
          active: p.active !== false,
          imageUrl: p.imageUrl || '',
          emoji: p.emoji || '📄'
        }))
        setProducts(transformed)
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error)
        // Garder les données mock en cas d'erreur
      }
    }
    loadProducts()
  }, [])

  const filtered = products.filter((p) =>
    (catFilter === 'all' || p.category === catFilter) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()))
  )

  const handleSave = (data: any) => {
    if (data.id) {
      setProducts((ps) => ps.map((p) => p.id === data.id ? { ...p, ...data } : p))
    } else {
      setProducts((ps) => [...ps, { ...data, id: data.id || Date.now().toString() }])
    }
    setModal(false)
    // Rafraîchir la liste après 1 seconde pour que l'API ait le temps de traiter
    setTimeout(() => {
      loadProducts()
    }, 1000)
  }

  const loadProducts = async () => {
    try {
      const data = await api.get('/products')
      const productList = Array.isArray(data) ? data : data?.data || data?.products || []
      const transformed = productList.map((p: any) => ({
        id: p.id?.toString() || '',
        slug: p.slug || '',
        name: p.name || '',
        shortDesc: p.shortDesc || '',
        description: p.description || '',
        category: p.category || 'flyers',
        basePrice: p.basePrice || 0,
        minQuantity: p.minQuantity || 100,
        badge: p.badge || '',
        active: p.active !== false,
        imageUrl: p.imageUrl || '',
        emoji: p.emoji || '📄'
      }))
      setProducts(transformed)
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error)
    }
  }

  const toggleActive = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) return
    try {
      // L'endpoint pour toggle est PATCH /products/:id/toggle
      await api.patch(`/products/${id}/toggle`, {})
      setProducts((ps) => ps.map((p) => p.id === id ? { ...p, active: !p.active } : p))
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error)
      // Basculer quand même si API indisponible
      setProducts((ps) => ps.map((p) => p.id === id ? { ...p, active: !p.active } : p))
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/products/${id}`)
      setProducts((ps) => ps.filter((p) => p.id !== id))
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      // Supprimer quand même si API indisponible
      setProducts((ps) => ps.filter((p) => p.id !== id))
    }
    setDeleteId(null)
  }

  return (
    <div className="space-y-5">

      {/* ── Toolbar ───────────────────────────────────────── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input placeholder="Rechercher un produit…"
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl
                       text-sm outline-none focus:border-blue-mid transition-all" />
        </div>

        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm
                     outline-none cursor-pointer focus:border-blue-mid">
          <option value="all">Toutes catégories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-blue-mid text-white px-5 py-2.5
                     rounded-xl font-bold text-sm hover:bg-blue-deep transition-all
                     shadow-sm whitespace-nowrap">
          <Plus size={16} /> Nouveau produit
        </button>
      </div>

      {/* ── Stats rapides ─────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total produits', value: products.length,                  color: 'text-blue-mid' },
          { label: 'Actifs',         value: products.filter((p) => p.active).length,  color: 'text-green-600' },
          { label: 'Inactifs',       value: products.filter((p) => !p.active).length, color: 'text-gray-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white border border-gray-100 rounded-xl p-4 text-center">
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Grille produits ───────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id}
            className={`bg-white border-2 rounded-2xl overflow-hidden transition-all
                         ${p.active ? 'border-gray-100' : 'border-gray-100 opacity-60'}`}>

            {/* Image zone */}
            <div className="h-36 bg-gradient-to-br from-blue-pale to-[#C5D4F0]
                            flex items-center justify-center relative overflow-hidden">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name}
                     className="w-full h-full object-cover" />
              ) : (
                <span className="text-5xl filter drop-shadow">{p.emoji}</span>
              )}
              {/* Badge */}
              {p.badge && (
                <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full
                                  text-[10px] font-bold
                                  ${p.badge === 'popular' ? 'bg-gold text-blue-deep' :
                                    p.badge === 'new'     ? 'bg-green-600 text-white' :
                                                            'bg-red-600 text-white'}`}>
                  {p.badge === 'popular' ? '⭐ Populaire' : p.badge === 'new' ? '✦ Nouveau' : '🔥 Promo'}
                </span>
              )}
              {/* Statut */}
              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full
                                text-[10px] font-bold
                                ${p.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {p.active ? '● Actif' : '○ Inactif'}
              </span>
            </div>

            {/* Infos */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-blue-deep text-sm leading-snug">{p.name}</h3>
                <span className="text-xs bg-blue-pale text-blue-mid px-2 py-0.5 rounded-full
                                 font-medium shrink-0">{p.category}</span>
              </div>
              <p className="text-xs text-gray-400 mb-3 line-clamp-1">{p.shortDesc}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-display font-bold text-blue-mid text-base leading-none">
                    {new Intl.NumberFormat('fr-FR').format(p.basePrice)}
                    <span className="text-xs font-sans font-normal text-gray-400 ml-1">FCFA</span>
                  </p>
                  <p className="text-[10px] text-gray-400">
                    min. {new Intl.NumberFormat('fr-FR').format(p.minQuantity)} pièces
                  </p>
                </div>
                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleActive(p.id)}
                    className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center
                               justify-center text-gray-400 hover:text-blue-mid transition-all">
                    {p.active ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                  <button onClick={() => setModal(p)}
                    className="w-8 h-8 rounded-lg hover:bg-blue-pale flex items-center
                               justify-center text-gray-400 hover:text-blue-mid transition-all">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteId(p.id)}
                    className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center
                               justify-center text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carte ajout */}
        <button onClick={() => setModal({})}
          className="border-2 border-dashed border-gray-200 rounded-2xl
                     flex flex-col items-center justify-center gap-3 p-8
                     hover:border-blue-mid hover:bg-blue-pale/30 transition-all
                     text-gray-400 hover:text-blue-mid group min-h-[240px]">
          <div className="w-14 h-14 rounded-2xl bg-gray-100 group-hover:bg-blue-mid
                          flex items-center justify-center transition-all">
            <Plus size={24} className="group-hover:text-white" />
          </div>
          <p className="font-bold text-sm">Ajouter un produit</p>
        </button>
      </div>

      {/* ── Modal produit ─────────────────────────────────── */}
      {modal !== false && (
        <ProductModal
          product={modal}
          onClose={() => setModal(false)}
          onSave={handleSave}
        />
      )}

      {/* ── Modal confirmation suppression ────────────────── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm
                        flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center
                            justify-center mx-auto mb-4">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="font-bold text-blue-deep text-center mb-2">
              Supprimer ce produit ?
            </h3>
            <p className="text-sm text-gray-400 text-center mb-5">
              Cette action est irréversible. Le produit sera définitivement supprimé.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-sm
                           font-medium hover:border-gray-400 transition-all">
                Annuler
              </button>
              <button onClick={() => handleDelete(deleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm
                           font-bold hover:bg-red-600 transition-all">
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
