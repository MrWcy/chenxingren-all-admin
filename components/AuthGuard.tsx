'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Spin } from 'antd'
import { useAuth } from '@/contexts/AuthContext'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
}

export default function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, requireAuth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="加载中..." />
      </div>
    )
  }

  if (requireAuth && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" tip="正在跳转到登录页面..." />
      </div>
    )
  }

  return <>{children}</>
}