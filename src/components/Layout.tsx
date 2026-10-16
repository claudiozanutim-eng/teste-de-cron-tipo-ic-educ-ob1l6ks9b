import React, { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LegalModals } from './LegalModals'
import { LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react'

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
    <div className="flex flex-col min-h-screen bg-[#F7F5FF] text-[#2D3436]">
      {/* Header Compacto (~56px) */}
      {!isAdminLogin && (
        <header className="sticky top-0 z-40 h-14 bg-white/95 backdrop-blur-sm border-b border-[#E0DEE8] shadow-[0_2px_8px_rgba(108,92,231,0.04)] px-4 sm:px-6">
          <div className="max-w-[960px] mx-auto h-full flex items-center justify-between">
            {/* Logo e Nome IC Educ */}
            <Link
              to={isAuthenticated ? '/teste' : '/login'}
              className="flex items-center gap-2.5 group transition-transform hover:scale-[1.01]"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#6C5CE7] to-[#8E44AD] flex items-center justify-center text-white font-black text-sm shadow-[0_2px_8px_rgba(108,92,231,0.3)]">
                IC
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-[15px] leading-tight text-[#2D3436] tracking-tight group-hover:text-[#6C5CE7] transition-colors">
                  IC Educ
                </span>
                <span className="text-[11px] font-semibold text-[#6C5CE7] leading-none">
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
                    className="h-8 text-xs font-semibold text-[#6C5CE7] hover:bg-[#EDE9FE] rounded-full px-2.5 sm:px-3"
                  >
                    <Shield className="w-3.5 h-3.5 mr-1" />
                    <span className="hidden sm:inline">Painel Admin</span>
                  </Button>
                </Link>
              )}

              {isAuthenticated && user ? (
                <div className="flex items-center gap-2">
                  <div className="hidden sm:flex items-center gap-2 pl-2 pr-3 py-1 bg-[#F7F5FF] rounded-full border border-[#E0DEE8]/60 text-xs font-medium text-[#2D3436]">
                    <div className="w-5 h-5 rounded-full bg-[#6C5CE7] text-white flex items-center justify-center text-[10px] font-bold">
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
                      <span className="bg-white px-2 py-0.5 rounded-full text-[10px] font-bold text-[#6C5CE7] border border-[#E0DEE8]">
                        {user.ultimo_perfil}
                      </span>
                    )}
                  </div>

                  <Button
                    onClick={handleSignOut}
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-semibold text-[#E74C3C] hover:bg-red-50 hover:text-red-700 rounded-full px-2.5 sm:px-3"
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
                      className="h-8 text-xs font-bold bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white rounded-full px-4 shadow-[0_2px_8px_rgba(108,92,231,0.2)]"
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
        <footer className="w-full border-t border-[#E0DEE8] bg-white py-5 px-4 sm:px-6 text-center text-xs text-[#636E72]">
          <div className="max-w-[960px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 font-bold text-[#2D3436]">
              <Sparkles className="w-3.5 h-3.5 text-[#6C5CE7]" />
              <span>IC Educ • Teste de Cronótipo</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setTermsOpen(true)}
                className="hover:text-[#6C5CE7] hover:underline transition-colors font-medium"
              >
                Termos de Uso
              </button>
              <span className="text-gray-300">•</span>
              <button
                type="button"
                onClick={() => setPrivacyOpen(true)}
                className="hover:text-[#6C5CE7] hover:underline transition-colors font-medium"
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
