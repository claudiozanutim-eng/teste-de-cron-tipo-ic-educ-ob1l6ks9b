import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { Loader2 } from 'lucide-react'

export default function RootIndexRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const [destPath, setDestPath] = useState<string | null>(null)
  const [checkingResult, setCheckingResult] = useState(false)

  useEffect(() => {
    let isMounted = true

    if (isLoading) return

    if (!isAuthenticated || !user) {
      setDestPath('/login')
      return
    }

    // Se é administrador, vai direto para o dashboard admin
    if (user.admin) {
      setDestPath('/admin/dashboard')
      return
    }

    // Se é participante, checa se já respondeu
    setCheckingResult(true)
    testeService
      .getUltimoResultado(user.id)
      .then((resultado) => {
        if (!isMounted) return
        if (resultado) {
          setDestPath('/resultado')
        } else {
          setDestPath('/teste')
        }
      })
      .catch((err) => {
        console.warn('Erro ao verificar último resultado na raiz:', err)
        if (isMounted) setDestPath('/teste')
      })
      .finally(() => {
        if (isMounted) setCheckingResult(false)
      })

    return () => {
      isMounted = false
    }
  }, [user, isAuthenticated, isLoading])

  if (isLoading || checkingResult || !destPath) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 space-y-3 font-sans">
        <Loader2 className="w-10 h-10 text-[#E55320] animate-spin" />
        <p className="text-sm font-semibold text-[#2B2621]/70">
          Iniciando Teste de Cronótipo IC Educ...
        </p>
      </div>
    )
  }

  return <Navigate to={destPath} replace />
}
