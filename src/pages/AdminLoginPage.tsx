import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

export default function AdminLoginPage() {
  const { signIn, signOut } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Por favor, informe suas credenciais de administrador.')
      return
    }

    setIsLoading(true)
    const { user, error } = await signIn(email.trim().toLowerCase(), password)
    setIsLoading(false)

    if (error || !user) {
      console.error('Erro login admin:', error)
      setErrorMessage('E-mail ou senha inválidos.')
      return
    }

    // Exige admin: true
    if (!user.admin) {
      // Faz logout preventivo
      signOut()
      setErrorMessage('Acesso não autorizado. Esta conta não possui privilégios de administrador.')
      return
    }

    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F1] flex items-center justify-center p-4 font-sans text-[#2B2621]">
      <Card className="w-full max-w-md border border-[#2B2621]/15 shadow-[0_12px_40px_rgba(43,38,33,0.08)] rounded-3xl bg-white overflow-hidden">
        <div className="h-2 bg-[#E55320]" />

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 mb-3 flex items-center justify-center">
            <img
              src={icLogo}
              alt="IC Educ"
              className="w-16 h-16 rounded-full object-contain shadow-sm"
            />
          </div>
          <CardTitle className="text-2xl font-fraunces font-bold text-[#2B2621]">
            Acesso Administrativo
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#2B2621]/70 font-sans">
            Painel de Gestão e Métricas • Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-8 px-6 sm:px-8 font-sans">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in font-sans">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="admin-email"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#E55320]" />
                E-mail do Administrador
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@iceduc.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
              />
            </div>

            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="admin-password"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#E55320]" />
                Senha
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2621]/50 hover:text-[#2B2621]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm transition-all mt-4 font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verificando credenciais...
                </>
              ) : (
                <>
                  Entrar como administrador
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-[#2B2621]/70 pt-4 border-t border-[#2B2621]/10 font-sans">
            <a href="/login" className="font-semibold text-[#E55320] hover:underline">
              ← Voltar ao login de participantes
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
