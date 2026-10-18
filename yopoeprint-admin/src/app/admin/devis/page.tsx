'use client'

import { useState, useEffect } from 'react'
import { 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  Eye,
  FileText,
  Paperclip,
  X,
  ChevronDown
} from 'lucide-react'
import { quotesService, Quote, QuoteStatus } from '@/lib/quotes.service'

const STATUSES = [
  { id: 'all', label: 'Toutes les demandes' },
  { id: 'new', label: 'Nouvelles demandes' },
  { id: 'processing', label: 'En cours de traitement' },
  { id: 'sent', label: 'Devis envoyé' },
  { id: 'accepted', label: 'Accepté' },
  { id: 'rejected', label: 'Refusé' }
]

export default function AdminDevisPage() {
  const [devis, setDevis] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedDevis, setSelectedDevis] = useState<Quote | null>(null)
  const [priceInput, setPriceInput] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchDevis = async () => {
    setLoading(true)
    setError('')
    try {
      setDevis(await quotesService.getAllQuotes())
    } catch (err: any) {
      setError(err?.message || 'Impossible de charger les demandes de devis')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDevis() }, [])

  const applyUpdate = (updated: Quote) => {
    setDevis((list) => list.map((d) => d.id === updated.id ? updated : d))
    setSelectedDevis((s) => s?.id === updated.id ? updated : s)
  }

  const handleStatusChange = async (id: string, newStatus: QuoteStatus) => {
    try {
      applyUpdate(await quotesService.updateStatus(id, { status: newStatus }))
    } catch (err: any) {
      window.alert(`Statut non modifié : ${err?.message || 'API indisponible'}`)
    }
  }

  const openDevis = (d: Quote) => {
    setSelectedDevis(d)
    setPriceInput(d.price ? String(d.price) : '')
  }

  // Enregistre le montant et marque le devis "envoyé" (le client est prévenu par email)
  const sendProposal = async () => {
    if (!selectedDevis) return
    const price = parseInt(priceInput.replace(/\s/g, ''), 10)
    if (!Number.isFinite(price) || price <= 0) {
      window.alert('Indiquez un montant en FCFA.')
      return
    }
    setSaving(true)
    try {
      applyUpdate(await quotesService.updateStatus(selectedDevis.id, { status: 'sent', price }))
    } catch (err: any) {
      window.alert(`Proposition non enregistrée : ${err?.message || 'API indisponible'}`)
    } finally {
      setSaving(false)
    }
  }

  const filteredDevis = devis.filter(d => {
    const matchStatus = filter === 'all' || d.status === filter
    const q = search.toLowerCase()
    const matchSearch = search === '' ||
      d.reference.toLowerCase().includes(q) ||
      d.client.name.toLowerCase().includes(q) ||
      (d.client.company || '').toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700"><Clock size={14} /> Nouveau</span>
      case 'processing': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700"><FileText size={14} /> À l'étude</span>
      case 'sent': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-100 text-indigo-700"><Send size={14} /> Envoyé au client</span>
      case 'accepted': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-green-100 text-green-700"><CheckCircle size={14} /> Accepté</span>
      case 'rejected': return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-100 text-red-700"><XCircle size={14} /> Refusé</span>
      default: return null
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* ── HEADER ── */}
      <div>
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Demandes de Devis</h1>
        <p className="text-gray-500 text-sm">Gérez les demandes sur-mesure et envoyez vos propositions.</p>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher par référence, client, sujet..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none w-full sm:w-64 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
          >
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={fetchDevis} className="font-bold underline">Réessayer</button>
        </div>
      )}

      {/* ── TABLEAU ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Réf. & Date</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Client</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Sujet de la demande</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs">Statut</th>
                <th className="px-6 py-4 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Chargement des devis...
                  </td>
                </tr>
              ) : filteredDevis.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucune demande de devis trouvée.
                  </td>
                </tr>
              ) : (
                filteredDevis.map(d => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 whitespace-nowrap">{d.reference}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{d.client.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.client.company || d.client.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 line-clamp-1">{d.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {d.files && d.files.length > 0 && (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                            <Paperclip size={10} /> {d.files.length} fichier(s)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(d.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="relative">
                          <select
                            value={d.status}
                            onChange={(e) => handleStatusChange(d.id, e.target.value as QuoteStatus)}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-blue-500 outline-none cursor-pointer"
                          >
                            <option value="new">À traiter</option>
                            <option value="processing">En étude</option>
                            <option value="sent">Envoyé au client</option>
                            <option value="accepted">Devis Accepté</option>
                            <option value="rejected">Devis Refusé</option>
                          </select>
                          <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                        <button 
                          onClick={() => openDevis(d)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lire la demande"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── MODAL LECTURE ── */}
      {selectedDevis && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedDevis(null)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">Demande {selectedDevis.reference}</h2>
                <p className="text-xs text-gray-500 mt-1">Reçue le {new Date(selectedDevis.createdAt).toLocaleString('fr-FR')}</p>
              </div>
              <button onClick={() => setSelectedDevis(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="bg-gray-50 rounded-xl p-4 flex gap-6 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                  <p className="font-bold text-gray-900">{selectedDevis.client.name}</p>
                  {selectedDevis.client.company && <p className="text-sm text-gray-600">{selectedDevis.client.company}</p>}
                  <p className="text-xs text-gray-400 mt-0.5">{selectedDevis.profile}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <a href={`mailto:${selectedDevis.client.email}`} className="block text-sm text-blue-600 hover:underline">{selectedDevis.client.email}</a>
                  <a href={`tel:${selectedDevis.client.phone}`} className="block text-sm text-gray-600">{selectedDevis.client.phone}</a>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{selectedDevis.title}</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedDevis.description}
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
                  {[
                    ['Quantité', selectedDevis.quantity],
                    ['Format', selectedDevis.format || '—'],
                    ['Budget', selectedDevis.budget],
                    ['Délai', selectedDevis.deadline],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                      <dt className="text-gray-400 font-semibold">{k}</dt>
                      <dd className="font-bold text-gray-800 mt-0.5">{v}</dd>
                    </div>
                  ))}
                </dl>
                {selectedDevis.hasFile && selectedDevis.fileDesc && (
                  <p className="text-xs text-gray-500 mt-3"><strong>Fichiers annoncés :</strong> {selectedDevis.fileDesc}</p>
                )}
              </div>

              {selectedDevis.files && selectedDevis.files.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fichiers joints ({selectedDevis.files.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDevis.files.map((url, i) => (
                      <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600 hover:bg-blue-50">
                        <Paperclip size={14} className="text-gray-400" />
                        {decodeURIComponent(url.split('/').pop() || `Fichier ${i + 1}`)}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="quote-price" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Montant proposé (FCFA)</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input id="quote-price" inputMode="numeric" placeholder="Ex : 185000"
                    value={priceInput} onChange={(e) => setPriceInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:bg-white outline-none" />
                  <button onClick={sendProposal} disabled={saving}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 disabled:opacity-60">
                    <Send size={15} /> {saving ? 'Envoi…' : 'Envoyer la proposition'}
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Passe le devis en « Envoyé au client » et prévient le client par email.</p>
              </div>

            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Statut: <strong>{STATUSES.find(s => s.id === selectedDevis.status)?.label}</strong></span>
              <div className="flex gap-3">
                <button onClick={() => setSelectedDevis(null)} className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
