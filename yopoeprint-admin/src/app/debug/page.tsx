'use client'

import { useEffect, useState } from 'react'
import { adminAuthService } from '@/lib/auth-admin.service'

export default function DebugPage() {
  const [info, setInfo] = useState<any>(null)

  useEffect(() => {
    const token = adminAuthService.getToken()
    const user = adminAuthService.getCurrentUser()
    const isAuth = adminAuthService.isAuthenticated()

    setInfo({
      tokenExists: !!token,
      tokenValue: token ? `${token.substring(0, 30)}...` : 'NO TOKEN',
      userExists: !!user,
      userEmail: user?.email,
      userRole: user?.role,
      isAuthenticated: isAuth,
      timestamp: new Date().toLocaleString(),
    })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-deep mb-6">🔍 Debug Autentification</h1>

        <div className="bg-white rounded-xl p-6 space-y-4">
          {info ? (
            <>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-bold">Token exists:</span>{' '}
                  <span className={info.tokenExists ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {info.tokenExists ? '✓ YES' : '✗ NO'}
                  </span>
                </p>
                <p className="text-xs text-gray-500 break-all">{info.tokenValue}</p>
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-bold">User exists:</span>{' '}
                  <span className={info.userExists ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {info.userExists ? '✓ YES' : '✗ NO'}
                  </span>
                </p>
                {info.userExists && (
                  <>
                    <p className="text-sm">Email: <span className="font-mono">{info.userEmail}</span></p>
                    <p className="text-sm">
                      Role: <span className="font-bold" style={{ color: info.userRole === 'ADMIN' ? 'green' : 'red' }}>
                        {info.userRole}
                      </span>
                    </p>
                  </>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <p className="text-sm">
                  <span className="font-bold">Is Authenticated:</span>{' '}
                  <span className={info.isAuthenticated ? 'text-green-600 font-bold' : 'text-red-600'}>
                    {info.isAuthenticated ? '✓ YES' : '✗ NO'}
                  </span>
                </p>
              </div>

              <div className="border-t pt-4 text-xs text-gray-400">
                Checked at: {info.timestamp}
              </div>
            </>
          ) : (
            <p>Loading...</p>
          )}
        </div>

        <div className="mt-6">
          <a href="/admin"
             className="inline-block px-6 py-3 bg-blue-mid text-white rounded-xl font-bold hover:bg-blue-deep transition-all">
            Back to Admin
          </a>
        </div>
      </div>
    </div>
  )
}
