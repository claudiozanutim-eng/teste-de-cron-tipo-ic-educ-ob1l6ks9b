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
      <Card className="w-full max-w-md border border-[#2B2621]/15 shadow-[0_8px_30px_rgba(43,38,33,0.06)] rounded-3xl bg-white overflow-hidden text-center font-sans">
        <div className="h-1.5 bg-[#E55320]" />

        <CardHeader className="pt-8 pb-2">
          <CardTitle className="text-2xl font-fraunces font-bold text-[#2B2621]">
            Verificação de E-mail
          </CardTitle>
          <CardDescription className="text-sm text-[#2B2621]/70 font-sans">
            Confirmação de cadastro no Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4 pb-6 px-6 sm:px-8 space-y-5">
          {status === 'loading' && (
            <div className="py-6 space-y-3">
              <Loader2 className="w-10 h-10 text-[#E55320] animate-spin mx-auto" />
              <p className="text-sm text-[#2B2621]/70">
                Validando seu e-mail com nossos servidores...
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4 animate-fade-in">
              <div className="mx-auto w-14 h-14 rounded-full bg-[#FAF7F1] border border-[#E55320]/30 flex items-center justify-center text-[#E55320]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="font-fraunces font-bold text-lg text-[#2B2621]">
                  E-mail verificado com sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-[#2B2621]/70 leading-relaxed font-sans">
                  Sua conta está 100% pronta. Agora você pode responder ao teste e receber seu
                  resultado detalhado.
                </p>
              </div>
              <Link to="/teste" className="inline-block w-full pt-2">
                <Button className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm font-sans">
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
                <h3 className="font-fraunces font-bold text-lg text-[#2B2621]">
                  Falha na verificação
                </h3>
                <p className="text-xs sm:text-sm text-[#2B2621]/70 leading-relaxed font-sans">
                  {errorMessage || 'O link de verificação é inválido ou expirou.'}
                </p>
              </div>
              <div className="pt-2 flex flex-col gap-2">
                <Link to="/login" className="w-full">
                  <Button className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm font-sans">
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
