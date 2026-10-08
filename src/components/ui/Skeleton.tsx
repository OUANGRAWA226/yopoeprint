'use client'

// ── Bloc basique ────────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={['animate-pulse rounded-md bg-gray-200', className].filter(Boolean).join(' ')}
    />
  )
}

// ── Carte statistique (KPI) ─────────────────────────────────────────────────
export function SkeletonKpiCard() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <Skeleton className="w-16 h-5 rounded-full" />
      </div>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-40" />
    </div>
  )
}

// ── Ligne de tableau ─────────────────────────────────────────────────────────
export function SkeletonTableRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-b border-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <Skeleton className={`h-4 ${i === 0 ? 'w-32' : i === cols - 1 ? 'w-16 ml-auto' : 'w-24'}`} />
          {i === 0 && <Skeleton className="h-3 w-20 mt-1.5" />}
        </td>
      ))}
    </tr>
  )
}

// ── Tableau complet ──────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-100">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-6 py-3">
                <Skeleton className="h-3 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <SkeletonTableRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Carte Produit ─────────────────────────────────────────────────────────────
export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <Skeleton className="w-full aspect-square" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-20 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Grille de cartes produits ─────────────────────────────────────────────────
export function SkeletonProductGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonProductCard key={i} />
      ))}
    </div>
  )
}

// ── Section Dashboard (titre + grille KPI) ───────────────────────────────────
export function SkeletonDashboard({ kpis = 3 }: { kpis?: number }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      {/* KPI Cards */}
      <div className={`grid grid-cols-1 md:grid-cols-${kpis} gap-6`}>
        {Array.from({ length: kpis }).map((_, i) => (
          <SkeletonKpiCard key={i} />
        ))}
      </div>
      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Skeleton className="h-6 w-40 mb-4" />
          <SkeletonTable rows={4} cols={4} />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Profile / Compte client ───────────────────────────────────────────────────
export function SkeletonOrderCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <Skeleton className="h-5 w-32 mb-1.5" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-4 w-16 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-md" />
        <Skeleton className="h-4 w-14 rounded-md" />
      </div>
      <div className="flex justify-between items-center pt-1 border-t border-gray-50">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-24 rounded-xl" />
      </div>
    </div>
  )
}
