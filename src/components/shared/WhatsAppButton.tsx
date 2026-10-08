'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatsAppButton() {
 const pathname = usePathname()
 const [message, setMessage] = useState('Bonjour YopoePrint, j\'aimerais avoir des informations.')
 const [isHovered, setIsHovered] = useState(false)

 useEffect(() => {
 if (pathname.includes('/produit/')) {
 const slug = pathname.split('/').pop() || ''
 const productName = slug.replace(/-/g, ' ')
 setMessage(`Bonjour YopoePrint, je suis sur la page du produit "${productName}" et j'aimerais être accompagné pour configurer ma commande.`)
 } else if (pathname.includes('/panier')) {
 setMessage('Bonjour YopoePrint, j\'ai besoin d\'aide pour valider mon panier et effectuer mon paiement.')
 } else {
 setMessage('Bonjour YopoePrint, j\'aimerais avoir des renseignements sur vos services d\'imprimerie.')
 }
 }, [pathname])

 const whatsappNumber = '+22650000000'
 const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

 return (
 <div className="fixed bottom-[90px] md:bottom-6 right-4 md:right-6 z-50 flex items-center justify-end"
 onMouseEnter={() => setIsHovered(true)}
 onMouseLeave={() => setIsHovered(false)}>
 
 <AnimatePresence>
 {isHovered && (
 <motion.div
 initial={{ opacity: 0, scale: 0.95, x: 10 }}
 animate={{ opacity: 1, scale: 1, x: 0 }}
 exit={{ opacity: 0, scale: 0.95, x: 10 }}
 transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
 className="absolute right-[72px] bg-foreground text-background text-xs font-semibold px-4 py-2.5 rounded-xl whitespace-nowrap shadow-elevation origin-right"
 >
 Besoin d&apos;aide ? Écrivez-nous !
 </motion.div>
 )}
 </AnimatePresence>

 <motion.a
 href={whatsappUrl}
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center justify-center w-[60px] h-[60px] bg-[#25D366] text-white rounded-full shadow-elevation cursor-pointer relative"
 title="Discuter sur WhatsApp"
 whileHover={{ scale: 1.05 }}
 whileTap={{ scale: 0.95 }}
 transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
 >
 <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 pointer-events-none" style={{ animationDuration: '3s' }} />

 <svg
 className="w-8 h-8 fill-current relative z-10"
 viewBox="0 0 24 24"
 xmlns="http://www.w3.org/2000/svg"
 >
 <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.455L0 24zm6.59-4.846c1.66.988 3.285 1.488 4.96 1.49 5.35.003 9.702-4.344 9.705-9.701.002-2.595-1.005-5.034-2.837-6.87C16.587 2.228 14.15 1.218 11.56 1.218c-5.355 0-9.708 4.348-9.71 9.706-.001 1.782.474 3.42 1.378 4.887l-.988 3.606 3.807-.983zm13.125-6.84c-.305-.153-1.802-.89-2.083-.992-.28-.103-.485-.153-.687.153-.203.305-.785.992-.962 1.194-.177.202-.355.228-.66.076-.304-.153-1.286-.474-2.45-1.512-.904-.806-1.513-1.802-1.69-2.107-.177-.305-.019-.47.133-.62.137-.136.305-.355.457-.533.153-.177.203-.305.305-.508.102-.203.05-.38-.025-.533-.076-.153-.687-1.654-.94-2.263-.247-.595-.5-.514-.688-.524-.177-.008-.38-.01-.584-.01-.203 0-.533.076-.813.38-.28.305-1.07 1.042-1.07 2.542 0 1.5 1.092 2.946 1.244 3.15.153.203 2.15 3.284 5.207 4.605.727.314 1.294.502 1.737.643.73.232 1.396.199 1.922.12.585-.087 1.802-.736 2.057-1.44.255-.703.255-1.306.178-1.44-.076-.133-.28-.203-.585-.356z" />
 </svg>
 </motion.a>
 </div>
 )
}
