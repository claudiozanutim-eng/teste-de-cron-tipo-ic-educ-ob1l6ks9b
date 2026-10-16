import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'

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
    const { error } = await signIn(email.trim().toLowerCase(), password)
    setIsLoading(false)

    if (error) {
      console.error('Erro de login:', error)
      setErrorMessage('E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.')
      return
    }

    // Sucesso -> Redireciona para /teste
    navigate('/teste')
  }

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2">
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden">
        <div className="h-2 bg-gradient-to-r from-[#6C5CE7] to-[#8E44AD]" />

        <CardHeader className="text-center pt-6 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6C5CE7] to-[#8E44AD] flex items-center justify-center text-white font-black text-xl shadow-[0_4px_12px_rgba(108,92,231,0.3)] mb-3">
            IC
          </div>
          <CardTitle className="text-2xl font-black text-[#2D3436]">Bem-vindo de volta</CardTitle>
          <CardDescription className="text-sm text-[#636E72]">
            Entre para acessar seu teste de cronótipo ou seus resultados
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          {stateMessage && (
            <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm">
              {stateMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <Label
                htmlFor="login-email"
                className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#6C5CE7]" />
                E-mail
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="login-password"
                  className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5 text-[#6C5CE7]" />
                  Senha
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-semibold text-[#6C5CE7] hover:underline"
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
                  className="h-11 pr-10 rounded-xl border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(108,92,231,0.25)] hover:shadow-[0_6px_20px_rgba(108,92,231,0.35)] transition-all mt-4"
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
          <div className="mt-6 text-center text-xs text-[#636E72] pt-4 border-t border-[#E0DEE8]">
            Ainda não tem conta?{' '}
            <Link to="/signup" className="font-bold text-[#6C5CE7] hover:underline">
              Criar conta gratuitamente
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
