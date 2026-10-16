import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalModals } from '@/components/LegalModals'
import { Check, AlertCircle, Loader2, Lock, Mail, User, Eye, EyeOff } from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

interface FormErrors {
  name?: string
  email?: string
  password?: string
  passwordConfirm?: string
  terms?: string
  privacy?: string
  general?: string
}

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

  // DOIS checkboxes obrigatórios
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false)

  const [termsModalOpen, setTermsModalOpen] = useState(false)
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  // Cálculo simples de força da senha
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', percent: 0 }
    let score = 0
    if (password.length >= 6) score += 1
    if (password.length >= 10) score += 1
    if (/[a-zA-Z]/.test(password) && /[0-9]/.test(password)) score += 1
    if (/[^a-zA-Z0-9]/.test(password)) score += 1

    if (score <= 1) return { label: 'Fraca', color: 'bg-red-500', percent: 25 }
    if (score === 2) return { label: 'Razoável', color: 'bg-yellow-500', percent: 50 }
    if (score === 3) return { label: 'Boa', color: 'bg-blue-500', percent: 75 }
    return { label: 'Forte', color: 'bg-green-500', percent: 100 }
  }

  const strength = getPasswordStrength()

  const validate = (): boolean => {
    const newErrors: FormErrors = {}

    // 1. Nome completo
    const trimmedName = name.trim()
    if (!trimmedName) {
      newErrors.name = 'Informe seu nome completo.'
    } else if (trimmedName.length < 2) {
      newErrors.name = 'O nome deve ter pelo menos 2 caracteres.'
    }

    // 2. Email
    const trimmedEmail = email.trim()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!trimmedEmail) {
      newErrors.email = 'Informe seu endereço de e-mail.'
    } else if (!emailRegex.test(trimmedEmail)) {
      newErrors.email = 'Informe um endereço de e-mail válido.'
    }

    // 3. Senha (mínimo 6 caracteres conforme regra atualizada)
    if (!password) {
      newErrors.password = 'Crie uma senha de acesso.'
    } else if (password.length < 6) {
      newErrors.password = 'A senha deve ter no mínimo 6 caracteres.'
    }

    // 4. Confirmação de senha
    if (!passwordConfirm) {
      newErrors.passwordConfirm = 'Confirme sua senha.'
    } else if (password !== passwordConfirm) {
      newErrors.passwordConfirm = 'As senhas não coincidem. Digite a mesma senha nos dois campos.'
    }

    // 5. Checkbox Termos de Uso
    if (!acceptedTerms) {
      newErrors.terms = 'Você deve aceitar os Termos de Uso para prosseguir.'
    }

    // 6. Checkbox Política de Privacidade
    if (!acceptedPrivacy) {
      newErrors.privacy = 'Você deve aceitar a Política de Privacidade para prosseguir.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)
    setErrors({})

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim()

    const { user, error } = await signUp({
      name: cleanName,
      email: cleanEmail,
      password,
      passwordConfirm,
    })

    if (error || !user) {
      setIsLoading(false)
      console.error('Erro de cadastro:', error)
      const err = error as {
        data?: { data?: Record<string, { message?: string; code?: string }> }
        response?: { data?: Record<string, { message?: string; code?: string }> }
        message?: string
      }
      const fieldData = err.data?.data || err.response?.data || {}

      const backendErrors: FormErrors = {}

      if (fieldData.email) {
        backendErrors.email =
          'Já existe uma conta com este e-mail. Verifique os dados ou faça login.'
      }
      if (fieldData.password) {
        backendErrors.password =
          fieldData.password.message || 'Senha inválida (mínimo 6 caracteres).'
      }
      if (fieldData.passwordConfirm) {
        backendErrors.passwordConfirm =
          fieldData.passwordConfirm.message || 'As senhas não coincidem.'
      }
      if (fieldData.name) {
        backendErrors.name = fieldData.name.message || 'Nome inválido.'
      }

      // Se nenhum erro específico de campo foi identificado, fallback
      if (Object.keys(backendErrors).length === 0) {
        const msg = String(err.message || '')
        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('unique')) {
          backendErrors.email =
            'Já existe uma conta com este e-mail. Verifique os dados ou faça login.'
        } else {
          backendErrors.general =
            'Não foi possível concluir o cadastro. Verifique os dados informados e tente novamente.'
        }
      }

      setErrors(backendErrors)
      return
    }

    // Cadastro bem-sucedido com login automático realizado pelo signUp
    // Redirecionamento baseado nas regras:
    // - admin -> /admin/dashboard
    // - participante que já respondeu -> /resultado
    // - participante que nunca respondeu -> /teste (padrão para recém-criado)
    try {
      if (user.admin) {
        navigate('/admin/dashboard')
        return
      }

      const ultimoResultado = await testeService.getUltimoResultado(user.id)
      if (ultimoResultado) {
        navigate('/resultado')
      } else {
        navigate('/teste')
      }
    } catch (routeErr) {
      console.warn('Erro ao verificar histórico no cadastro, indo para /teste:', routeErr)
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
            Crie sua conta
          </CardTitle>
          <CardDescription className="text-sm text-[#2B2621]/70 mt-1 font-sans">
            Descubra seu perfil circadiano no Teste de Cronótipo IC Educ
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {errors.general && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2 animate-fade-in font-sans">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                <span>{errors.general}</span>
              </div>
            )}

            {/* 1. Nome Completo */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="signup-name"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5 text-[#E55320]" />
                Nome Completo
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Ex: Ana Silva"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
                }}
                className={`h-11 rounded-xl text-[#2B2621] transition-colors ${
                  errors.name
                    ? 'border-red-500 focus-visible:ring-red-400 bg-red-50/20'
                    : 'border-[#2B2621]/20 focus-visible:ring-[#E55320]'
                }`}
              />
              {errors.name && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* 2. Endereço de E-mail */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="signup-email"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5 text-[#E55320]" />
                Endereço de E-mail
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }))
                }}
                className={`h-11 rounded-xl text-[#2B2621] transition-colors ${
                  errors.email
                    ? 'border-red-500 focus-visible:ring-red-400 bg-red-50/20'
                    : 'border-[#2B2621]/20 focus-visible:ring-[#E55320]'
                }`}
              />
              {errors.email && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.email}</span>
                </p>
              )}
            </div>

            {/* 3. Senha */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="signup-password"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#E55320]" />
                Senha (mínimo 6 caracteres)
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie sua senha de acesso"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }))
                  }}
                  className={`h-11 pr-10 rounded-xl text-[#2B2621] transition-colors ${
                    errors.password
                      ? 'border-red-500 focus-visible:ring-red-400 bg-red-50/20'
                      : 'border-[#2B2621]/20 focus-visible:ring-[#E55320]'
                  }`}
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
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.password}</span>
                </p>
              )}

              {/* Indicador de força */}
              {password.length > 0 && !errors.password && (
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
                    {password.length < 6 && <span className="text-red-500">Mínimo 6 dígitos</span>}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Confirmação de Senha */}
            <div className="space-y-1.5 font-sans">
              <Label
                htmlFor="signup-password-confirm"
                className="text-xs font-bold text-[#2B2621] flex items-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5 text-[#E55320]" />
                Confirmação de Senha
              </Label>
              <div className="relative">
                <Input
                  id="signup-password-confirm"
                  type={showPasswordConfirm ? 'text' : 'password'}
                  placeholder="Repita sua senha"
                  value={passwordConfirm}
                  onChange={(e) => {
                    setPasswordConfirm(e.target.value)
                    if (errors.passwordConfirm)
                      setErrors((prev) => ({ ...prev, passwordConfirm: undefined }))
                  }}
                  className={`h-11 pr-10 rounded-xl text-[#2B2621] transition-colors ${
                    errors.passwordConfirm
                      ? 'border-red-500 focus-visible:ring-red-400 bg-red-50/20'
                      : 'border-[#2B2621]/20 focus-visible:ring-[#E55320]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2B2621]/50 hover:text-[#2B2621]"
                  aria-label={showPasswordConfirm ? 'Ocultar senha' : 'Exibir senha'}
                >
                  {showPasswordConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {errors.passwordConfirm && (
                <p className="text-xs text-red-600 flex items-center gap-1 font-medium mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.passwordConfirm}</span>
                </p>
              )}
            </div>

            {/* DOIS CHECKBOXES OBRIGATÓRIOS INDEPENDENTES */}
            <div className="pt-2 space-y-3 font-sans">
              {/* Checkbox 1: Termos de Uso */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-[#2B2621] cursor-pointer select-none leading-relaxed">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="checkbox-terms"
                      checked={acceptedTerms}
                      onChange={(e) => {
                        setAcceptedTerms(e.target.checked)
                        if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }))
                      }}
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
                    da plataforma. <span className="text-[#E55320] font-bold">*</span>
                  </span>
                </label>
                {errors.terms && (
                  <p className="text-xs text-red-600 flex items-center gap-1 font-medium pl-6">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.terms}</span>
                  </p>
                )}
              </div>

              {/* Checkbox 2: Política de Privacidade */}
              <div className="space-y-1">
                <label className="flex items-start gap-2.5 text-xs text-[#2B2621] cursor-pointer select-none leading-relaxed">
                  <div className="relative flex items-center mt-0.5">
                    <input
                      type="checkbox"
                      id="checkbox-privacy"
                      checked={acceptedPrivacy}
                      onChange={(e) => {
                        setAcceptedPrivacy(e.target.checked)
                        if (errors.privacy) setErrors((prev) => ({ ...prev, privacy: undefined }))
                      }}
                      className="w-4 h-4 rounded border-[#2B2621]/30 text-[#E55320] focus:ring-[#E55320] cursor-pointer accent-[#E55320]"
                    />
                  </div>
                  <span>
                    Li e aceito a{' '}
                    <button
                      type="button"
                      onClick={() => setPrivacyModalOpen(true)}
                      className="font-bold text-[#E55320] hover:underline"
                    >
                      Política de Privacidade
                    </button>
                    . <span className="text-[#E55320] font-bold">*</span>
                  </span>
                </label>
                {errors.privacy && (
                  <p className="text-xs text-red-600 flex items-center gap-1 font-medium pl-6">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.privacy}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm transition-all mt-4 font-sans"
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
