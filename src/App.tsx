import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'
import Layout from './components/Layout'
import { ProtectedRoute, AdminRoute } from './components/RouteGuards'

// Páginas Reais
import RootIndexRedirect from './pages/RootIndexRedirect'
import SignupPage from './pages/SignupPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import TesteParte1Page from './pages/TesteParte1Page'
import TesteParte2Page from './pages/TesteParte2Page'
import ResultadoPage from './pages/ResultadoPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminRespondenteDetalhePage from './pages/AdminRespondenteDetalhePage'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          {/* Rotas Públicas Admin (sem layout padrão) */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Rotas com Layout Geral */}
          <Route element={<Layout />}>
            {/* Raiz com redirecionamento inteligente */}
            <Route path="/" element={<RootIndexRedirect />} />

            {/* Rotas Públicas */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />

            {/* Rotas Protegidas do Participante */}
            <Route
              path="/teste"
              element={
                <ProtectedRoute>
                  <TesteParte1Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/teste/parte2"
              element={
                <ProtectedRoute>
                  <TesteParte2Page />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resultado"
              element={
                <ProtectedRoute>
                  <ResultadoPage />
                </ProtectedRoute>
              }
            />

            {/* Rotas Protegidas do Painel Admin */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/respondentes/:id"
              element={
                <AdminRoute>
                  <AdminRespondenteDetalhePage />
                </AdminRoute>
              }
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
