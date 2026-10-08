import Link from 'next/link'
import { ShoppingBag, ArrowRight, Clock, FileText, CheckCircle2 } from 'lucide-react'

export default function CompteDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-extrabold text-gray-900">Bienvenue, John 👋</h1>
      <p className="text-gray-500 text-sm mb-8">Voici un résumé de votre activité sur YopoePrint.</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center mb-4">
            <ShoppingBag size={20} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Commandes totales</p>
          <p className="text-3xl font-display font-bold text-gray-900">12</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
            <Clock size={20} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">En cours de production</p>
          <p className="text-3xl font-display font-bold text-gray-900">1</p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
            <CheckCircle2 size={20} />
          </div>
          <p className="text-gray-500 text-sm font-medium mb-1">Fichiers validés</p>
          <p className="text-3xl font-display font-bold text-gray-900">48</p>
        </div>
      </div>

      {/* Active Order Widget */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-8">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Commande en cours</h2>
          <Link href="/compte/commandes" className="text-sm font-semibold text-primary hover:underline">
            Voir tout
          </Link>
        </div>
        <div className="p-6 bg-gray-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Commande <span className="text-gray-900 font-bold">#YP-4092</span></p>
              <p className="text-xs text-gray-400">Passée le 26 Mai 2026</p>
            </div>
            <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
              En Impression
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">
              📄
            </div>
            <div>
              <p className="font-bold text-gray-900">Flyers A5 (x1000)</p>
              <p className="text-sm text-gray-500">Papier Couché Mat 135g</p>
            </div>
          </div>
          
          {/* Progress Bar (Visual Fake) */}
          <div className="mt-8">
            <div className="flex justify-between text-xs font-semibold text-gray-400 mb-2 px-1">
              <span className="text-primary">Validé</span>
              <span className="text-primary">Impression</span>
              <span>Expédition</span>
              <span>Livré</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
