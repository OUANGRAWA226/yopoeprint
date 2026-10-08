'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { adminAuthService } from '@/lib/auth-admin.service'

export default function RootPage() {
  const router = useRouter()
  
  useEffect(() => {
    if (adminAuthService.isAuthenticated()) {
      router.push('/admin')
    } else {
      router.push('/login')
    }
  }, [router])
  
  return null
}
