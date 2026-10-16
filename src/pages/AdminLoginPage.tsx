import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, AlertCircle, Loader2, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'

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
    <div className="min-h-screen bg-[#F7F5FF] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_12px_40px_rgba(108,92,231,0.12)] rounded-3xl bg-white overflow-hidden">
        <div className="h-2.5 bg-[#6C5CE7]" />

        <CardHeader className="text-center pt-8 pb-4">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mb-3 text-[#6C5CE7] shadow-sm">
            <Shield className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-black text-[#2D3436]">
            Acesso Administrativo
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#636E72]">
            Painel de Gestão e Métricas • Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-8 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-email"
                className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#6C5CE7]" />
                E-mail do Administrador
              </Label>
              <Input
                id="admin-email"
                type="email"
                placeholder="admin@iceduc.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="admin-password"
                className="text-xs font-bold text-[#2D3436] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#6C5CE7]" />
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

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_16px_rgba(108,92,231,0.25)] hover:shadow-[0_6px_24px_rgba(108,92,231,0.35)] transition-all mt-4"
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

          <div className="mt-6 text-center text-xs text-[#636E72] pt-4 border-t border-[#E0DEE8]">
            <a href="/login" className="font-semibold text-[#6C5CE7] hover:underline">
              ← Voltar ao login de participantes
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
