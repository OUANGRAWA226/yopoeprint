'use client' // Error components must be Client Components

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react'

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Unhandled application error:', error)
  }, [error])

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-500">
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 text-red-500 shadow-sm border border-red-100">
        <AlertTriangle size={36} />
      </div>
      
      <h2 className="font-display text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
        Oops, un problème est survenu
      </h2>
      
      <p className="text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
        Nous sommes désolés, une erreur inattendue s'est produite lors du chargement de cette page. Notre équipe technique a été alertée.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-all shadow-sm active:scale-95 w-full sm:w-auto justify-center"
        >
          <RefreshCcw size={16} />
          Réessayer
        </button>
        
        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all w-full sm:w-auto justify-center"
        >
          <Home size={16} />
          Retour à l'accueil
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-4 bg-gray-900 text-red-400 rounded-xl text-left w-full max-w-2xl overflow-auto text-xs font-mono shadow-lg">
          <p className="font-bold text-red-300 mb-2">Détails de l'erreur (visible en dev uniquement) :</p>
          {error.message}
          {error.stack && (
            <pre className="mt-2 text-gray-400 border-t border-gray-700 pt-2 opacity-80 whitespace-pre-wrap">
              {error.stack}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
