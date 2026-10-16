import React, { createContext, useContext, useEffect, useState } from 'react'
import pb from '@/lib/pocketbase/client'
import type { UserRecord } from '@/types/cronotipo'

interface AuthContextType {
  user: UserRecord | null
  isLoading: boolean
  isAuthenticated: boolean
  isAdmin: boolean
  signUp: (data: {
    name: string
    email: string
    password: string
    passwordConfirm?: string
  }) => Promise<{ user?: UserRecord; error?: unknown }>
  signIn: (email: string, password: string) => Promise<{ user?: UserRecord; error?: unknown }>
  signOut: () => void
  requestPasswordReset: (email: string) => Promise<{ error: unknown | null }>
  confirmPasswordReset: (token: string, password: string) => Promise<{ error: unknown | null }>
  confirmVerification: (token: string) => Promise<{ error: unknown | null }>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserRecord | null>(() => {
    return (pb.authStore.record as unknown as UserRecord) || null
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Escuta mudanças de auth
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      setUser((model as unknown as UserRecord) || null)
    })

    // Valida token inicial se existir
    const checkAuth = async () => {
      if (pb.authStore.isValid && pb.authStore.record) {
        try {
          const authData = await pb.collection('users').authRefresh()
          setUser(authData.record as unknown as UserRecord)
        } catch (err) {
          console.warn('Sessão expirada ou inválida, limpando:', err)
          pb.authStore.clear()
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setIsLoading(false)
    }

    checkAuth()

    return () => {
      unsubscribe()
    }
  }, [])

  const refreshUser = async () => {
    if (pb.authStore.isValid) {
      try {
        const authData = await pb.collection('users').authRefresh()
        setUser(authData.record as unknown as UserRecord)
      } catch (err) {
        console.warn('Erro ao atualizar usuário:', err)
      }
    }
  }

  const signUp = async (data: {
    name: string
    email: string
    password: string
    passwordConfirm?: string
  }) => {
    try {
      // 1. Cria usuário
      await pb.collection('users').create({
        email: data.email,
        password: data.password,
        passwordConfirm: data.passwordConfirm || data.password,
        name: data.name,
      })

      // 2. Envio de verificação de email (best-effort)
      try {
        await pb.collection('users').requestVerification(data.email)
      } catch (vErr) {
        console.warn('Não foi possível enviar email de verificação imediatamente:', vErr)
      }

      // 3. Login automático
      const authData = await pb.collection('users').authWithPassword(data.email, data.password)
      const newUser = authData.record as unknown as UserRecord
      setUser(newUser)
      return { user: newUser }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      const loggedUser = authData.record as unknown as UserRecord
      setUser(loggedUser)
      return { user: loggedUser }
    } catch (error) {
      return { error }
    }
  }

  const signOut = () => {
    pb.authStore.clear()
    setUser(null)
  }

  const requestPasswordReset = async (email: string) => {
    try {
      await pb.collection('users').requestPasswordReset(email)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmPasswordReset = async (token: string, password: string) => {
    try {
      await pb.collection('users').confirmPasswordReset(token, password, password)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const confirmVerification = async (token: string) => {
    try {
      await pb.collection('users').confirmVerification(token)
      if (user) {
        await refreshUser()
      }
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const isAuthenticated = !!user && pb.authStore.isValid
  const isAdmin = !!user?.admin

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        isAdmin,
        signUp,
        signIn,
        signOut,
        requestPasswordReset,
        confirmPasswordReset,
        confirmVerification,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}
