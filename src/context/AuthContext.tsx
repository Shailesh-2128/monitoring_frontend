import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { User, ModuleKey, PermissionLevel } from '../types/iam'

const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  hasPermission: (module: ModuleKey, level?: PermissionLevel) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('monitoring_auth_token'))
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/iam/me/`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      if (res.ok) {
        const userData: User = await res.json()
        setUser(userData)
      } else {
        // Invalid or expired token
        localStorage.removeItem('monitoring_auth_token')
        setToken(null)
        setUser(null)
      }
    } catch (err) {
      console.error('Failed to authenticate current user:', err)
      localStorage.removeItem('monitoring_auth_token')
      setToken(null)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token)
    } else {
      setIsLoading(false)
    }
  }, [token, fetchCurrentUser])

  const login = async (username: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/iam/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || 'Login failed. Please check credentials.')
      }

      const authToken = data.token
      localStorage.setItem('monitoring_auth_token', authToken)
      setToken(authToken)
      setUser(data.user)
    } catch (err: any) {
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('monitoring_auth_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token)
    }
  }

  const hasPermission = useCallback((module: ModuleKey, requiredLevel: PermissionLevel = 'read'): boolean => {
    if (!user) return false
    
    // Superadmin bypass
    if (user.is_staff || user.profile?.is_superadmin) {
      return true
    }

    const perms = (user.permissions || {}) as Record<string, PermissionLevel>
    const userLevel = perms[module] || 'none'

    if (userLevel === 'none') return false
    if (requiredLevel === 'read') return userLevel === 'read' || userLevel === 'write'
    if (requiredLevel === 'write') return userLevel === 'write'

    return false
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        hasPermission,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
