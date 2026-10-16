import React, { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react'

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { confirmVerification } = useAuth()

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    const runVerification = async () => {
      if (!token) {
        if (mounted) {
          setStatus('error')
          setErrorMessage('Token de verificação não encontrado na URL.')
        }
        return
      }

      const { error } = await confirmVerification(token)
      if (!mounted) return

      if (error) {
        console.error('Erro de verificação:', error)
        setStatus('error')
        setErrorMessage(
          'Não foi possível verificar seu e-mail. O link pode ter expirado ou já foi utilizado.',
        )
      } else {
        setStatus('success')
      }
    }

    runVerification()

    return () => {
      mounted = false
    }
  }, [token, confirmVerification])

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2">
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden text-center">
        <div className="h-2 bg-[#6C5CE7]" />

        <CardHeader className="pt-6 pb-2">
          <CardTitle className="text-2xl font-black text-[#2D3436]">
            Verificação de E-mail
          </CardTitle>
          <CardDescription className="text-sm text-[#636E72]">
            Confirmação de cadastro no Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 pb-6 px-6 sm:px-8 space-y-5">
          {status === 'loading' && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin mx-auto" />
              <p className="text-sm text-[#636E72]">
                Validando seu e-mail com nossos servidores...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
              <div className="mx-auto w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-[#2D3436]">E-mail verificado com sucesso!</h3>
                <p className="text-xs sm:text-sm text-[#636E72] leading-relaxed">
                  Sua conta está 100% pronta. Agora você pode responder ao teste e receber seu
                  resultado detalhado.
                </p>
              </div>
              <Link to="/teste" className="inline-block w-full pt-2">
                <Button className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(108,92,231,0.25)]">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Ir para o Teste
                </Button>
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4 animate-fade-in">
              <div className="mx-auto w-14 h-14 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                <AlertCircle className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-lg text-[#2D3436]">Falha na verificação</h3>
                <p className="text-xs sm:text-sm text-[#636E72] leading-relaxed">
                  {errorMessage || 'O link de verificação é inválido ou expirou.'}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full">
                    Ir para o Login
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
