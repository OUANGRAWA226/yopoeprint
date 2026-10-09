'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import {
  TrendingUp, ShoppingCart, Users, Package,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  Truck, AlertCircle, Eye, ChevronRight, ShieldCheck,
  Printer, CreditCard, Sparkles, Plus, FileText,
  BarChart3, Layers, CheckCircle2, RotateCcw
} from 'lucide-react'
import type { ApexOptions } from 'apexcharts'

// Import dynamique d'ApexCharts pour éviter les erreurs SSR (window is not defined)
const Chart = dynamic(() => import('react-apexcharts'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-72 flex items-center justify-center bg-gray-50/50 rounded-xl">
      <div className="w-8 h-8 border-3 border-blue-mid/20 border-t-blue-mid rounded-full animate-spin" />
    </div>
  ),
})

// ── Statistiques KPIs Principales ─────────────────────────────
const KPIS = [
  {
    label: 'Chiffre d\'Affaires (Mois)',
    value: '2 847 500',
    unit: 'FCFA',
    delta: '+18.4%',
    up: true,
    icon: TrendingUp,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    iconBg: 'bg-emerald-500 text-white',
    bg: 'bg-gradient-to-br from-white to-emerald-50/30',
    sub: 'vs mois précédent',
  },
  {
    label: 'Commandes Enregistrées',
    value: '143',
    unit: '',
    delta: '+12.1%',
    up: true,
    icon: ShoppingCart,
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    iconBg: 'bg-blue-mid text-white',
    bg: 'bg-gradient-to-br from-white to-blue-50/30',
    sub: 'dont 6 en attente de BAT',
  },
  {
    label: 'Clients Actifs',
    value: '84',
    unit: '',
    delta: '+8.2%',
    up: true,
    icon: Users,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    iconBg: 'bg-purple-600 text-white',
    bg: 'bg-gradient-to-br from-white to-purple-50/30',
    sub: '38 nouveaux ce mois',
  },
  {
    label: 'Taux Validation BAT',
    value: '94.2%',
    unit: '',
    delta: '+3.5%',
    up: true,
    icon: ShieldCheck,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    iconBg: 'bg-amber-500 text-white',
    bg: 'bg-gradient-to-br from-white to-amber-50/30',
    sub: 'délai moyen : 3h20',
  },
]

// ── Pipeline de production Atelier ────────────────────────────
const WORKSHOP_PIPELINE = [
  { label: 'BAT en validation', count: 6, color: 'bg-amber-500', icon: ShieldCheck, pct: 15 },
  { label: 'En cours de tirage', count: 14, color: 'bg-blue-600', icon: Printer, pct: 35 },
  { label: 'Façonnage & Finition', count: 9, color: 'bg-purple-500', icon: Layers, pct: 22 },
  { label: 'Prêtes pour livraison', count: 11, color: 'bg-emerald-500', icon: CheckCircle2, pct: 28 },
]

// ── Flux d'activité récent (FeedTable de Datta Able) ─────────
const ACTIVITY_FEED = [
  {
    id: 1,
    icon: ShieldCheck,
    iconColor: 'bg-emerald-100 text-emerald-700',
    title: 'BAT validé par le client',
    desc: 'Commande YP-2025-001421 (Salimata Kaboré) transmise à l\'imprimerie.',
    time: 'Il y a 12 min',
  },
  {
    id: 2,
    icon: CreditCard,
    iconColor: 'bg-blue-100 text-blue-700',
    title: 'Paiement Orange Money reçu',
    desc: '225 000 FCFA encaissés pour la commande YP-2025-001418.',
    time: 'Il y a 45 min',
  },
  {
    id: 3,
    icon: FileText,
    iconColor: 'bg-purple-100 text-purple-700',
    title: 'Nouvelle demande de devis express',
    desc: 'Brochures 3 volets x 2 000 pour Entreprise BTP.',
    time: 'Il y a 1h 30',
  },
  {
    id: 4,
    icon: Printer,
    iconColor: 'bg-indigo-100 text-indigo-700',
    title: 'Tirage rotatif terminé',
    desc: '1 000 Flyers A5 passés au façonnage & massicot.',
    time: 'Il y a 3h',
  },
]

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:       { label: 'En attente',    cls: 'bg-yellow-100 text-yellow-700' },
  confirmed:     { label: 'Confirmée',     cls: 'bg-blue-100 text-blue-700' },
  bat_pending:   { label: 'BAT à valider', cls: 'bg-amber-100 text-amber-800' },
  in_production: { label: 'En production', cls: 'bg-purple-100 text-purple-700' },
  ready:         { label: 'Prête',         cls: 'bg-emerald-100 text-emerald-700' },
  shipped:       { label: 'Expédiée',      cls: 'bg-indigo-100 text-indigo-700' },
  delivered:     { label: 'Livrée',        cls: 'bg-green-100 text-green-700' },
  cancelled:     { label: 'Annulée',       cls: 'bg-red-100 text-red-600' },
}

