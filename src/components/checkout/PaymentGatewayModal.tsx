'use client'

import { useState, useEffect } from 'react'
import { Lock, Smartphone, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react'
import { paymentService } from '@/lib/payment.service'

type PaymentGatewayModalProps = {
  isOpen: boolean
  amount: number
  paymentId?: string
  onSuccess: () => void
  onCancel: () => void
}

type Step = 'PHONE' | 'WAITING' | 'OTP' | 'SUCCESS'

export default function PaymentGatewayModal({ isOpen, amount, paymentId, onSuccess, onCancel }: PaymentGatewayModalProps) {
  const [step, setStep] = useState<Step>('WAITING')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('WAITING')
      setPhone('')
      setOtp(['', '', '', ''])
      setIsProcessing(false)
      setError('')
      
      // Move to OTP automatically after a short delay since phone was provided on the previous page
      setTimeout(() => {
        setStep('OTP')
      }, 3000)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Normalement ce composant n'est plus appelé car le tél est géré dans la page principale
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // only 1 char
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto focus next
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      if (nextInput) nextInput.focus()
    }
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.join('').length < 4 || !paymentId) return

    setIsProcessing(true)
    setError('')
    try {
      // Appel API pour valider l'OTP
      await paymentService.validateOtp({
        paymentId: paymentId,
        otp: otp.join(''),
      })
      
      setIsProcessing(false)
      setStep('SUCCESS')
      
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Code OTP invalide ou erreur réseau.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Container */}
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Header Sécurisé */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck size={20} className="text-[#10B981]" />
            <span className="font-bold text-sm tracking-wide">PAIEMENT SÉCURISÉ</span>
          </div>
          <button onClick={onCancel} className="text-slate-400 hover:text-white transition-colors" title="Annuler">
            ✕
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-slate-50 px-6 py-5 border-b border-gray-100 flex justify-between items-end">
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Montant à payer</p>
            <p className="text-sm text-gray-600">YopoePrint SARL</p>
          </div>
          <p className="font-display font-extrabold text-2xl text-slate-900">
            {new Intl.NumberFormat('fr-FR').format(amount)} <span className="text-sm">FCFA</span>
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* STEP 1: PHONE NUMBER */}
          {step === 'PHONE' && (
            <form onSubmit={handlePhoneSubmit} className="animate-in slide-in-from-right-4">
              <div className="mb-6 flex gap-3">
                <div className="w-1/2 p-3 border-2 border-orange-500 rounded-xl bg-orange-50 flex items-center justify-center gap-2 cursor-pointer">
                  <div className="w-4 h-4 bg-orange-500 rounded-sm"></div>
                  <span className="font-bold text-xs text-orange-900">Orange</span>
                </div>
                <div className="w-1/2 p-3 border-2 border-gray-100 rounded-xl bg-white flex items-center justify-center gap-2 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
                  <div className="w-4 h-4 bg-blue-600 rounded-sm"></div>
                  <span className="font-bold text-xs text-slate-900">Moov</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Numéro Mobile Money</label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold">+226</span>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="70 00 00 00"
                      className="w-full pl-16 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing || phone.length < 8}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all disabled:opacity-50"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
                  Payer {new Intl.NumberFormat('fr-FR').format(amount)} F
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: WAITING USSD */}
          {step === 'WAITING' && (
            <div className="text-center py-8 animate-in slide-in-from-right-4">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <Smartphone size={32} className="text-orange-500 relative z-10" />
                <span className="absolute inset-0 border-4 border-orange-200 rounded-full animate-ping opacity-75"></span>
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Vérifiez votre téléphone</h3>
              <p className="text-sm text-gray-500">
                Un menu s'est affiché sur votre téléphone.<br/>
                Veuillez taper votre code secret pour valider.
              </p>
            </div>
          )}

          {/* STEP 3: OTP (Si pas de push USSD) */}
          {step === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="text-center animate-in slide-in-from-right-4">
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">Saisissez le code de sécurité</h3>
              <p className="text-sm text-gray-500 mb-6">
                Pour des raisons de sécurité, veuillez entrer le code à 4 chiffres reçu par SMS.
              </p>

              {error && (
                <div className="mb-4 text-xs font-bold text-red-500 bg-red-50 py-2 rounded-lg">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-3 mb-8">
                {otp.map((digit, i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                    className="w-14 h-16 text-center text-2xl font-bold bg-gray-50 border border-gray-200 rounded-xl focus:border-slate-900 focus:bg-white outline-none transition-all"
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || otp.join('').length < 4}
                className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary transition-all disabled:opacity-50"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Valider le paiement'}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-8 animate-in zoom-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-500" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-slate-900 mb-2">Paiement validé !</h3>
              <p className="text-sm text-gray-500">
                Redirection vers votre commande...
              </p>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="bg-slate-50 px-6 py-4 flex items-center justify-center gap-2 border-t border-gray-100">
          <Lock size={14} className="text-gray-400" />
          <p className="text-xs text-gray-500 font-medium">Paiement 100% sécurisé et crypté</p>
        </div>

      </div>
    </div>
  )
}
