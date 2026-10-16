import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalModals } from '@/components/LegalModals'
import { Check, AlertCircle, Loader2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Validação em tempo real
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const isPasswordLongEnough = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)

  // Cálculo simples de força da senha
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', percent: 0 }
    let score = 0
    if (password.length >= 8) score += 1
    if (password.length >= 12) score += 1
    if (hasLetter && hasNumber) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    if (score <= 1) return { label: 'Fraca', color: 'bg-red-500', percent: 25 }
    if (score === 2) return { label: 'Razoável', color: 'bg-yellow-500', percent: 50 }
    if (score === 3) return { label: 'Boa', color: 'bg-blue-500', percent: 75 }
    return { label: 'Forte', color: 'bg-green-500', percent: 100 }
  }

  const strength = getPasswordStrength()
  const canSubmit = name.trim().length >= 2 && isEmailValid && isPasswordLongEnough && acceptedTerms

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!canSubmit) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios e aceite os termos.')
      return
    }

    setIsLoading(true)
    const { error } = await signUp({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    })
    setIsLoading(false)

    if (error) {
      console.error('Erro de cadastro:', error)
      const err = error as {
        data?: { data?: Record<string, { message?: string }> }
        message?: string
      }
      if (err.data?.data?.email) {
        setErrorMessage('Este e-mail já está em uso. Tente fazer login.')
      } else if (err.message) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage(
          'Não foi possível concluir o cadastro. Verifique os dados e tente novamente.',
        )
      }
      return
    }

    // Sucesso -> Redireciona para /teste (Parte 1)
    navigate('/teste')
  }

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2">
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden">
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
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-sm text-[#2B2621]/70 mt-1 font-sans">
            Descubra seu perfil circadiano no Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Nome Completo */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="name"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#E55320]" />
                Nome Completo
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Ex: Ana Silva"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="email"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#E55320]" />
                Endereço de E-mail
              </Label>
              <Input
                id="email"
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
              <Label
                htmlFor="password"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#E55320]" />
                Senha (mínimo 8 caracteres)
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha segura"
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

              {/* Indicador de força */}
              {password.length > 0 && (
                <div className="pt-1 space-y-1">
                  <div className="h-1.5 w-full bg-[#FAF7F1] border border-[#2B2621]/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${strength.color}`}
                      style={{ width: `${strength.percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-[#2B2621]/70">
                    <span>
                      Força: <strong>{strength.label}</strong>
                    </span>
                    {password.length < 8 && <span className="text-red-500">Mínimo 8 dígitos</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Checkbox Obrigatório dos Termos */}
            <div className="pt-2 font-sans">
              <label className="flex items-start gap-2.5 text-xs text-[#2B2621] cursor-pointer select-none leading-relaxed">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 rounded border-[#2B2621]/30 text-[#E55320] focus:ring-[#E55320] cursor-pointer accent-[#E55320]"
                  />
                </div>
                <span>
                  Li e aceito os{' '}
                  <button
                    type="button"
                    onClick={() => setTermsModalOpen(true)}
                    className="font-bold text-[#E55320] hover:underline"
                  >
                    Termos de Uso
                  </button>{' '}
                  e a{' '}
                  <button
                    type="button"
                    onClick={() => setPrivacyModalOpen(true)}
                    className="font-bold text-[#E55320] hover:underline"
                  >
                    Política de Privacidade
                  </button>
                  .
                </span>
              </label>
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm transition-all mt-4 disabled:opacity-50 font-sans"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Criando conta...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Criar conta e iniciar teste
                </>
              )}
            </Button>
          </form>

          {/* Link para Login */}
          <div className="mt-6 text-center text-xs text-[#2B2621]/70 pt-4 border-t border-[#2B2621]/10 font-sans">
            Já tem uma conta?{' '}
            <Link to="/login" className="font-bold text-[#E55320] hover:underline">
              Fazer login
            </Link>
          </div>
        </CardContent>
      </Card>

      <LegalModals
        termsOpen={termsModalOpen}
        privacyOpen={privacyModalOpen}
        onTermsChange={setTermsModalOpen}
        onPrivacyChange={setPrivacyModalOpen}
      />
    </div>
  )
}
