import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LegalModals } from './LegalModals'
import { LogOut, User as UserIcon, Shield } from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

export default function Layout() {
  const { user, isAuthenticated, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [termsOpen, setTermsOpen] = useState(false)
  const [privacyOpen, setPrivacyOpen] = useState(false)

  // Ocultar header em rotas admin (login admin tem tela minimalista)
  const isAdminLogin = location.pathname === '/admin/login'
  const isPublicAuthRoute = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
  ].includes(location.pathname)

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF7F1] text-[#2B2621] font-sans">
      {/* Header Compacto (~56px) */}
      {!isAdminLogin && (
        <header className="sticky top-0 z-40 h-14 bg-[#FAF7F1]/95 backdrop-blur-sm border-b border-[#2B2621]/10 px-4 sm:px-6">
          <div className="max-w-[960px] mx-auto h-full flex items-center justify-between">
            {/* Logo Oficial IC Educ e Nome */}
            <Link
              to={isAuthenticated ? '/teste' : '/login'}
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
            >
              <img
                src={icLogo}
                alt="Logo IC Educ"
                className="w-9 h-9 object-contain rounded-full shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-fraunces font-bold text-[17px] leading-tight text-[#2B2621] tracking-tight group-hover:text-[#E55320] transition-colors">
                  IC Educ
                </span>
                <span className="text-[11px] font-semibold text-[#2B2621]/70 leading-none">
                  Teste de Cronótipo
                </span>
              </div>
            </Link>

            {/* Ações da direita */}
            <div className="flex items-center gap-2 sm:gap-3">
              {isAdmin && !location.pathname.startsWith('/admin') && (
                <Link to="/admin/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-[#2B2621] hover:text-[#E55320] hover:bg-[#2B2621]/5 rounded-full px-2.5 sm:px-3"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1 text-[#E55320]" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </Button>
                </Link>
              )}

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-white rounded-full border border-[#2B2621]/15 text-xs font-medium text-[#2B2621] shadow-sm">
                    <div className="w-5 h-5 rounded-full bg-[#2B2621] text-[#FAF7F1] flex items-center justify-center text-[10px] font-bold">
                      {user.name ? (
                        user.name.charAt(0).toUpperCase()
                      ) : (
                        <UserIcon className="w-3 h-3" />
                      )}
                    </div>
                    <span className="max-w-[120px] truncate font-semibold">
                      {user.name?.split(' ')[0] || user.email.split('@')[0]}
                    </span>
                    {user.ultimo_perfil && (
                      <span className="bg-[#FAF7F1] px-2 py-0.5 rounded-full text-[10px] font-bold text-[#E55320] border border-[#E55320]/30 font-fraunces">
                        {user.ultimo_perfil}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-[#2B2621]/70 hover:bg-red-50 hover:text-red-700 rounded-full px-2.5 sm:px-3"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-1 sm:mr-1.5" />
                    <span>Sair</span>
                  </Button>
                </div>
              ) : (
                !isPublicAuthRoute && (
                  <Link to="/login">
                    <Button
                      size="sm"
                      className="h-8 text-xs font-bold bg-[#E55320] hover:bg-[#c94517] text-white rounded-full px-4 shadow-sm"
                    >
                      Entrar
                    </Button>
                  </Link>
                )
              )}
            </div>
          </div>
        </header>
      )}

      {/* Área Principal (Container max 960px) */}
      <main className="flex-1 w-full max-w-[960px] mx-auto px-4 sm:px-6 py-4 sm:py-8 flex flex-col">
        <Outlet />
      </main>

      {/* Rodapé Somente em Telas Públicas */}
      {isPublicAuthRoute && (
        <footer className="w-full border-t border-[#2B2621]/10 bg-[#FAF7F1] py-5 px-4 sm:px-6 text-center text-xs text-[#2B2621]/70">
          <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-bold text-[#2B2621]">
              <img src={icLogo} alt="IC Educ" className="w-4 h-4 rounded-full" />
              <span>IC Educ • Teste de Cronótipo</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="hover:text-[#E55320] hover:underline transition-colors font-medium text-[#2B2621]/80"
              >
                Termos de Uso
              </button>
              <span className="text-[#2B2621]/20">•</span>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-[#E55320] hover:underline transition-colors font-medium text-[#2B2621]/80"
              >
                Privacidade
              </button>
            </div>

            <div>© IC Educ — Todos os direitos reservados</div>
          </div>
        </footer>
      )}

      {/* Modais Legais Reutilizáveis */}
      <LegalModals
        termsOpen={termsOpen}
        privacyOpen={privacyOpen}
        onTermsChange={setTermsOpen}
        onPrivacyChange={setPrivacyOpen}
      />
    </div>
  )
}
