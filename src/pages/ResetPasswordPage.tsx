import React, { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Loader2, Lock, CheckCircle2, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const { confirmPasswordReset } = useAuth()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!token) {
      setErrorMessage('Token de redefinição inválido ou expirado. Solicite um novo link.')
      return
    }

    if (password.length < 8) {
      setErrorMessage('A senha deve ter no mínimo 8 caracteres.')
      return
    }

    if (password !== passwordConfirm) {
      setErrorMessage('As senhas digitadas não coincidem.')
      return
    }

    setIsLoading(true)
    const { error } = await confirmPasswordReset(token, password)
    setIsLoading(false)

    if (error) {
      console.error('Erro ao redefinir senha:', error)
      setErrorMessage('Não foi possível redefinir sua senha. O link pode ter expirado.')
      return
    }

    setSuccess(true)
  }

  return (
    <div className="flex-1 flex items-center justify-center py-6 px-2">
      <Card className="w-full max-w-md border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden">
        <div className="h-2 bg-[#6C5CE7]" />

        <CardHeader className="text-center pt-6 pb-4">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-[#EDE9FE] flex items-center justify-center mb-3">
            <Lock className="w-6 h-6 text-[#6C5CE7]" />
          </div>
          <CardTitle className="text-2xl font-black text-[#2D3436]">Nova Senha</CardTitle>
          <CardDescription className="text-sm text-[#636E72]">
            Digite sua nova senha de acesso
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-2 pb-6 px-6 sm:px-8">
          {success ? (
            <div className="space-y-5 text-center animate-fade-in py-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-base text-[#2D3436]">
                  Senha atualizada com sucesso!
                </h3>
                <p className="text-xs sm:text-sm text-[#636E72] leading-relaxed">
                  Sua nova senha foi salva. Agora você pode entrar com sua nova credencial.
                </p>
              </div>
              <Button
                onClick={() =>
                  navigate('/login', {
                    state: { message: 'Senha atualizada! Faça login com a nova senha.' },
                  })
                }
                className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full"
              >
                Ir para o Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {(!token || errorMessage) && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                  <span>
                    {!token
                      ? 'Nenhum token encontrado na URL. Verifique o link recebido por e-mail.'
                      : errorMessage}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-xs font-bold text-[#2D3436]">
                  Nova Senha (mín. 8 caracteres)
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo de 8 caracteres"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-xs font-bold text-[#2D3436]">
                  Confirme a Nova Senha
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repita a nova senha"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  required
                  className="h-11 rounded-xl border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading || !token}
                className="w-full h-11 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(108,92,231,0.25)] transition-all mt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando nova senha...
                  </>
                ) : (
                  'Redefinir senha'
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link to="/login" className="text-xs font-semibold text-[#6C5CE7] hover:underline">
                  Lembrou sua senha? Fazer login
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
