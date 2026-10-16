import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Mensagem passada por redirecionamento se houver
  const stateMessage = (location.state as { message?: string })?.message

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email || !password) {
      setErrorMessage('Por favor, informe seu e-mail e senha.')
      return
    }

    setIsLoading(true)
    const { user, error } = await signIn(email.trim().toLowerCase(), password)

    if (error || !user) {
      setIsLoading(false)
      console.error('Erro de login:', error)
      setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.')
      return
    }

    // Regra de Redirecionamento após login bem-sucedido:
    // 1. Administradores (perfil admin) -> painel administrativo (/admin/dashboard)
    // 2. Participantes que JÁ responderam -> tela do último resultado deles (/resultado)
    // 3. Participantes que NUNCA responderam -> tela do teste Parte 1 (/teste)
    try {
      if (user.admin) {
        navigate('/admin/dashboard')
        return
      }

      const ultimo = await testeService.getUltimoResultado(user.id)
      if (ultimo) {
        navigate('/resultado')
      } else {
        navigate('/teste')
      }
    } catch (err) {
      console.warn('Erro ao verificar último resultado no login, direcionando para /teste:', err)
      navigate('/teste')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2 font-sans">
      <Card className="w-full max-w-md border border-[#2B2621]/15 shadow-[0_8px_30px_rgba(43,38,33,0.06)] rounded-3xl bg-white overflow-hidden">
        <div className="h-1.5 bg-[#E55320]" />

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-16 h-16 mb-3 flex items-center justify-center">
            <img
              src={icLogo}
              alt="IC Educ"
              className="w-16 h-16 rounded-full object-contain shadow-sm"
            />
          </div>
          <CardTitle className="text-2xl sm:text-[25px] font-fraunces font-bold text-[#2B2621] tracking-tight">
            Bem vindo ao teste de Cronótipo
          </CardTitle>
          <CardDescription className="text-sm text-[#2B2621]/70 mt-1 font-sans">
            Entre para acessar seu teste de cronótipo ou seus resultados
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          {stateMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs sm:text-sm font-sans">
              {stateMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in font-sans">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="login-email"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#E55320]" />
                E-mail
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5 font-sans">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#E55320]" />
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#E55320] hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha de acesso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 pr-10 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2621]/50 hover:text-[#2B2621]"
                  aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm transition-all mt-4 font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                <>
                  Entrar
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </form>

          {/* Link para Cadastro */}
          <div className="mt-6 text-center text-xs text-[#2B2621]/70 pt-4 border-t border-[#2B2621]/10 font-sans">
            Ainda não tem conta?{' '}
            <Link to="/signup" className="font-bold text-[#E55320] hover:underline">
              Criar conta gratuitamente
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
