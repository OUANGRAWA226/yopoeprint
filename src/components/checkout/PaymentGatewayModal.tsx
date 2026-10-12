'use client'

import { useState, useEffect } from 'react'
import { Lock, Smartphone, CheckCircle, ShieldCheck, Loader2, ArrowRight } from 'lucide-react'
import { paymentService } from '@/lib/payment.service'

type PaymentGatewayModalProps = {
  isOpen: boolean
  amount: number
  paymentId?: string
  onSuccess: () => void
  onCancel: () => void
}

type Step = 'PHONE' | 'WAITING' | 'OTP' | 'SUCCESS'
type Operator = 'orange' | 'moov'

export default function PaymentGatewayModal({ isOpen, amount, paymentId, onSuccess, onCancel }: PaymentGatewayModalProps) {
  const [step, setStep] = useState<Step>('WAITING')
  const [operator, setOperator] = useState<Operator>('orange')
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
      const timer = setTimeout(() => {
        setStep('OTP')
      }, 2500)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
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
      setError(err.response?.data?.message || 'Code OTP incorrect ou expiré. Veuillez réessayer.')
      setIsProcessing(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Container Apple Pay Style */}
      <div className="bg-white w-full max-w-md rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.18)] border border-black/5 overflow-hidden relative animate-in zoom-in-95 duration-300">
        
        {/* Header Sécurisé Cupertino */}
        <div className="bg-[#1D1D1F] px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={16} />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-wider uppercase block">Passerelle Certifiée</span>
              <span className="text-[10px] text-gray-400">YopoePrint Pay · Chiffrement AES-256</span>
            </div>
          </div>
          <button 
            onClick={onCancel} 
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors text-xs font-bold" 
            title="Fermer"
          >
            ✕
          </button>
        </div>

        {/* Amount Banner */}
        <div className="bg-[#F5F5F7] px-6 py-5 border-b border-black/5 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Montant de la commande</p>
            <p className="text-xs font-semibold text-gray-800">YopoePrint SARL · Facture DGI</p>
          </div>
          <div className="text-right">
            <p className="font-display font-black text-2xl text-[#1D1D1F]">
              {new Intl.NumberFormat('fr-FR').format(amount)}{' '}
              <span className="text-xs font-bold text-gray-500">FCFA</span>
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6">
          
          {/* STEP 1: PHONE NUMBER */}
          {step === 'PHONE' && (
            <form onSubmit={handlePhoneSubmit} className="animate-in slide-in-from-right-4">
              <div className="mb-6 grid grid-cols-2 gap-2.5 p-1 bg-gray-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOperator('orange')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    operator === 'orange' ? 'bg-white shadow-xs text-orange-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7900]" />
                  Orange Money
                </button>
                <button
                  type="button"
                  onClick={() => setOperator('moov')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    operator === 'moov' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066B2]" />
                  Moov Money
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Numéro Mobile Money (Burkina Faso)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-gray-400 font-bold text-sm">+226</span>
                    <input 
                      type="tel" 
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 8))}
                      placeholder="70 00 00 00"
                      className="w-full pl-16 pr-4 py-3 bg-[#F5F5F7] border border-black/5 rounded-2xl font-bold text-gray-900 focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all text-base"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isProcessing || phone.length < 8}
                  className="w-full py-4 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95 shadow-md"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Lock size={16} />}
                  Confirmer {new Intl.NumberFormat('fr-FR').format(amount)} FCFA
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: WAITING USSD (Push Notification sur mobile) */}
          {step === 'WAITING' && (
            <div className="text-center py-6 animate-in slide-in-from-right-4">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 relative">
                <Smartphone size={32} className="relative z-10" />
                <span className="absolute inset-0 border-4 border-emerald-400 rounded-full animate-ping opacity-60" />
              </div>
              <h3 className="font-display font-extrabold text-lg text-[#1D1D1F] mb-1.5">
                Validez sur votre téléphone
              </h3>
              <p className="text-xs text-gray-500 max-w-xs mx-auto leading-relaxed">
                Une invite USSD sécurisée a été envoyée sur votre mobile.<br />
                Entrez votre code secret Orange ou Moov Money pour autoriser le débit.
              </p>
            </div>
          )}

          {/* STEP 3: OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleOtpSubmit} className="text-center animate-in slide-in-from-right-4">
              <h3 className="font-display font-black text-lg text-[#1D1D1F] mb-1.5">
                Code de confirmation SMS
              </h3>
              <p className="text-xs text-gray-500 mb-6 max-w-xs mx-auto">
                Saisissez le code à 4 chiffres reçu par SMS pour finaliser votre commande en toute sécurité.
              </p>

              {error && (
                <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 py-2.5 px-3 rounded-2xl">
                  {error}
                </div>
              )}

              <div className="flex justify-center gap-3 mb-6">
                {otp.map((digit, i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value.replace(/\D/g, ''))}
                    className="w-13 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black bg-[#F5F5F7] border border-black/10 rounded-2xl focus:border-black focus:bg-white focus:ring-4 focus:ring-black/5 outline-none transition-all"
                  />
                ))}
              </div>

              <button 
                type="submit" 
                disabled={isProcessing || otp.join('').length < 4}
                className="w-full py-4 bg-[#1D1D1F] hover:bg-black text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 active:scale-95 shadow-md"
              >
                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : 'Valider et lancer la commande'}
                {!isProcessing && <ArrowRight size={16} />}
              </button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="text-center py-6 animate-in zoom-in">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={40} />
              </div>
              <h3 className="font-display font-black text-2xl text-[#1D1D1F] mb-1">
                Paiement validé avec succès !
              </h3>
              <p className="text-xs text-gray-500">
                Génération de votre Bon À Tirer (BAT) et transmission à l’atelier...
              </p>
            </div>
          )}

        </div>
        
        {/* Footer info Apple style */}
        <div className="bg-[#F5F5F7] px-6 py-3.5 flex items-center justify-center gap-2 border-t border-black/5">
          <Lock size={12} className="text-gray-400" />
          <p className="text-[11px] text-gray-500 font-medium">
            Paiement 100% garanti · Orange Money & Moov Money Burkina Faso
          </p>
        </div>

      </div>
    </div>
  )
}
