'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
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

import { quotesService, Quote } from '@/lib/quotes.service'
import { useEffect } from 'react'

const STATUSES = [
  { id: 'all', label: 'Toutes les demandes' },
  { id: 'new', label: 'Nouvelles demandes' },
  { id: 'processing', label: 'En cours de traitement' },
  { id: 'sent', label: 'Devis envoyé' },
  { id: 'accepted', label: 'Accepté' },
  { id: 'rejected', label: 'Refusé' }
]

export default function AdminDevisPage() {
  const [devis, setDevis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedDevis, setSelectedDevis] = useState<any>(null)

  useEffect(() => {
    const fetchDevis = async () => {
      try {
        const data = await quotesService.getAllQuotes()
        setDevis(data)
      } catch (err) {
        console.error('Erreur de chargement des devis', err)
      } finally {
        setLoading(false)
      }
    }
    fetchDevis()
  }, [])

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setDevis(devis.map(d => d.id === id || d._id === id ? { ...d, status: newStatus } : d))
    try {
      await quotesService.updateStatus(id, { status: newStatus })
    } catch (err) {
      console.error('Erreur mise à jour', err)
      // Rollback would happen here in a real prod app
    }
  }

  const filteredDevis = devis.filter(d => {
    const matchStatus = filter === 'all' || d.status === filter
    const title = d.title || ''
    const id = d.id || d._id || ''
    const clientName = d.client?.name || d.user?.firstName || 'Client Inconnu'
    
    const matchSearch = search === '' || 
      id.toLowerCase().includes(search.toLowerCase()) ||
      clientName.toLowerCase().includes(search.toLowerCase()) ||
      title.toLowerCase().includes(search.toLowerCase())
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
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all"
          />
        </div>
        <div className="relative">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="appearance-none w-full sm:w-64 pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10 outline-none transition-all cursor-pointer"
          >
            {STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

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
                  <tr key={d.id || d._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{d.id || d._id}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {d.createdAt ? new Date(d.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : (d.date ? new Date(d.date).toLocaleDateString() : 'N/A')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{d.client?.name || d.user?.firstName || 'Client Inconnu'}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{d.client?.phone || d.user?.phone || 'Pas de numéro'}</p>
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
                            onChange={(e) => handleStatusChange(d.id || d._id, e.target.value)}
                            className="appearance-none pl-3 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
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
                          onClick={() => setSelectedDevis(d)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="font-display text-xl font-bold text-gray-900">Demande {selectedDevis.id || selectedDevis._id}</h2>
                <p className="text-xs text-gray-500 mt-1">Reçue le {selectedDevis.createdAt ? new Date(selectedDevis.createdAt).toLocaleString('fr-FR') : (selectedDevis.date ? new Date(selectedDevis.date).toLocaleString('fr-FR') : '')}</p>
              </div>
              <button onClick={() => setSelectedDevis(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              
              <div className="bg-gray-50 rounded-xl p-4 flex gap-6 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Client</p>
                  <p className="font-bold text-gray-900">{selectedDevis.client?.name || selectedDevis.user?.firstName || 'Client Inconnu'}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-sm text-gray-600">{selectedDevis.client?.email || selectedDevis.user?.email || 'N/A'}</p>
                  <p className="text-sm text-gray-600">{selectedDevis.client?.phone || selectedDevis.user?.phone || 'N/A'}</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{selectedDevis.title}</h3>
                <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedDevis.description || selectedDevis.details || 'Aucune description'}
                </div>
              </div>

              {selectedDevis.files && selectedDevis.files.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Fichiers joints ({selectedDevis.files.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedDevis.files.map((file: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        <Paperclip size={14} className="text-gray-400" />
                        {file}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-500">Statut: <strong>{STATUSES.find(s => s.id === selectedDevis.status)?.label}</strong></span>
              <div className="flex gap-3">
                <button className="px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors">
                  Fermer
                </button>
                <button className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-primary transition-colors flex items-center gap-2">
                  <Send size={16} /> Envoyer un message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
