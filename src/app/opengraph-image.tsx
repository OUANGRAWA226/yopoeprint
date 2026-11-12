import { ImageResponse } from 'next/og'

// Image de partage (Facebook, WhatsApp, LinkedIn, X) générée au build : 1200 × 630
export const alt = 'YopoePrint — Imprimerie en ligne au Burkina Faso'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
// Runtime edge : en runtime Node, Next 14 échoue sous Windows à charger la police (« Invalid URL »)
export const runtime = 'edge'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: '#ffffff',
          borderTop: '24px solid #008537',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 44, fontWeight: 800, color: '#0f172a' }}>
          Yopoe<span style={{ color: '#008537' }}>Print</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 72, fontWeight: 800, color: '#0f172a', lineHeight: 1.1 }}>
            L’imprimerie en ligne du Burkina Faso
          </div>
          <div style={{ marginTop: 28, fontSize: 34, color: '#475569' }}>
            Flyers, cartes de visite, affiches, roll-up — livrés partout
          </div>
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#008537', fontWeight: 700 }}>
          Paiement Orange Money · Moov Money · Carte
        </div>
      </div>
    ),
    size,
  )
}
