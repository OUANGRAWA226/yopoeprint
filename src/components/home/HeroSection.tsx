'use client'

import Link from 'next/link'
import { ArrowRight, Play, Sparkles, Shield, Compass, Layers } from 'lucide-react'

const SHOWCASE_PRODUCTS = [
 {
 emoji: '🪪',
 title: 'Cartes de visite',
 badge: 'Finition Premium',
 desc: 'Vernis sélectif 3D, Soft touch',
 gradient: 'from-[#FDF6E3] to-[#F0E0A0]',
 textColor: 'text-amber-950',
 badgeBg: 'bg-amber-100/80 text-amber-800',
 delay: '0.1s'
 },
 {
 emoji: '📄',
 title: 'Flyers & Affiches',
 badge: 'Impression HD',
 desc: 'Papier couché mat 135g à 250g',
 gradient: 'bg-secondary to-[#C5D4F0]',
 textColor: 'text-foreground',
 badgeBg: 'bg-blue-100/80 text-blue-800',
 delay: '0.2s'
 },
 {
 emoji: '👕',
 title: 'Textile personnalisé',
 badge: 'Coton Bio',
 desc: 'Sérigraphie & Impression DTG',
 gradient: 'from-[#E8F5ED] to-[#90C8A0]',
 textColor: 'text-emerald-950',
 badgeBg: 'bg-emerald-100/80 text-emerald-800',
 delay: '0.3s'
 },
 {
 emoji: '🎁',
 title: 'Goodies & Objets',
 badge: 'Express 48h',
 desc: 'Stylos, Gourdes, Tote Bags',
 gradient: 'from-[#FCE8E6] to-[#F0B4AC]',
 textColor: 'text-rose-950',
 badgeBg: 'bg-rose-100/80 text-rose-800',
 delay: '0.4s'
 }
]

const STATS = [
 { value: '5 000+', label: 'Commandes livrées' },
 { value: '200+', label: 'Produits disponibles' },
 { value: '98%', label: 'Clients satisfaits' },
]

export function HeroSection() {
 return (
 <section className="relative bg-secondary 
 min-h-[620px] flex items-center overflow-hidden py-12">

 {/* Background pattern */}
 <div className="absolute inset-0 opacity-[0.02]"
 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}
 />

 {/* Geometric elements */}
 <div className="absolute -left-32 -bottom-32 w-[600px] h-[600px] border-[80px]
 border-primary/5 rounded-full pointer-events-none" />
 <div className="absolute right-0 top-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

 <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 lg:gap-16
 items-center relative z-10 w-full">

 {/* Text Area */}
 <div className="animate-fade-up">
 <div className="inline-flex items-center gap-2 bg-primary/15 border border-primary/30
 text-primary text-[11px] font-bold px-3.5 py-1.5 rounded-full
 mb-6 uppercase tracking-widest">
 <Sparkles size={12} className="text-primary" />
 ★ N°1 de l&apos;imprimerie en ligne au Burkina Faso
 </div>

 <h1 className="font-display text-4xl lg:text-5xl xl:text-6xl font-extrabold
 text-white leading-[1.1] tracking-tight mb-6">
 Vos impressions<br />
 professionnelles<br />
 en <em className="not-italic text-primary">un clic</em>.
 </h1>

 <p className="text-white/80 text-base lg:text-lg leading-relaxed mb-8 max-w-lg">
 Configurez vos formats, papiers et finitions en temps réel. Commandez en ligne avec 
 <strong> Orange Money & Moov Money</strong> et recevez vos impressions chez vous en 24h-48h.
 </p>

 <div className="flex flex-wrap gap-4 items-center">
 <Link href="/catalogue" className="btn-primary text-base px-8 py-4 shadow-[0_4px_20px_rgba(201,168,76,0.3)]">
 Découvrir le catalogue
 <ArrowRight size={18} />
 </Link>
 <Link href="/revendeurs" className="btn-secondary flex items-center gap-2 border border-white/25 text-white hover:bg-white/10 px-6 py-4 rounded-xl font-semibold transition-all">
 Espace Revendeurs B2B
 </Link>
 </div>

 {/* Stats Bar */}
 <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
 {STATS.map(({ value, label }) => (
 <div key={label}>
 <strong className="block font-display text-3xl text-primary font-bold mb-0.5">
 {value}
 </strong>
 <span className="text-[11px] text-white/60 tracking-wider uppercase font-semibold">{label}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Dynamic Showcase Grid (Maquettes interactives) */}
 <div className="grid grid-cols-2 gap-4 lg:gap-5 animate-fade-up">
 {SHOWCASE_PRODUCTS.map((prod, i) => (
 <div
 key={i}
 className={`relative ${prod.gradient} p-5 lg:p-6
 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.04)]
 hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]
 transition-all duration-500 group overflow-hidden cursor-pointer
 border border-white/20 hover:-translate-y-1.5`}
 style={{ animationDelay: prod.delay }}
 >
 {/* Decorative circle glow */}
 <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-white/30 rounded-full
 blur-lg group-hover:scale-150 transition-all duration-500" />

 {/* Badges */}
 <div className="flex justify-between items-start mb-4">
 <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${prod.badgeBg} uppercase tracking-wider`}>
 {prod.badge}
 </span>
 <span className="text-3xl group-hover:scale-125 group-hover:rotate-12 transition-transform duration-500">
 {prod.emoji}
 </span>
 </div>

 {/* Title & Desc */}
 <div className="relative z-10 mt-6">
 <h3 className={`font-display text-lg lg:text-xl font-black ${prod.textColor} mb-1`}>
 {prod.title}
 </h3>
 <p className={`text-xs ${prod.textColor} opacity-60 leading-relaxed font-medium`}>
 {prod.desc}
 </p>
 </div>

 {/* Decorative visual guidelines (mocking a print grid) */}
 <div className="absolute inset-2 border border-black/[0.03] rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
 <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-black/20" />
 <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-black/20" />
 <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-black/20" />
 <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-black/20" />
 </div>
 </div>
 ))}
 </div>

 </div>
 </section>
 )
}
