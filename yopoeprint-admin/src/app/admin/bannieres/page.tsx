'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import {
  Plus, Edit2, Trash2, Eye, Upload, CheckCircle,
  AlertCircle, ArrowUp, ArrowDown, ExternalLink,
  X, Save, Sparkles, Image as ImageIcon, Loader2
} from 'lucide-react'
import { cloudinaryService } from '@/lib/cloudinary.service'
import { api } from '@/lib'

export interface BannerItem {
  id: string
  title: string
  imageUrl: string
  mobileImageUrl?: string
  linkUrl: string
  badge?: string
  altText?: string
  order: number
  active: boolean
}

// Bannières initiales synchronisées avec le storefront
const INITIAL_BANNERS: BannerItem[] = [
  {
    id: 'banner-promo-atelier',
    title: 'Offre Spéciale Atelier : Impression Offset & Numérique HD',
    imageUrl: '/images/banners/banner-promo-atelier.jpg',
    linkUrl: '/catalogue',
    badge: 'Offre Atelier',
    altText: 'YopoePrint - Cartes de visite, Roll-up et flyers haute définition',
    order: 1,
    active: true,
  },
  {
    id: 'banner-pack-salons',
    title: 'Pack Salons & Foires : SIAO, SNC et Événements Pro',
    imageUrl: '/images/banners/banner-pack-salons.jpg',
    linkUrl: '/catalogue/roll-up',
    badge: 'Spécial SIAO & SNC',
    altText: 'Stands d’exposition, roll-ups aluminium et comptoirs événementiels',
    order: 2,
    active: true,
  },
  {
    id: 'banner-cartes-luxe',
    title: 'Cartes de Visite Prestige : Dorure à Chaud & Vernis 3D',
    imageUrl: '/images/banners/banner-cartes-luxe.jpg',
    linkUrl: '/catalogue/cartes',
    badge: 'Finitions Luxe',
    altText: 'Cartes de visite 350g et 450g avec dorure or et finitions velours',
    order: 3,
    active: true,
  },
]

