import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { PERFIS_INFO } from '@/types/cronotipo'
import type { ResultadoRecord } from '@/types/cronotipo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { gerarRelatorioPDF } from '@/lib/pdfGenerator'
import {
  Download,
  RotateCcw,
  Calendar,
  Award,
  Sparkles,
  CheckCircle,
  Lightbulb,
  Mail,
  Loader2,
} from 'lucide-react'

export default function ResultadoPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [resultado, setResultado] = useState<ResultadoRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [modalRefazerOpen, setModalRefazerOpen] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  // Verifica se veio de um redirecionamento imediato do quiz
  const stateResultadoId = (location.state as { resultadoId?: string })?.resultadoId

  useEffect(() => {
    let isMounted = true

    const carregarResultado = async () => {
      setIsLoading(true)
      if (stateResultadoId) {
        const res = await testeService.getResultadoPorId(stateResultadoId)
        if (isMounted && res) {
          setResultado(res)
          setIsLoading(false)
          return
        }
      }

      if (user) {
        const res = await testeService.getUltimoResultado(user.id)
        if (isMounted) {
          setResultado(res)
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }

    carregarResultado()

    return () => {
      isMounted = false
    }
  }, [user, stateResultadoId])

  const handleRefazer = () => {
    setModalRefazerOpen(false)
    sessionStorage.removeItem('respostas_parte1_ids')
    navigate('/teste')
  }

  const handleDownloadPdf = () => {
    if (!resultado) return
    setIsDownloadingPdf(true)
    try {
      gerarRelatorioPDF(resultado, user)
    } finally {
      setTimeout(() => setIsDownloadingPdf(false), 1000)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin" />
        <p className="text-sm font-semibold text-[#636E72]">Carregando seu resultado...</p>
      </div>
    )
  }

  if (!resultado) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center max-w-md mx-auto space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-[#EDE9FE] flex items-center justify-center text-[#6C5CE7]">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-[#2D3436]">Você ainda não realizou o teste</h2>
        <p className="text-sm text-[#636E72]">
          Responda às perguntas para descobrir o seu cronótipo biológico e desbloquear seu
          relatório.
        </p>
        <Link to="/teste">
          <Button className="h-11 px-6 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full">
            Iniciar Teste Agora
          </Button>
        </Link>
      </div>
    )
  }

  const perfilDetalhes = PERFIS_INFO[resultado.perfil] || PERFIS_INFO.Golfinho
  const dataTesteFormatada = new Date(resultado.created).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-4 sm:py-8 space-y-6 sm:space-y-8 animate-fade-in">
      {/* Banner de Parabéns com Aviso de Email */}
      <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-[#E0DEE8] shadow-[0_2px_8px_rgba(108,92,231,0.06)] text-xs sm:text-sm text-[#2D3436]">
        <div className="w-8 h-8 rounded-full bg-[#EDE9FE] text-[#6C5CE7] flex items-center justify-center shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-[#6C5CE7]">Resultado enviado por e-mail!</span> Uma cópia
          deste relatório foi enviada automaticamente para seu e-mail cadastrado.
        </div>
      </div>

      {/* Card Grande do Perfil com Cor Própria */}
      <Card
        className="border-2 shadow-[0_12px_40px_rgba(108,92,231,0.12)] rounded-3xl bg-white overflow-hidden transition-all duration-300"
        style={{ borderColor: perfilDetalhes.cor }}
      >
        {/* Faixa Superior Colorida */}
        <div className="h-3 w-full" style={{ backgroundColor: perfilDetalhes.cor }} />

        <CardContent className="p-6 sm:p-10 space-y-8">
          {/* Topo: Avatar Circular Grande + Nome e Tagline */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-6">
            <div
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-inner border-4 shrink-0 animate-pulse-subtle"
              style={{
                backgroundColor: `${perfilDetalhes.cor}15`,
                borderColor: perfilDetalhes.cor,
              }}
            >
              {perfilDetalhes.emoji}
            </div>

            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-black uppercase tracking-wider text-[#636E72]">
                Seu Cronótipo Biológico
              </span>
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight"
                style={{ color: perfilDetalhes.cor }}
              >
                {perfilDetalhes.perfil}
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#636E72]">
                {perfilDetalhes.tagline}
              </p>
            </div>
          </div>

          {/* Mini-Card de Resumo: Nome, Data, Pontuação */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-[#F7F5FF] border border-[#E0DEE8]">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#636E72]">
                Participante
              </span>
              <p className="text-sm font-bold text-[#2D3436] truncate">
                {user?.name || user?.email?.split('@')[0] || 'Participante'}
              </p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#636E72] flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#6C5CE7]" />
                Data da Avaliação
              </span>
              <p className="text-sm font-bold text-[#2D3436]">{dataTesteFormatada}</p>
            </div>

            <div className="space-y-0.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#636E72] flex items-center gap-1">
                <Award className="w-3 h-3 text-[#6C5CE7]" />
                Classificação
              </span>
              <p className="text-sm font-bold text-[#2D3436]">
                {resultado.via_parte1
                  ? 'Parte 1 (7+ Matinais)'
                  : `${resultado.pontuacao} pts (Parte 2)`}
              </p>
            </div>
          </div>

          {/* Descrição Rica do Perfil */}
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-[#2D3436] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
              Como seu corpo funciona:
            </h3>
            <p className="text-sm sm:text-base text-[#2D3436] leading-relaxed bg-[#FAF9FF] p-5 rounded-2xl border border-[#E0DEE8]/60">
              {perfilDetalhes.descricao}
            </p>
          </div>

          {/* Pontos Chave */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-[#2D3436] uppercase tracking-wider">
              Características Marcantes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {perfilDetalhes.pontosChave.map((pt, i) => (
                <div
                  key={i}
                  className="flex items-start gap-2 p-3 rounded-xl bg-white border border-[#E0DEE8] text-xs sm:text-sm font-medium text-[#2D3436]"
                >
                  <CheckCircle className="w-4 h-4 text-[#27AE60] shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dica da IC Educ */}
          <div className="p-4 rounded-2xl bg-[#EDE9FE]/70 border border-[#6C5CE7]/30 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#6C5CE7] text-white flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-1 text-xs sm:text-sm">
              <h5 className="font-bold text-[#5A4BD1]">Recomendação Prática IC Educ</h5>
              <p className="text-[#2D3436]">{perfilDetalhes.dicaRotina}</p>
            </div>
          </div>

          {/* Botões de Ação: Baixar PDF e Refazer Teste */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#E0DEE8]">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalRefazerOpen(true)}
              className="w-full sm:w-auto h-12 px-6 rounded-full border-[#E0DEE8] text-[#636E72] hover:text-[#E74C3C] hover:border-[#E74C3C] font-semibold text-sm transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refazer o Teste
            </Button>

            <Button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className="w-full sm:w-auto h-12 px-8 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_16px_rgba(108,92,231,0.25)] hover:shadow-[0_6px_24px_rgba(108,92,231,0.35)] transition-all text-sm"
            >
              {isDownloadingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Baixar Relatório em PDF
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmação para Refazer o Teste */}
      <Dialog open={modalRefazerOpen} onOpenChange={setModalRefazerOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-[#2D3436]">
              Refazer o teste de cronótipo?
            </DialogTitle>
            <DialogDescription className="text-sm text-[#636E72] pt-2">
              Deseja refazer o teste? Seu resultado anterior será substituído como perfil atual, mas
              seu histórico de tentativas continuará registrado.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setModalRefazerOpen(false)}
              className="rounded-full font-semibold"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRefazer}
              className="bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full"
            >
              Sim, refazer teste
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
