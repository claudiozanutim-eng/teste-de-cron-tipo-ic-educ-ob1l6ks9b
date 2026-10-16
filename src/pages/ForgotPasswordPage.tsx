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
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#6C5CE7]" />

        <CardHeader className="text-center pt-6 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mb-3">
            <Mail className="w-6 h-6 text-[#6C5CE7]" />
          </div>
          <CardTitle className="text-2xl font-black text-[#2D3436]">Recuperar Senha</CardTitle>
          <CardDescription className="text-sm text-[#636E72]">
            Informe seu e-mail para receber as instruções de redefinição
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          {submitted ? (
            <div className="space-y-5 text-center animate-fade-in py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2D3436]">E-mail enviado!</h3>
                <p className="text-xs sm:text-sm text-[#636E72] leading-relaxed">
                  Se existir uma conta cadastrada para <strong>{email}</strong>, você receberá um
                  link com as instruções para definir sua nova senha.
                </p>
              </div>
              <Link to="/login" className="inline-block w-full">
                <Button className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full">
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="forgot-email" className="text-xs font-bold text-[#2D3436]">
                  Seu E-mail Cadastrado
                </Label>
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu.email@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !email}
                className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(108,92,231,0.25)] transition-all mt-3"
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
                  className="inline-flex items-center text-xs font-semibold text-[#6C5CE7] hover:underline"
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
