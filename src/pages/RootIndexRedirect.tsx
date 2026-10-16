import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'

export default function RootIndexRedirect() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin" />
        <p className="text-sm font-semibold text-[#636E72]">Iniciando Teste de Cronótipo...</p>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/teste" replace />
  }

  return <Navigate to="/login" replace />
}
