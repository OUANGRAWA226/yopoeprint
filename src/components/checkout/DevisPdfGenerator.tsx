'use client'

import { useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Printer, ShieldCheck, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { CartItem } from '@/context/CartContext'

interface DevisPdfGeneratorProps {
  isOpen: boolean
  onClose: () => void
  items: CartItem[]
  total: number
  clientInfo?: {
    name?: string
    email?: string
    phone?: string
    company?: string
  }
}

function formatPrice(n: number) {
  return new Intl.NumberFormat('fr-FR').format(n)
}

function generateDevisNumber() {
  const now = new Date()
  const yy = now.getFullYear().toString().slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  const dd = String(now.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `DEV-${yy}${mm}${dd}-${rand}`
}

function getValidityDate() {
  const d = new Date()
  d.setDate(d.getDate() + 30)
  return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function getCurrentDate() {
  return new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
}

export function DevisPdfGenerator({ isOpen, onClose, items, total, clientInfo }: DevisPdfGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const devisNumber = generateDevisNumber()
  const tva = Math.round(total * 0.18)
  const totalHT = total - tva

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML
    if (!printContent) return
    const win = window.open('', '_blank', 'width=900,height=700')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8" />
        <title>Devis ${devisNumber} — YopoePrint</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            color: #111;
            background: white;
            font-size: 13px;
            line-height: 1.5;
          }
          @page { size: A4; margin: 0; }
          .devis-wrapper { width: 210mm; min-height: 297mm; padding: 14mm 16mm; margin: 0 auto; background: white; position: relative; }

          /* Header */
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 32px; }
          .logo-block { display: flex; align-items: center; gap: 10px; }
          .logo-emoji { font-size: 36px; }
          .logo-name { font-size: 22px; font-weight: 900; color: #111; letter-spacing: -1px; }
          .logo-tagline { font-size: 10px; color: #6b7280; margin-top: 2px; }
          .header-right { text-align: right; }
          .devis-title { font-size: 28px; font-weight: 900; color: #16a34a; letter-spacing: -1px; }
          .devis-num { font-size: 12px; color: #6b7280; margin-top: 4px; font-family: monospace; }
          .devis-date { font-size: 11px; color: #9ca3af; margin-top: 2px; }

          /* Divider */
          .divider { height: 2px; background: linear-gradient(to right, #16a34a, #22c55e, transparent); margin-bottom: 24px; border-radius: 2px; }

          /* Info cards */
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 32px; }
          .info-card { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; }
          .info-card-title { font-size: 9px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .info-card-name { font-size: 14px; font-weight: 700; color: #111; margin-bottom: 4px; }
          .info-card-line { font-size: 11px; color: #6b7280; display: flex; align-items: center; gap: 5px; margin-top: 2px; }

          /* Table */
          .table-title { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          thead tr { background: #111; color: white; }
          thead th { padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
          thead th:last-child { text-align: right; }
          tbody tr { border-bottom: 1px solid #f3f4f6; }
          tbody tr:nth-child(even) { background: #f9fafb; }
          tbody td { padding: 10px 12px; font-size: 12px; vertical-align: top; }
          tbody td:last-child { text-align: right; font-weight: 700; color: #16a34a; }
          .item-name { font-weight: 700; color: #111; font-size: 13px; }
          .item-detail { font-size: 10px; color: #9ca3af; margin-top: 2px; }

          /* Totals */
          .totals { margin-left: auto; width: 220px; }
          .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 12px; color: #6b7280; }
          .total-row.ht { border-top: 1px solid #e5e7eb; padding-top: 10px; }
          .total-row.grand { background: #111; color: white; padding: 10px 12px; border-radius: 8px; font-size: 14px; font-weight: 900; margin-top: 6px; }

          /* Validity + conditions */
          .validity-box { background: #fefce8; border: 1px solid #fde68a; border-radius: 8px; padding: 12px 16px; margin-top: 32px; margin-bottom: 16px; font-size: 11px; color: #92400e; }
          .validity-box strong { color: #78350f; }
          .conditions { font-size: 10px; color: #9ca3af; line-height: 1.6; margin-bottom: 24px; }

          /* Footer */
          .footer { border-top: 1px solid #e5e7eb; padding-top: 14px; display: flex; justify-content: space-between; align-items: center; }
          .footer-brand { font-size: 12px; font-weight: 700; color: #111; }
          .footer-contacts { font-size: 10px; color: #9ca3af; text-align: right; }
          .footer-legal { font-size: 9px; color: #d1d5db; margin-top: 4px; }

          /* Badge */
          .status-badge { display: inline-block; background: #dcfce7; color: #16a34a; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }

          /* Signature */
          .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 32px; }
          .signature-box { border-top: 1px dashed #d1d5db; padding-top: 10px; font-size: 10px; color: #9ca3af; }
        </style>
      </head>
      <body>
        ${printContent}
      </body>
      </html>
    `)
    win.document.close()
    setTimeout(() => {
      win.print()
      win.close()
    }, 500)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="text-primary" size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Aperçu du Devis</h2>
                <p className="text-xs text-gray-500 font-mono">{devisNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-all shadow-sm"
              >
                <Download size={15} />
                Télécharger PDF
              </button>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-700 transition-all"
              >
                <Printer size={15} />
                Imprimer
              </button>
              <button
                onClick={onClose}
                className="ml-2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable Preview */}
          <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
            {/* A4 Preview */}
            <div className="max-w-[780px] mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
              {/* This is the printable content */}
              <div ref={printRef}>
                <div className="devis-wrapper" style={{ padding: '40px 48px', fontFamily: 'Segoe UI, Arial, sans-serif' }}>

                  {/* ── HEADER ── */}
                  <div className="header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 36 }}>🖨️</span>
                      <div>
                        <div style={{ fontSize: 22, fontWeight: 900, color: '#111', letterSpacing: '-0.5px' }}>YopoePrint</div>
                        <div style={{ fontSize: 10, color: '#6b7280', marginTop: 2 }}>L'Imprimerie en Ligne — Burkina Faso</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 900, color: '#16a34a', letterSpacing: '-1px' }}>DEVIS</div>
                      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, fontFamily: 'monospace' }}>{devisNumber}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>Émis le {getCurrentDate()}</div>
                      <div style={{ display: 'inline-block', background: '#dcfce7', color: '#16a34a', fontSize: 9, fontWeight: 700, padding: '2px 8px', borderRadius: 20, textTransform: 'uppercase', letterSpacing: 1, marginTop: 6 }}>
                        En attente d'approbation
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 2, background: 'linear-gradient(to right, #16a34a, #22c55e, transparent)', marginBottom: 24, borderRadius: 2 }} />

                  {/* ── INFO GRID ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
                    {/* Émetteur */}
                    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>De</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>YopoePrint SARL</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>📍 Ouagadougou, Burkina Faso</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>📞 +226 XX XX XX XX</div>
                      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>✉️ contact@yopoeprint.bf</div>
                    </div>
                    {/* Destinataire */}
                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 16px' }}>
                      <div style={{ fontSize: 9, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>À l'attention de</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#111', marginBottom: 4 }}>
                        {clientInfo?.company || clientInfo?.name || 'Client YopoePrint'}
                      </div>
                      {clientInfo?.name && clientInfo?.company && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>👤 {clientInfo.name}</div>
                      )}
                      {clientInfo?.phone && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>📞 {clientInfo.phone}</div>
                      )}
                      {clientInfo?.email && (
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 3 }}>✉️ {clientInfo.email}</div>
                      )}
                    </div>
                  </div>

                  {/* ── TABLE ── */}
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>
                    Détail des produits
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
                    <thead>
                      <tr style={{ background: '#111', color: 'white' }}>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Produit</th>
                        <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Spécifications</th>
                        <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Qté</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Prix U.</th>
                        <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 1 ? '#f9fafb' : 'white' }}>
                          <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                            <div style={{ fontWeight: 700, color: '#111', fontSize: 13 }}>{item.emoji} {item.productName}</div>
                          </td>
                          <td style={{ padding: '10px 12px', verticalAlign: 'top' }}>
                            <div style={{ fontSize: 10, color: '#6b7280', lineHeight: 1.8 }}>
                              Format : {item.formatLabel}<br />
                              Matière : {item.paperLabel}<br />
                              Impression : {item.rectoverso ? 'Recto/Verso' : 'Recto seul'}<br />
                              {item.finition && item.finition !== 'Sans finition' && `Finition : ${item.finition}`}
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 700, color: '#111' }}>
                            {new Intl.NumberFormat('fr-FR').format(item.quantity)}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontSize: 11, color: '#6b7280' }}>
                            {item.unitPrice > 0 ? `${formatPrice(item.unitPrice)} F` : '—'}
                          </td>
                          <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700, color: '#16a34a', fontSize: 13 }}>
                            {formatPrice(item.price)} FCFA
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* ── TOTALS ── */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <div style={{ width: 240 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#6b7280' }}>
                        <span>Sous-total HT</span>
                        <span>{formatPrice(totalHT)} FCFA</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb', paddingBottom: 10 }}>
                        <span>TVA (18%)</span>
                        <span>{formatPrice(tva)} FCFA</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', background: '#111', color: 'white', padding: '10px 12px', borderRadius: 8, fontSize: 14, fontWeight: 900, marginTop: 8 }}>
                        <span>TOTAL TTC</span>
                        <span>{formatPrice(total)} FCFA</span>
                      </div>
                    </div>
                  </div>

                  {/* ── VALIDITY ── */}
                  <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '12px 16px', marginTop: 32, marginBottom: 16, fontSize: 11, color: '#92400e' }}>
                    ⏳ Ce devis est valable jusqu'au <strong>{getValidityDate()}</strong>. Au-delà de cette date, les tarifs peuvent être révisés.
                  </div>

                  {/* ── CONDITIONS ── */}
                  <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.6, marginBottom: 32 }}>
                    <strong style={{ color: '#6b7280' }}>Conditions de paiement :</strong> 50% à la commande, 50% avant livraison.<br />
                    <strong style={{ color: '#6b7280' }}>Délais de production :</strong> Variables selon le produit (2 à 7 jours ouvrables après validation du BAT).<br />
                    <strong style={{ color: '#6b7280' }}>Livraison :</strong> Offerte à Ouagadougou pour toute commande supérieure à 50 000 FCFA.
                  </div>

                  {/* ── SIGNATURE ── */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 8 }}>
                    <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: 10, fontSize: 10, color: '#9ca3af' }}>
                      <div style={{ fontWeight: 700, color: '#6b7280', marginBottom: 40 }}>Signature du Client</div>
                      <div style={{ fontSize: 9 }}>Lu et approuvé — Bon pour accord</div>
                    </div>
                    <div style={{ borderTop: '1px dashed #d1d5db', paddingTop: 10, fontSize: 10, color: '#9ca3af', textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: '#6b7280', marginBottom: 40 }}>Cachet & Signature YopoePrint</div>
                      <div style={{ fontSize: 9 }}>Direction Commerciale</div>
                    </div>
                  </div>

                  {/* ── FOOTER ── */}
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: 14, marginTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#111' }}>
                      🖨️ YopoePrint — Ouagadougou, Burkina Faso
                    </div>
                    <div style={{ fontSize: 9, color: '#d1d5db', textAlign: 'right' }}>
                      www.yopoeprint.bf · contact@yopoeprint.bf<br />
                      RC/BF/OUA/2024/B/XXXX · NIF : XXXXXXX
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer note */}
          <div className="px-6 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2 shrink-0">
            <ShieldCheck size={15} className="text-amber-600 shrink-0" />
            <p className="text-xs text-amber-700">
              Dans la boîte de dialogue d'impression, sélectionnez <strong>«&nbsp;Enregistrer en PDF&nbsp;»</strong> comme imprimante pour obtenir le fichier PDF.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
