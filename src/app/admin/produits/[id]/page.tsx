'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Save, Calculator, HelpCircle, Eye, AlertCircle, Percent, Plus } from 'lucide-react'

// Mock Data pour le produit (en prod, fetch via ID)
const INITIAL_PRODUCT = {
  id: 'flyers-a5',
  name: 'Flyers A5',
  basePrice: 20,
  rectoversoMarkup: 40, // +40%
  papers: [
    { id: '135g', label: '135g Couché Brillant', priceExtra: 0 },
    { id: '170g', label: '170g Couché Mat', priceExtra: 5 },
    { id: '250g', label: '250g Couché Brillant', priceExtra: 10 },
    { id: '350g', label: '350g Couché Mat (Premium)', priceExtra: 15 },
  ],
  finishes: [
    { id: 'sans', label: 'Sans finition', priceExtra: 0 },
    { id: 'pelliculage-mat', label: 'Pelliculage Mat', priceExtra: 20 },
    { id: 'pelliculage-brillant', label: 'Pelliculage Brillant', priceExtra: 25 },
  ]
}

export default function AdminProductPricingPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState(INITIAL_PRODUCT)
  const [saved, setSaved] = useState(false)

  // ── ÉTATS DU SIMULATEUR ──
  const [simQty, setSimQty] = useState(500)
  const [simPaper, setSimPaper] = useState(product.papers[0].id)
  const [simFinish, setSimFinish] = useState(product.finishes[0].id)
  const [simRV, setSimRV] = useState(false)

  // ── LOGIQUE DU CALCULATEUR (Miroir de useProducts.ts) ──
  const simulatedPrice = useMemo(() => {
    let unit = product.basePrice
    
    // Ajout surcoûts
    const pExtra = product.papers.find(p => p.id === simPaper)?.priceExtra || 0
    const fExtra = product.finishes.find(f => f.id === simFinish)?.priceExtra || 0
    
    unit += pExtra
    unit += fExtra

    // Majoration Recto Verso
    if (simRV) {
      unit *= (1 + (product.rectoversoMarkup / 100))
    }

    // Dégressivité fixe pour l'exemple
    let discount = 0
    if (simQty >= 500) discount = 0.20
    else if (simQty >= 250) discount = 0.10
    else if (simQty >= 100) discount = 0.05

    unit = unit * (1 - discount)
    unit = Math.round(unit)

    return {
      unit,
      total: unit * simQty,
      discountPct: discount * 100,
      pExtra,
      fExtra
    }
  }, [product, simQty, simPaper, simFinish, simRV])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const handlePaperChange = (index: number, val: number) => {
    const newPapers = [...product.papers]
    newPapers[index].priceExtra = val
    setProduct({ ...product, papers: newPapers })
  }

  const handleFinishChange = (index: number, val: number) => {
    const newFin = [...product.finishes]
    newFin[index].priceExtra = val
    setProduct({ ...product, finishes: newFin })
  }

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto pb-24">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin/produits" className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <ArrowLeft size={20} className="text-gray-600" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900 flex items-center gap-2">
              Éditeur de Tarification <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-500">{product.id}</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1">Configurez les règles de prix et surcoûts pour ce produit.</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
        >
          <Save size={16} /> {saved ? 'Enregistré !' : 'Enregistrer les prix'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ── COLONNE GAUCHE (ÉDITEUR) ── */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Base & R/V */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6 flex items-center gap-2">
              Prix de base & Impression
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  Prix de base (Unité)
                  <span title="Prix pour la plus petite quantité, sans option.">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                  </span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={product.basePrice}
                    onChange={(e) => setProduct({...product, basePrice: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">FCFA</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide flex items-center justify-between">
                  Majoration Recto/Verso
                  <span title="Pourcentage ajouté au prix unitaire si impression 2 faces.">
                    <HelpCircle size={14} className="text-gray-400 cursor-help" />
                  </span>
                </label>
                <div className="relative">
                  <input 
                    type="number" 
                    value={product.rectoversoMarkup}
                    onChange={(e) => setProduct({...product, rectoversoMarkup: Number(e.target.value)})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:border-blue-500 outline-none"
                  />
                  <span className="absolute right-4 top-2.5 text-gray-400 font-bold text-sm">%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Surcoûts Papiers */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">Surcoûts par Grammage (Papier)</h2>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800"><Plus size={16}/> Ajouter</button>
            </div>
            
            <div className="space-y-4">
              {product.papers.map((paper, index) => (
                <div key={paper.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{paper.label}</p>
                    <p className="text-xs text-gray-500">ID: {paper.id}</p>
                  </div>
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">+</span>
                    <input 
                      type="number" 
                      value={paper.priceExtra}
                      onChange={(e) => handlePaperChange(index, Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-blue-500 outline-none text-right"
                    />
                  </div>
                  <span className="text-gray-400 font-bold text-sm w-10">FCFA</span>
                </div>
              ))}
            </div>
          </div>

          {/* Surcoûts Finitions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6">
              <h2 className="text-lg font-bold text-gray-900">Surcoûts par Finition</h2>
              <button className="text-blue-600 text-sm font-bold flex items-center gap-1 hover:text-blue-800"><Plus size={16}/> Ajouter</button>
            </div>
            
            <div className="space-y-4">
              {product.finishes.map((finish, index) => (
                <div key={finish.id} className="flex items-center justify-between gap-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">{finish.label}</p>
                  </div>
                  <div className="relative w-32 shrink-0">
                    <span className="absolute left-3 top-2 text-gray-400 font-bold text-sm">+</span>
                    <input 
                      type="number" 
                      value={finish.priceExtra}
                      onChange={(e) => handleFinishChange(index, Number(e.target.value))}
                      className="w-full pl-8 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-blue-500 outline-none text-right"
                    />
                  </div>
                  <span className="text-gray-400 font-bold text-sm w-10">FCFA</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* ── COLONNE DROITE (SIMULATEUR) ── */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900 rounded-2xl shadow-xl sticky top-24 overflow-hidden">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center gap-3">
              <Calculator size={20} className="text-blue-400" />
              <h2 className="font-bold text-white text-lg">Simulateur en direct</h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 space-y-4">
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Quantité de test</label>
                  <select 
                    value={simQty} 
                    onChange={e => setSimQty(Number(e.target.value))}
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    <option value={100}>100 ex.</option>
                    <option value={250}>250 ex.</option>
                    <option value={500}>500 ex.</option>
                    <option value={1000}>1000 ex.</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Papier</label>
                  <select 
                    value={simPaper} 
                    onChange={e => setSimPaper(e.target.value)}
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    {product.papers.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold uppercase mb-1.5 block">Finition</label>
                  <select 
                    value={simFinish} 
                    onChange={e => setSimFinish(e.target.value)}
                    className="w-full bg-slate-900 text-white border border-slate-600 rounded-lg px-3 py-2 text-sm outline-none"
                  >
                    {product.finishes.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                  </select>
                </div>
                <div className="flex items-center gap-3 pt-2">
                  <input type="checkbox" checked={simRV} onChange={e => setSimRV(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-sm text-slate-300">Impression Recto/Verso</span>
                </div>
              </div>

              {/* Résultats */}
              <div className="pt-2">
                <div className="flex justify-between text-sm text-slate-400 mb-2">
                  <span>Prix unitaire brut</span>
                  <span>{product.basePrice + simulatedPrice.pExtra + simulatedPrice.fExtra} F</span>
                </div>
                {simulatedPrice.discountPct > 0 && (
                  <div className="flex justify-between text-sm text-green-400 font-bold mb-2">
                    <span>Remise volume ({simQty} ex.)</span>
                    <span>-{simulatedPrice.discountPct}%</span>
                  </div>
                )}
                
                <div className="border-t border-slate-700 my-4" />
                
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Prix Client TTC</span>
                    <span className="text-sm text-slate-300">Soit {simulatedPrice.unit} F / ex.</span>
                  </div>
                  <span className="font-display font-extrabold text-white text-3xl">
                    {new Intl.NumberFormat('fr-FR').format(simulatedPrice.total)} <span className="text-lg text-slate-500">F</span>
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
