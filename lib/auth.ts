import { supabase } from './supabase'
import { AuthError, User } from '@supabase/supabase-js'

export interface AuthResponse {
  success: boolean
  error?: string
  user?: User
}

// 用户注册
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      user: data.user
    }
  } catch (error) {
    return {
      success: false,
      error: '注册失败，请稍后重试'
    }
  }
}

// 用户登录
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true,
      user: data.user
    }
  } catch (error) {
    return {
      success: false,
      error: '登录失败，请稍后重试'
    }
  }
}

// 用户退出
export async function signOut(): Promise<AuthResponse> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message
      }
    }

    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: '退出失败，请稍后重试'
    }
  }
}

// 获取当前用户
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return null
  }
}

// 监听认证状态变化
export function onAuthStateChange(callback: (user: User | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null)
  })
}