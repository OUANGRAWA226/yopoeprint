'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle2,
  Truck, AlertCircle, Eye, ChevronRight, ShieldCheck,
  Printer, CreditCard, Sparkles, Plus, FileText,
  BarChart3, Layers, RotateCcw, X, Download, Check,
  ExternalLink, Filter, HelpCircle, ArrowRight
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

// Import dynamique d'ApexCharts pour éviter les erreurs SSR (window is not defined)
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 flex flex-col items-center justify-center bg-slate-50/60 rounded-2xl border border-slate-100">
      <div className="w-9 h-9 border-3 border-blue-mid/20 border-t-blue-mid rounded-full animate-spin mb-3" />
      <span className="text-xs font-semibold text-slate-400">Chargement des indicateurs...</span>
    </div>
  ),
})

// ── Statistiques KPIs Principales ─────────────────────────────
const KPIS = [
  {
    id: 'ca',
    label: "Chiffre d'Affaires",
    value: '2 847 500',
    unit: 'FCFA',
    delta: '+18.4%',
    up: true,
    sub: 'vs 2 405 000 FCFA le mois dernier',
    icon: TrendingUp,
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
    iconColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50',
    accentBorder: 'hover:border-emerald-300',
    progress: 81,
    target: 'Obj. 3.5M FCFA',
  },
  {
    id: 'orders',
    label: 'Commandes ce mois',
    value: '143',
    unit: 'cmd',
    delta: '+12.1%',
    up: true,
    sub: 'dont 6 BAT en attente d’accord',
    icon: ShoppingCart,
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200/70',
    iconColor: 'bg-blue-mid/10 text-blue-mid border-blue-200/50',
    accentBorder: 'hover:border-blue-300',
    progress: 72,
    target: 'Obj. 200 cmd',
  },
  {
    id: 'clients',
    label: 'Clients Actifs',
    value: '84',
    unit: 'comptes',
    delta: '+8.2%',
    up: true,
    sub: '38 nouveaux clients ce mois',
    icon: Users,
    badgeCls: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
    iconColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50',
    accentBorder: 'hover:border-indigo-300',
    progress: 84,
    target: 'Rétention 89%',
  },
  {
    id: 'bat',
    label: 'Taux Validation BAT',
    value: '94.2%',
    unit: '',
    delta: '+3.5%',
    up: true,
    sub: 'Délai moyen d’approbation : 3h20',
    icon: ShieldCheck,
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200/70',
    iconColor: 'bg-amber-500/10 text-amber-600 border-amber-200/50',
    accentBorder: 'hover:border-amber-300',
    progress: 94,
    target: 'Objectif > 90%',
  },
]