const RECENT_ORDERS = [
  { id: 'YP-2025-001421', client: 'Salimata Kaboré',   product: 'Flyer A5 × 1 000',        total: '17 000',  status: 'bat_pending',   date: 'Aujourd\'hui' },
  { id: 'YP-2025-001420', client: 'Oumar Traoré',      product: 'Carte de visite × 500',   total: '12 400',  status: 'in_production',date: 'Aujourd\'hui' },
  { id: 'YP-2025-001419', client: 'Fatimata Diallo',   product: 'Roll-up Pro × 2',         total: '56 000',  status: 'ready',        date: 'Hier' },
  { id: 'YP-2025-001418', client: 'Ibrahim Sawadogo',  product: 'T-shirt Personnalisé × 50',total: '225 000', status: 'shipped',      date: 'Hier' },
  { id: 'YP-2025-001417', client: 'Aminata Zongo',     product: 'Brochure 3 volets × 500', total: '92 500',  status: 'delivered',    date: '10 mars' },
]

export default function AdminDashboard() {
  const [period, setPeriod] = useState<'7j' | '30j' | '90j'>('30j')

  // ── Configuration Graphique 1 : Évolution Ventes (Datta Able DashSales) ─
  const salesChartData = {
    series: [
      {
        name: 'Chiffre d\'Affaires (FCFA)',
        type: 'column',
        data: period === '7j'
          ? [180000, 240000, 310000, 290000, 420000, 350000, 510000]
          : [
              110000, 145000, 180000, 220000, 205000, 290000, 260000, 310000,
              340000, 390000, 420000, 480000
            ],
      },
      {
        name: 'Moyenne mobile',
        type: 'line',
        data: period === '7j'
          ? [200000, 230000, 270000, 280000, 340000, 360000, 410000]
          : [
              120000, 140000, 170000, 200000, 220000, 260000, 280000, 310000,
              330000, 370000, 400000, 450000
            ],
      },
    ],
    options: {
      chart: {
        height: 330,
        toolbar: { show: false },
        fontFamily: 'inherit',
      },
      stroke: {
        width: [0, 3],
        curve: 'smooth' as const,
      },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 6,
        },
      },
      colors: ['#2563eb', '#f97316'],
      fill: {
        opacity: [0.85, 1],
      },
      labels: period === '7j'
        ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
        : ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'],
      grid: {
        borderColor: '#f1f5f9',
        strokeDashArray: 4,
      },
      yaxis: {
        labels: {
          formatter: (val: number) => `${(val / 1000).toFixed(0)}k`,
        },
      },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (y: number) => `${new Intl.NumberFormat('fr-FR').format(y)} FCFA`,
        },
      },
      legend: {
        position: 'top' as const,
        horizontalAlign: 'right' as const,
      },
    } as ApexOptions,
  }

  // ── Configuration Graphique 2 : Donut Modes de Paiement (Datta Able) ────
  const paymentDonutData = {
    series: [54, 28, 12, 6],
    options: {
      chart: {
        height: 290,
        fontFamily: 'inherit',
      },
      labels: ['Orange Money', 'Moov Money', 'Cartes (Visa/Mastercard)', 'Virement bancaire'],
      colors: ['#ea580c', '#0284c7', '#8b5cf6', '#64748b'],
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(0)}%`,
      },
      plotOptions: {
        pie: {
          donut: {
            size: '72%',
            labels: {
              show: true,
              total: {
                show: true,
                label: 'Mobile Money',
                formatter: () => '82%',
                color: '#0f172a',
                fontSize: '18px',
                fontWeight: 700,
              },
            },
          },
        },
      },
      legend: {
        position: 'bottom' as const,
        horizontalAlign: 'center' as const,
      },
    } as ApexOptions,
  }

  return (
    <div className="space-y-6">

      {/* ── En-tête du tableau de bord ─────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-card">
        <div>
          <h1 className="font-display text-2xl font-bold text-blue-deep flex items-center gap-2.5">
            Tableau de Bord Atelier & Ventes
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-pale text-blue-mid font-bold font-sans">
              Live
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Suivi des performances d&apos;impression, des validations BAT et des encaissements en temps réel
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/admin/commandes"
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-deep text-white text-xs font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm"
          >
            <ShieldCheck size={15} /> Gérer les BAT en attente
          </Link>
          <Link
            href="/admin/devis"
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
          >
            <Plus size={15} /> Nouveau Devis
          </Link>
        </div>
      </div>

      {/* ── Cartes KPIs (Inspirées du FlatCard de Datta Able) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon
          return (
            <div
              key={kpi.label}
              className={`${kpi.bg} border border-gray-200/80 rounded-2xl p-5 shadow-card hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-sm ${kpi.iconBg}`}>
                  <Icon size={20} />
                </div>
                <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full border ${kpi.badgeColor}`}>
                  {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                  {kpi.delta}
                </span>
              </div>

              <div className="space-y-0.5">
                <h3 className="font-display text-2xl font-extrabold text-blue-deep tracking-tight">
                  {kpi.value}
                  {kpi.unit && <span className="text-xs font-sans font-semibold text-gray-500 ml-1.5">{kpi.unit}</span>}
                </h3>
                <p className="text-xs font-bold text-gray-600">{kpi.label}</p>
                <p className="text-[11px] text-gray-400">{kpi.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Section Graphiques ApexCharts (Datta Able Sales) ─ */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-5">

        {/* 1. Évolution des Ventes & CA */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="font-bold text-blue-deep text-base flex items-center gap-2">
                <BarChart3 size={18} className="text-blue-mid" />
                Évolution du Chiffre d&apos;Affaires
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Ventes globales et tendance de croissance</p>
            </div>

            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl w-fit">
              {(['7j', '30j', '90j'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    period === p
                      ? 'bg-white text-blue-mid shadow-xs'
                      : 'text-gray-400 hover:text-gray-700'
                  }`}
                >
                  {p === '7j' ? '7 Jours' : p === '30j' ? 'Ce mois' : '3 Mois'}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <Chart
              options={salesChartData.options}
              series={salesChartData.series}
              type="line"
              height={320}
            />
          </div>

          <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span>Objectif mensuel : <strong>3 500 000 FCFA</strong></span>
            <span className="text-emerald-600 font-bold">Progression : 81.3% réalisé</span>
          </div>
        </div>

        {/* 2. Donut Répartition Paiements & Mobile Money */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-blue-deep text-base flex items-center gap-2">
              <CreditCard size={18} className="text-orange-500" />
              Canaux de Paiement
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Part des transactions encaissées</p>
          </div>

          <div className="py-2">
            <Chart
              options={paymentDonutData.options}
              series={paymentDonutData.series}
              type="donut"
              height={290}
            />
          </div>

          <div className="bg-orange-50/70 border border-orange-200/60 rounded-xl p-3 text-xs text-orange-950 flex items-center gap-2.5">
            <span className="text-base">📱</span>
            <p className="leading-tight">
              <strong>82%</strong> des commandes sont réglées via Mobile Money (Orange & Moov Money).
            </p>
          </div>
        </div>

      </div>

      {/* ── Pipeline Atelier + Flux d'activité (Feed) ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-5">

        {/* Pipeline de l'Atelier d'Impression */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-blue-deep text-base flex items-center gap-2">
                <Printer size={18} className="text-purple-600" />
                Flux de Production Atelier
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Commandes actives par poste de travail</p>
            </div>
            <Link
              href="/admin/commandes"
              className="text-xs font-bold text-blue-mid hover:underline flex items-center gap-1"
            >
              Voir commandes <ChevronRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {WORKSHOP_PIPELINE.map((step) => {
              const StepIcon = step.icon
              return (
                <div key={step.label} className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 text-center">
                  <div className={`w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white ${step.color}`}>
                    <StepIcon size={16} />
                  </div>
                  <p className="font-display font-extrabold text-blue-deep text-xl">{step.count}</p>
                  <p className="text-[11px] font-semibold text-gray-500 mt-0.5">{step.label}</p>
                </div>
              )
            })}
          </div>

          {/* Barres proportionnelles */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
              <span>Répartition des charges en atelier</span>
              <span>40 commandes en cours</span>
            </div>
            <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
              {WORKSHOP_PIPELINE.map((step) => (
                <div
                  key={step.label}
                  className={`${step.color} transition-all`}
                  style={{ width: `${step.pct}%` }}
                  title={`${step.label} : ${step.count} cmd`}
                />
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 pt-1">
              <span>BAT (15%)</span>
              <span>Tirage (35%)</span>
              <span>Façonnage (22%)</span>
              <span>Prêtes (28%)</span>
            </div>
          </div>
        </div>

        {/* Flux d'activité en direct (Inspiré du FeedTable de Datta Able) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-card flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-blue-deep text-base flex items-center gap-2">
                <Sparkles size={17} className="text-amber-500" />
                Journal d&apos;Activité
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">Événements en direct sur la plateforme</p>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" title="En direct" />
          </div>

          <div className="space-y-3.5 divide-y divide-gray-50">
            {ACTIVITY_FEED.map((item) => {
              const ItemIcon = item.icon
              return (
                <div key={item.id} className="pt-3 first:pt-0 flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.iconColor}`}>
                    <ItemIcon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-blue-deep truncate">{item.title}</p>
                      <span className="text-[10px] text-gray-400 shrink-0 font-medium">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 mt-4 text-center">
            <Link
              href="/admin/commandes"
              className="text-xs font-bold text-blue-mid hover:underline"
            >
              Consulter l&apos;historique complet →
            </Link>
          </div>
        </div>

      </div>

      {/* ── Dernières Commandes ────────────────────────────── */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-blue-deep text-base">Dernières Commandes</h2>
            <p className="text-xs text-gray-400 mt-0.5">Suivi des dernières opérations passées</p>
          </div>
          <Link
            href="/admin/commandes"
            className="text-xs text-blue-mid font-bold hover:underline flex items-center gap-1"
          >
            Toutes les commandes <ChevronRight size={13} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                {['N° Commande', 'Client', 'Article & Tirage', 'Total', 'Statut', 'Date', 'Action'].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {RECENT_ORDERS.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-blue-mid font-bold whitespace-nowrap">
                    {o.id}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-blue-deep whitespace-nowrap">
                    {o.client}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {o.product}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-blue-deep whitespace-nowrap">
                    {o.total} FCFA
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${STATUS_MAP[o.status]?.cls}`}>
                      {STATUS_MAP[o.status]?.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-400 text-xs whitespace-nowrap">
                    {o.date}
                  </td>
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <Link
                      href="/admin/commandes"
                      className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-blue-mid hover:text-white font-medium transition-all"
                    >
                      <Eye size={12} /> Inspecter
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