const STORAGE_KEY = 'yopoeprint_custom_banners'

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerItem[]>(INITIAL_BANNERS)
  const [loading, setLoading] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Partial<BannerItem> | null>(null)
  const [previewBanner, setPreviewBanner] = useState<BannerItem | null>(null)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Chargement des bannières au montage
  useEffect(() => {
    const loadBanners = async () => {
      setLoading(true)
      try {
        // 1. Tenter l'appel API
        const remote = await api.get<BannerItem[]>('/banners')
        if (Array.isArray(remote) && remote.length > 0) {
          setBanners(remote.sort((a, b) => (a.order || 0) - (b.order || 0)))
          setLoading(false)
          return
        }
      } catch {
        // Fallback transparent
      }

      // 2. Vérifier localStorage
      if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(STORAGE_KEY)
        if (cached) {
          try {
            const parsed = JSON.parse(cached)
            if (Array.isArray(parsed) && parsed.length > 0) {
              setBanners(parsed)
              setLoading(false)
              return
            }
          } catch (e) {
            console.error('Erreur lecture localStorage bannières', e)
          }
        }
      }

      setBanners(INITIAL_BANNERS)
      setLoading(false)
    }

    loadBanners()
  }, [])

  // Sauvegarde des bannières
  const saveBannersList = async (updated: BannerItem[]) => {
    const sorted = [...updated].sort((a, b) => (a.order || 0) - (b.order || 0))
    setBanners(sorted)

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted))
    }

    try {
      await api.post('/banners/sync', { banners: sorted })
    } catch {
      // API optionnelle
    }

    setSuccessMsg('Bannières synchronisées avec succès !')
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  // Toggle activation
  const handleToggleActive = (id: string) => {
    const updated = banners.map(b => b.id === id ? { ...b, active: !b.active } : b)
    saveBannersList(updated)
  }

  // Réordonner
  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= banners.length) return

    const newBanners = [...banners]
    const temp = newBanners[index]
    newBanners[index] = newBanners[targetIndex]
    newBanners[targetIndex] = temp

    // Réattribuer les ordres
    newBanners.forEach((b, i) => {
      b.order = i + 1
    })

    saveBannersList(newBanners)
  }

  // Supprimer
  const handleDelete = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) return
    const updated = banners.filter(b => b.id !== id)
    saveBannersList(updated)
  }

  // Upload d'image Cloudinary
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setUploadProgress(0)
      const uploadedUrl = await cloudinaryService.uploadImage(file, (progress) => {
        setUploadProgress(progress)
      })
      if (editingBanner) {
        setEditingBanner(prev => ({
          ...prev,
          imageUrl: uploadedUrl,
        }))
      }
      setUploadProgress(null)
    } catch (err: any) {
      alert(err.message || 'Erreur lors du téléversement de l’image')
      setUploadProgress(null)
    }
  }

  // Sauvegarder la modale
  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingBanner?.imageUrl) {
      alert('Veuillez spécifier une image pour la bannière (upload ou URL)')
      return
    }

    const isNew = !editingBanner.id
    const bannerToSave: BannerItem = {
      id: editingBanner.id || `banner-${Date.now()}`,
      title: editingBanner.title || 'Nouvelle campagne promotionnelle',
      imageUrl: editingBanner.imageUrl,
      linkUrl: editingBanner.linkUrl || '/catalogue',
      badge: editingBanner.badge || '',
      altText: editingBanner.altText || editingBanner.title || '',
      order: editingBanner.order || banners.length + 1,
      active: editingBanner.active !== undefined ? editingBanner.active : true,
    }

    let updated: BannerItem[]
    if (isNew) {
      updated = [...banners, bannerToSave]
    } else {
      updated = banners.map(b => b.id === bannerToSave.id ? bannerToSave : b)
    }

    saveBannersList(updated)
    setEditingBanner(null)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-2xl font-black text-blue-deep">
              Carrousels & Bannières d’Accueil
            </h1>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
              Backoffice Métier
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Gérez les visuels graphiques <strong>1248 × 357 px</strong> diffusés en tête de la page d’accueil storefront.
          </p>
        </div>

        <button
          onClick={() => setEditingBanner({
            title: '',
            imageUrl: '',
            linkUrl: '/catalogue',
            badge: 'Offre Spéciale',
            order: banners.length + 1,
            active: true,
          })}
          className="inline-flex items-center gap-2 bg-blue-deep hover:bg-blue-mid text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
        >
          <Plus size={18} />
          <span>Nouvelle Bannière</span>
        </button>
      </div>

      {/* Notification Toast */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-semibold flex items-center gap-2 animate-fade-in shadow-sm">
          <CheckCircle size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Spécifications & Recommandations Techniques */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 rounded-2xl p-5 border border-blue-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-deep text-white flex items-center justify-center shrink-0 shadow-md">
            <ImageIcon size={20} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-blue-deep text-sm">Gabarit d’Image Recommandé :</span>
              <span className="bg-white font-mono font-black text-blue-mid text-xs px-2.5 py-0.5 rounded-md border border-blue-200 shadow-xs">
                1248 × 357 px (Ratio 3.5:1)
              </span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl">
              Téléversez des images complètes conçues par vos graphistes avec typographie, visuels produits et offres intégrées (style Jumia/Amazon). Le storefront affiche l’image sans surcouche de texte parasite et l’adapte de manière responsive.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 text-xs text-gray-500 font-medium">
          <Sparkles size={14} className="text-amber-500" />
          <span>Formats acceptés : JPG, PNG, WebP (max 5 MB)</span>
        </div>
      </div>

      {/* Liste des Bannières Actives */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-800 text-sm">
            Bannières configurées ({banners.length})
          </h2>
          <span className="text-xs text-gray-400">
            {banners.filter(b => b.active).length} active(s) sur le site
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">
            <Loader2 className="animate-spin mx-auto mb-2 text-blue-mid" size={24} />
            <p className="text-sm">Chargement des bannières…</p>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <ImageIcon className="mx-auto mb-2 text-gray-300" size={32} />
            <p className="text-sm font-semibold">Aucune bannière configurée</p>
            <p className="text-xs text-gray-400 mt-1">Cliquez sur « Nouvelle Bannière » pour en ajouter une.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((banner, index) => (
              <div
                key={banner.id}
                className={`p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 transition-colors ${
                  banner.active ? 'bg-white hover:bg-gray-50/60' : 'bg-gray-50/40 opacity-70'
                }`}
              >
                {/* Visual Preview */}
                <div className="flex items-center gap-4 w-full lg:w-auto">
                  {/* Ordre et boutons déplacer */}
                  <div className="flex flex-col items-center gap-1 shrink-0 text-gray-400">
                    <button
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:text-blue-mid disabled:opacity-20 cursor-pointer"
                      title="Monter"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <span className="font-mono text-xs font-bold text-gray-600">
                      #{banner.order || index + 1}
                    </span>
                    <button
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === banners.length - 1}
                      className="p-1 hover:text-blue-mid disabled:opacity-20 cursor-pointer"
                      title="Descendre"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Thumbnail (1248x357 ratio) */}
                  <div className="relative w-48 sm:w-64 h-14 sm:h-18 rounded-xl overflow-hidden bg-slate-900 border border-gray-200 shrink-0 shadow-xs group">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    <button
                      onClick={() => setPreviewBanner(banner)}
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                      title="Aperçu grand format"
                    >
                      <Eye size={18} />
                    </button>
                  </div>

                  {/* Infos */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm truncate max-w-md">
                        {banner.title}
                      </h3>
                      {banner.badge && (
                        <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                          {banner.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1 font-mono text-blue-mid truncate max-w-xs">
                        <ExternalLink size={12} />
                        {banner.linkUrl}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Switch & Actions */}
                <div className="flex items-center gap-4 self-end lg:self-center shrink-0">
                  {/* Switch Actif / Inactif */}
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <span className="text-xs font-semibold text-gray-600">
                      {banner.active ? 'Actif' : 'Inactif'}
                    </span>
                    <input
                      type="checkbox"
                      checked={banner.active}
                      onChange={() => handleToggleActive(banner.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                  </label>

                  {/* Bouton Modifier */}
                  <button
                    onClick={() => setEditingBanner(banner)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-mid transition-colors cursor-pointer"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>

                  {/* Bouton Supprimer */}
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors cursor-pointer"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── MODALE APERÇU GRAND FORMAT (1248 × 357 PX) ── */}
      {previewBanner && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewBanner(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden p-6 space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="font-bold text-gray-900 text-base">{previewBanner.title}</h3>
                <p className="text-xs text-gray-500">Rendu exact tel qu’affiché sur le carrousel d’accueil</p>
              </div>
              <button
                onClick={() => setPreviewBanner(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Container 1248 x 357 exact ratio */}
            <div className="relative w-full aspect-[1248/357] rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-slate-950">
              <Image
                src={previewBanner.imageUrl}
                alt={previewBanner.title}
                fill
                unoptimized
                className="object-cover"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
              <span>Lien de destination : <strong className="text-blue-mid font-mono">{previewBanner.linkUrl}</strong></span>
              <span className="font-mono bg-gray-100 px-2.5 py-1 rounded">1248 × 357 px</span>
            </div>
          </div>
        </div>
      )}

      {/* ── MODALE CRÉATION / ÉDITION ── */}
      {editingBanner && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setEditingBanner(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-xl font-bold text-blue-deep">
                  {editingBanner.id ? 'Modifier la bannière' : 'Ajouter une bannière carrousel'}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Format recommandé : 1248 × 357 pixels
                </p>
              </div>
              <button
                onClick={() => setEditingBanner(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveModal} className="p-6 space-y-5">

              {/* Titre / Nom de la campagne */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                  Titre / Campagne *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Offre Spéciale Foires & Salons SIAO"
                  value={editingBanner.title || ''}
                  onChange={e => setEditingBanner(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-blue-mid focus:bg-white transition-all"
                />
              </div>

              {/* Upload Image ou URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wide block">
                  Visuel Graphique (1248 × 357 px) *
                </label>

                {/* Zone de Drop / Upload Cloudinary */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-blue-mid rounded-2xl p-4 text-center bg-gray-50/70 hover:bg-blue-50/40 transition-all cursor-pointer relative"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                  {uploadProgress !== null ? (
                    <div className="py-4 space-y-2">
                      <Loader2 className="animate-spin mx-auto text-blue-mid" size={24} />
                      <p className="text-xs font-bold text-blue-deep">
                        Téléversement Cloudinary en cours… ({uploadProgress}%)
                      </p>
                      <div className="w-48 mx-auto bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-mid h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 space-y-1">
                      <Upload size={22} className="mx-auto text-blue-mid" />
                      <p className="text-xs font-bold text-gray-700">
                        Cliquez pour téléverser une image depuis votre ordinateur
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Format conseillé : 1248 × 357 px (PNG, JPG, WebP)
                      </p>
                    </div>
                  )}
                </div>

                {/* Ou champ URL directe */}
                <div className="pt-1">
                  <span className="text-[11px] text-gray-400 font-semibold block mb-1">
                    Ou collez directement l’URL d’une image :
                  </span>
                  <input
                    type="text"
                    placeholder="https://... ou /images/banners/ma-banniere.jpg"
                    value={editingBanner.imageUrl || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, imageUrl: e.target.value }))}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-blue-mid focus:bg-white"
                  />
                </div>

                {/* Prévisualisation dynamique instantanée */}
                {editingBanner.imageUrl && (
                  <div className="pt-2">
                    <span className="text-xs font-bold text-gray-600 block mb-1.5">
                      Aperçu au ratio 1248 × 357 px :
                    </span>
                    <div className="relative w-full aspect-[1248/357] rounded-xl overflow-hidden border border-gray-300 bg-slate-900 shadow-md">
                      <Image
                        src={editingBanner.imageUrl}
                        alt="Aperçu bannière"
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Lien de destination & Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Lien au Clic (URL) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="/catalogue ou /catalogue/roll-up"
                    value={editingBanner.linkUrl || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, linkUrl: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm font-mono outline-none focus:border-blue-mid focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Badge promo (Optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Offre Flash, Spécial SIAO"
                    value={editingBanner.badge || ''}
                    onChange={e => setEditingBanner(prev => ({ ...prev, badge: e.target.value }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-blue-mid focus:bg-white"
                  />
                </div>
              </div>

              {/* Ordre & Statut */}
              <div className="grid grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5 block">
                    Ordre d’affichage
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingBanner.order || 1}
                    onChange={e => setEditingBanner(prev => ({ ...prev, order: parseInt(e.target.value) || 1 }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-sm outline-none focus:border-blue-mid focus:bg-white"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 cursor-pointer py-2.5">
                    <input
                      type="checkbox"
                      checked={editingBanner.active !== false}
                      onChange={e => setEditingBanner(prev => ({ ...prev, active: e.target.checked }))}
                      className="w-4 h-4 text-blue-mid rounded border-gray-300 focus:ring-blue-mid"
                    />
                    <span className="text-sm font-bold text-gray-700">
                      Bannière activée sur le site
                    </span>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold text-sm cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-blue-deep hover:bg-blue-mid text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <Save size={16} />
                  <span>Enregistrer la bannière</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