// ── Pipeline de production Atelier ────────────────────────────
const WORKSHOP_PIPELINE = [
  { id: 'bat_pending', step: 1, label: 'BAT à valider', count: 6, color: 'text-amber-600 bg-amber-50 border-amber-200', barColor: 'bg-amber-500', icon: ShieldCheck, desc: 'En attente accord client' },
  { id: 'in_production', step: 2, label: 'Tirage rotatif', count: 14, color: 'text-blue-600 bg-blue-50 border-blue-200', barColor: 'bg-blue-600', icon: Printer, desc: 'Presses numériques & offset' },
  { id: 'finishing', step: 3, label: 'Façonnage & Finition', count: 9, color: 'text-purple-600 bg-purple-50 border-purple-200', barColor: 'bg-purple-600', icon: Layers, desc: 'Massicot, pliage & pelliculage' },
  { id: 'ready', step: 4, label: 'Prêtes à livrer', count: 11, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', barColor: 'bg-emerald-600', icon: CheckCircle2, desc: 'Contrôle qualité terminé' },
]

// ── Flux d'activité récent ────────────────────────────────────
const ACTIVITY_FEED = [
  {
    id: 1,
    tag: 'BAT',
    tagColor: 'bg-emerald-100 text-emerald-800',
    title: 'BAT approuvé sans réserve',
    desc: 'Commande #YP-2025-001421 (Salimata Kaboré) transmise en file de tirage.',
    time: 'Il y a 12 min',
    actor: 'Salimata K.',
  },
  {
    id: 2,
    tag: 'PAIEMENT',
    tagColor: 'bg-orange-100 text-orange-800',
    title: 'Paiement Orange Money validé',
    desc: '225 000 FCFA reçus automatiquement pour la commande #YP-2025-001418.',
    time: 'Il y a 45 min',
    actor: 'Système',
  },
  {
    id: 3,
    tag: 'DEVIS',
    tagColor: 'bg-purple-100 text-purple-800',
    title: 'Demande de devis express reçue',
    desc: '2 000 Dépliants 3 volets avec vernis sélectif pour Entreprise BTP.',
    time: 'Il y a 1h 30',
    actor: 'Portail Client',
  },
  {
    id: 4,
    tag: 'ATELIER',
    tagColor: 'bg-blue-100 text-blue-800',
    title: 'Tirage 1 000 Flyers achevé',
    desc: 'Passage sur presse offset terminé. En cours de séchage et massicot.',
    time: 'Il y a 3h',
    actor: 'Poste #2 Offset',
  },
]

// ── Données des canaux de paiement ─────────────────────────────
const PAYMENT_BREAKDOWN = [
  { name: 'Orange Money', share: 54, amount: '1 537 650 FCFA', color: '#ea580c' },
  { name: 'Moov Money', share: 28, amount: '797 300 FCFA', color: '#0284c7' },
  { name: 'Cartes (Visa / Mastercard)', share: 12, amount: '341 700 FCFA', color: '#8b5cf6' },
  { name: 'Virement bancaire B2B', share: 6, amount: '170 850 FCFA', color: '#64748b' },
]

// ── Statuts de commande standardisés ──────────────────────────
const STATUS_MAP: Record<string, { label: string; cls: string; dot: string }> = {
  bat_pending:   { label: 'BAT à valider', cls: 'bg-amber-50 text-amber-800 border-amber-200/80', dot: 'bg-amber-500' },
  in_production: { label: 'En production', cls: 'bg-blue-50 text-blue-700 border-blue-200/80', dot: 'bg-blue-600' },
  ready:         { label: 'Prête',         cls: 'bg-emerald-50 text-emerald-700 border-emerald-200/80', dot: 'bg-emerald-500' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-50 text-indigo-700 border-indigo-200/80', dot: 'bg-indigo-600' },
  delivered:     { label: 'Livrée',        cls: 'bg-slate-100 text-slate-700 border-slate-200/80', dot: 'bg-slate-500' },
}

interface OrderItem {
  id: string
  client: string
  city: string
  initials: string
  product: string
  quantity: string
  total: string
  status: string
  date: string
  batDetails?: {
    previewUrl: string
    resolution: string
    format: string
    colorProfile: string
    version: number
  }
}

const ORDERS_DATA: OrderItem[] = [
  {
    id: 'YP-2025-001421',
    client: 'Salimata Kaboré',
    city: 'Ouagadougou',
    initials: 'SK',
    product: 'Flyers A5 Événementiel',
    quantity: '1 000 ex.',
    total: '17 000',
    status: 'bat_pending',
    date: 'Aujourd\'hui 10:45',
    batDetails: {
      previewUrl: 'https://images.unsplash.com/photo-1572945753563-80495678363d?auto=format&fit=crop&w=800&q=80',
      resolution: '300 DPI (CMJN)',
      format: '148 × 210 mm (+2mm fond perdu)',
      colorProfile: 'FOGRA39',
      version: 1,
    },
  },
  {
    id: 'YP-2025-001420',
    client: 'Oumar Traoré',
    city: 'Bobo-Dioulasso',
    initials: 'OT',
    product: 'Cartes de Visite Soft Touch',
    quantity: '500 ex.',
    total: '12 400',
    status: 'in_production',
    date: 'Aujourd\'hui 09:15',
    batDetails: {
      previewUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      resolution: '300 DPI (CMJN)',
      format: '85 × 55 mm',
      colorProfile: 'FOGRA39',
      version: 2,
    },
  },
  {
    id: 'YP-2025-001419',
    client: 'Fatimata Diallo',
    city: 'Koudougou',
    initials: 'FD',
    product: 'Roll-up Pro 85x200cm',
    quantity: '2 ex.',
    total: '56 000',
    status: 'ready',
    date: 'Hier 16:30',
  },
  {
    id: 'YP-2025-001418',
    client: 'Ibrahim Sawadogo',
    city: 'Ouagadougou',
    initials: 'IS',
    product: 'T-shirts Sérigraphiés 190g',
    quantity: '50 ex.',
    total: '225 000',
    status: 'shipped',
    date: 'Hier 11:20',
  },
  {
    id: 'YP-2025-001417',
    client: 'Aminata Zongo',
    city: 'Ouagadougou',
    initials: 'AZ',
    product: 'Brochures Piquées 16p',
    quantity: '500 ex.',
    total: '92 500',
    status: 'delivered',
    date: '10 mars',
  },
]

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'7j' | '30j' | '90j'>('30j')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOrderForBAT, setSelectedOrderForBAT] = useState<OrderItem | null>(null)
  const [batValidating, setBatValidating] = useState<boolean>(false)

  // Filtrage dynamique des commandes récentes
  const filteredOrders = ORDERS_DATA.filter(o => {
    if (statusFilter === 'all') return true
    if (statusFilter === 'bat_pending') return o.status === 'bat_pending'
    if (statusFilter === 'in_production') return o.status === 'in_production'
    if (statusFilter === 'ready') return o.status === 'ready' || o.status === 'shipped'
    return true
  })

  // ── Configuration Graphique 1 : ApexCharts Spline & Area ────
  const salesChartData = {
    series: [
      {
        name: "Chiffre d'Affaires (FCFA)",
        type: 'area',
        data: period === '7j'
          ? [180000, 240000, 310000, 290000, 420000, 350000, 510000]
          : period === '30j'
          ? [
              110000, 145000, 180000, 220000, 205000, 290000, 260000, 310000,
              340000, 390000, 420000, 480000
            ]
          : [850000, 1250000, 1950000, 2400000, 2847500],
      },
      {
        name: 'Tendance Prévue (FCFA)',
        type: 'line',
        data: period === '7j'
          ? [170000, 220000, 280000, 310000, 390000, 380000, 490000]
          : period === '30j'
          ? [
              120000, 140000, 170000, 200000, 220000, 260000, 280000, 310000,
              330000, 370000, 400000, 450000
            ]
          : [900000, 1300000, 1850000, 2300000, 2750000],
      },
    ],
    options: {
      chart: {
        height: 330,
        type: 'line',
        toolbar: { show: false },
        fontFamily: 'inherit',
        animations: {
          enabled: true,
          speed: 450,
        },
      },
      stroke: {
        width: [2.5, 2],
        curve: 'smooth' as const,
        dashArray: [0, 4],
      },
      colors: ['#0E2347', '#C9A84C'],
      fill: {
        type: ['gradient', 'solid'],
        gradient: {
          shade: 'light',
          type: 'vertical',
          shadeIntensity: 0.4,
          gradientToColors: ['#2A5298'],
          inverseColors: false,
          opacityFrom: 0.35,
          opacityTo: 0.02,
          stops: [0, 100],
        },
      },
      labels: period === '7j'
        ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        : period === '30j'
        ? ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
        : ['T1 2025', 'T2 2025', 'T3 2025', 'T4 2025', 'T1 2026'],
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 3,
        padding: { top: 0, right: 10, bottom: 0, left: 10 },
      },
      xaxis: {
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: {
          style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
        },
      },
      yaxis: {
        labels: {
          style: { colors: '#64748b', fontSize: '11px', fontWeight: 500 },
          formatter: (val: number) => `${(val / 1000).toFixed(0)}k`,
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        theme: 'light',
        style: { fontSize: '12px' },
        y: {
          formatter: (y: number) => `${new Intl.NumberFormat('fr-FR').format(y)} FCFA`,
        },
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const,
        fontSize: '12px',
        fontWeight: 600,
        labels: { colors: '#475569' },
        itemMargin: { horizontal: 10, vertical: 0 },
      },
    } as ApexOptions,
  }

  // ── Configuration Graphique 2 : ApexCharts Donut Canaux ────
  const paymentDonutData = {
    series: [54, 28, 12, 6],
    options: {
      chart: {
        height: 250,
        type: 'donut',
        fontFamily: 'inherit',
      },
      labels: ['Orange Money', 'Moov Money', 'Cartes Bancaires', 'Virement B2B'],
      colors: ['#ea580c', '#0284c7', '#8b5cf6', '#64748b'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
        style: { fontSize: '11px', fontWeight: 700 },
        dropShadow: { enabled: false },
      },
      plotOptions: {
        pie: {
          donut: {
            size: '74%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Mobile Money',
                formatter: () => '82%',
                color: '#0E2347',
                fontSize: '20px',
                fontWeight: 800,
              },
            },
          },
        },
      },
      stroke: { width: 2, colors: ['#ffffff'] },
      legend: { show: false },
      tooltip: {
        y: {
          formatter: (val: number) => `${val}% des règlements`,
        },
      },
    } as ApexOptions,
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* ── 1. Top Bar Executive & Indicateurs Opérationnels ───────────────── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-pale/40 to-transparent pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-blue-deep tracking-tight">
              Tableau de Bord Atelier & Ventes
            </h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Atelier Opérationnel
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Supervision de la chaîne graphique, validation en temps réel des Bons à Tirer (BAT) et encaissements multi-opérateurs.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap relative z-10">
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-deep text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-blue-mid transition-all duration-150 active:scale-[0.98] shadow-sm hover:shadow"
          >
            <ShieldCheck size={16} className="text-gold" />
            Vérifier les BAT ({WORKSHOP_PIPELINE[0].count})
          </Link>

          <Link
            href="/admin/devis"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 active:scale-[0.98]"
          >
            <Plus size={16} className="text-slate-500" />
            Nouveau Devis
          </Link>
        </div>
      </div>

      {/* ── 2. Cartes KPIs Haute Précision (Pattern FlatCard Élevé) ──────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.id}
              className={`bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group ${kpi.accentBorder}`}
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${kpi.iconColor}`}>
                    <Icon size={20} />
                  </div>
                  <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${kpi.badgeCls}`}>
                    {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {kpi.delta}
                  </span>
                </div>

                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {kpi.label}
                </p>

                <div className="flex items-baseline gap-1.5">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-blue-deep tracking-tight tabular-nums">
                    {kpi.value}
                  </h3>
                  {kpi.unit && (
                    <span className="text-xs font-semibold text-slate-400">
                      {kpi.unit}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-400 mb-1.5">
                  <span>{kpi.sub}</span>
                  <span className="font-semibold text-slate-600">{kpi.progress}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-deep rounded-full group-hover:bg-gold transition-colors duration-300"
                    style={{ width: `${kpi.progress}%` }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── 3. Section Graphiques & Répartition (ApexCharts Dual Grid) ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_390px] gap-5">

        {/* 3.1 Courbe Évolution du Chiffre d'Affaires */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-deep/5 text-blue-deep flex items-center justify-center">
                  <BarChart3 size={18} />
                </div>
                <h2 className="font-bold text-blue-deep text-base sm:text-lg">
                  Trajectoire du Chiffre d&apos;Affaires
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-10">
                Comparatif des recettes effectives et de la tendance de projection
              </p>
            </div>

            {/* Segmented Control iOS / Linear Style */}
            <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 w-fit self-start sm:self-auto">
              {(['7j', '30j', '90j'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                    period === p
                      ? 'bg-white text-blue-deep shadow-xs font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {p === '7j' ? '7 Jours' : p === '30j' ? '30 Jours' : '3 Mois'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full -ml-2">
            <Chart
              options={salesChartData.options}
              series={salesChartData.series}
              type="area"
              height={320}
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-4 text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-deep" />
                Ventes Encaissées
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-gold" />
                Projection Récurrente
              </span>
            </div>
            <div className="text-slate-600 font-medium">
              Objectif mensuel : <strong className="text-blue-deep font-bold">3 500 000 FCFA</strong> (81.3% atteint)
            </div>
          </div>
        </div>

        {/* 3.2 Donut Canaux d'Encaissement & Détail Mobile Money */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center">
                  <CreditCard size={18} />
                </div>
                <h2 className="font-bold text-blue-deep text-base sm:text-lg">
                  Canaux de Paiement
                </h2>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200/60">
                82% Mobile
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-10">
              Répartition par passerelle transactionnelle
            </p>
          </div>

          <div className="my-2">
            <Chart
              options={paymentDonutData.options}
              series={paymentDonutData.series}
              type="donut"
              height={230}
            />
          </div>

          {/* Liste détaillée avec volumes en FCFA */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {PAYMENT_BREAKDOWN.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs py-1 hover:bg-slate-50/80 px-2 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-deep tabular-nums">{item.amount}</span>
                  <span className="text-[11px] text-slate-400 ml-1.5">({item.share}%)</span>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

      {/* ── 4. Pipeline de Production Atelier & Timeline d'Activité ──────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">

        {/* 4.1 Stepper Atelier Connecté */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 flex items-center justify-center">
                    <Printer size={18} />
                  </div>
                  <h2 className="font-bold text-blue-deep text-base sm:text-lg">
                    Pipeline d&apos;Impression Atelier
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-1 ml-10">
                  Flux continu des commandes actives par poste de transformation
                </p>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                40 travaux en cours
              </span>
            </div>

            {/* Stepper Grid avec liaison visuelle */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4">
              {WORKSHOP_PIPELINE.map((p, idx) => {
                const StepIcon = p.icon
                return (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-blue-mid/40 hover:shadow-xs transition-all relative group"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${p.color}`}>
                        <StepIcon size={16} />
                      </div>
                      <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-blue-mid">
                        0{p.step}
                      </span>
                    </div>

                    <p className="text-2xl font-extrabold text-blue-deep tabular-nums">
                      {p.count}
                    </p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">{p.label}</p>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{p.desc}</p>

                    <div className="w-full h-1 bg-slate-200 rounded-full mt-3 overflow-hidden">
                      <div className={`h-full ${p.barColor}`} style={{ width: `${(p.count / 40) * 100}%` }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="bg-blue-pale/50 border border-blue-200/60 rounded-xl p-3.5 flex items-center justify-between text-xs text-blue-deep mt-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-mid animate-ping" />
              <span>Charge totale de l&apos;atelier estimée à <strong>68% de la capacité nominale</strong>.</span>
            </div>
            <Link
              href="/admin/commandes"
              className="text-xs font-bold text-blue-mid hover:text-blue-deep inline-flex items-center gap-1 group"
            >
              Détails atelier <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* 4.2 Journal d'Activité en Direct (Feed Timeline) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Sparkles size={18} />
                </div>
                <h2 className="font-bold text-blue-deep text-base sm:text-lg">
                  Flux Événements Direct
                </h2>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="Écoute active" />
            </div>

            {/* Timeline verticale continue */}
            <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
              {ACTIVITY_FEED.map((item) => (
                <div key={item.id} className="relative group">
                  <span className="absolute -left-6 top-1.5 w-4 h-4 rounded-full border-2 border-white bg-slate-300 group-hover:bg-blue-mid transition-colors shadow-2xs" />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-md ${item.tagColor}`}>
                        {item.tag}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-blue-deep group-hover:text-blue-light transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <Link
              href="/admin/commandes"
              className="text-xs font-bold text-blue-mid hover:text-blue-deep inline-flex items-center gap-1 group"
            >
              Historique complet des journaux <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

      </div>

      {/* ── 5. Tableau des Commandes Récentes avec Filtres & Inspection BAT ── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        
        {/* Header du tableau avec Onglets de Filtrage */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-bold text-blue-deep text-lg">
              Dernières Commandes & Statuts BAT
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Consultez et validez rapidement les épreuves d&apos;impression avant mise sur machine
            </p>
          </div>

          {/* Onglets de filtrage */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/50 overflow-x-auto">
            {[
              { id: 'all', label: `Toutes (${ORDERS_DATA.length})` },
              { id: 'bat_pending', label: 'BAT à valider (1)' },
              { id: 'in_production', label: 'En atelier (1)' },
              { id: 'ready', label: 'Prêtes / Livrées (3)' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
                  statusFilter === tab.id
                    ? 'bg-white text-blue-deep shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table responsive */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">N° Commande</th>
                <th className="px-5 py-3.5">Client & Localité</th>
                <th className="px-5 py-3.5">Produit & Tirage</th>
                <th className="px-5 py-3.5">Montant TTC</th>
                <th className="px-5 py-3.5">Statut de Traitement</th>
                <th className="px-5 py-3.5">Date & Heure</th>
                <th className="px-5 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map((o) => {
                const statusMeta = STATUS_MAP[o.status] || { label: o.status, cls: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' }
                return (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-blue-mid whitespace-nowrap">
                      {o.id}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-deep/10 text-blue-deep font-bold text-xs flex items-center justify-center shrink-0">
                          {o.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs sm:text-sm">{o.client}</p>
                          <p className="text-[11px] text-slate-400">{o.city}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <p className="font-medium text-slate-800 text-xs sm:text-sm">{o.product}</p>
                      <p className="text-[11px] text-slate-400 font-mono">{o.quantity}</p>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap font-bold text-blue-deep tabular-nums">
                      {o.total} FCFA
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusMeta.cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </span>
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-400">
                      {o.date}
                    </td>

                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedOrderForBAT(o)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-[0.98] ${
                          o.status === 'bat_pending'
                            ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-blue-mid hover:text-white text-slate-700'
                        }`}
                      >
                        <Eye size={13} />
                        {o.status === 'bat_pending' ? 'Inspecter BAT' : 'Aperçu'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50/40 flex items-center justify-between text-xs text-slate-500">
          <span>Affichage de <strong>{filteredOrders.length}</strong> sur <strong>{ORDERS_DATA.length}</strong> commandes récentes</span>
          <Link href="/admin/commandes" className="font-bold text-blue-mid hover:underline">
            Accéder à l&apos;intégralité des commandes →
          </Link>
        </div>
      </div>

      {/* ── 6. Modal Drawer d'Inspection BAT Rapide (Intéractif) ────────────── */}
      {selectedOrderForBAT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 bg-blue-deep text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gold/20 text-gold flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-base">
                    Inspection Épreuve Numérique (BAT)
                  </h3>
                  <p className="text-xs text-slate-300 font-mono">
                    Commande #{selectedOrderForBAT.id} · {selectedOrderForBAT.client}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrderForBAT(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-5">
              
              {/* Image Preview / Fichier BAT */}
              {selectedOrderForBAT.batDetails?.previewUrl ? (
                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 relative group aspect-video flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={selectedOrderForBAT.batDetails?.previewUrl}
                    alt="BAT Épreuve"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <a
                      href={selectedOrderForBAT.batDetails?.previewUrl || '#'}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-bold inline-flex items-center gap-1 shadow-md hover:bg-slate-100"
                    >
                      <ExternalLink size={13} /> Ouvrir en haute définition
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <FileText size={32} className="mx-auto text-slate-400 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">Aucun fichier BAT attaché pour cette commande</p>
                  <p className="text-xs text-slate-400 mt-1">Le document a déjà été transféré sur les presses d&apos;impression.</p>
                </div>
              )}

              {/* Fiche technique de contrôle pré-presse */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Format</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedOrderForBAT.batDetails?.format || 'Standard'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Résolution</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedOrderForBAT.batDetails?.resolution || '300 DPI CMJN'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Profil Couleur</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    {selectedOrderForBAT.batDetails?.colorProfile || 'FOGRA39'}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Version BAT</span>
                  <p className="text-xs font-semibold text-slate-800 mt-0.5">
                    v{selectedOrderForBAT.batDetails?.version || 1}
                  </p>
                </div>
              </div>

              {/* Informations Commande */}
              <div className="flex items-center justify-between text-xs p-3.5 bg-blue-pale/40 border border-blue-200/60 rounded-xl">
                <div>
                  <span className="text-slate-500">Produit commandé :</span>{' '}
                  <strong className="text-blue-deep">{selectedOrderForBAT.product}</strong> ({selectedOrderForBAT.quantity})
                </div>
                <div className="font-bold text-blue-deep tabular-nums">
                  Total : {selectedOrderForBAT.total} FCFA
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={() => setSelectedOrderForBAT(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                Fermer
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setBatValidating(true)
                    setTimeout(() => {
                      setBatValidating(false)
                      setSelectedOrderForBAT(null)
                    }, 800)
                  }}
                  disabled={batValidating}
                  className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Check size={15} />
                  {batValidating ? 'Validation en cours...' : 'Valider & Lancer en Impression'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
