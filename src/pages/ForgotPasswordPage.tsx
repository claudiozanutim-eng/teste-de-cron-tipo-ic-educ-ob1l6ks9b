import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsLoading(true)
    await requestPasswordReset(email.trim().toLowerCase())
    setIsLoading(false)
    // Mostra mensagem amigável de sucesso independentemente (boa prática de segurança)
    setSubmitted(true)
  }

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2">
      <Card className="w-full max-w-md border border-[#2B2621]/15 shadow-[0_8px_30px_rgba(43,38,33,0.06)] rounded-3xl bg-white overflow-hidden">
        <div className="h-1.5 bg-[#E55320]" />

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#FAF7F1] border border-[#2B2621]/10 flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-[#E55320]" />
          </div>
          <CardTitle className="text-2xl font-fraunces font-bold text-[#2B2621]">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-sm text-[#2B2621]/70 font-sans">
            Informe seu e-mail para receber as instruções de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8 font-sans">
          {submitted ? (
            <div className="space-y-5 text-center animate-fade-in py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-[#FAF7F1] border border-[#E55320]/30 flex items-center justify-center text-[#E55320]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-fraunces font-bold text-base text-[#2B2621]">
                  E-mail enviado!
                </h3>
                <p className="text-xs sm:text-sm text-[#2B2621]/70 leading-relaxed font-sans">
                  Se existir uma conta cadastrada para <strong>{email}</strong>, você receberá um
                  link com as instruções para definir sua nova senha.
                </p>
              </div>
              <Link to="/login" className="inline-block w-full">
                <Button className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm font-sans">
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-bold text-[#2B2621]">
                  Seu E-mail Cadastrado
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm transition-all mt-3 font-sans"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando link...
                  </>
                ) : (
                  'Enviar link de redefinição'
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs font-semibold text-[#E55320] hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" />
                  Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
