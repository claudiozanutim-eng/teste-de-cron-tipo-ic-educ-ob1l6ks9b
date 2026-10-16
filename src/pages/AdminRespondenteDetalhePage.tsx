import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { PERFIS_INFO } from '@/types/cronotipo'
import type { ResultadoRecord, RespostaRecord, UserRecord } from '@/types/cronotipo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Award, User, Mail, Shield, Loader2, Clock } from 'lucide-react'

export default function AdminRespondenteDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const { isAdmin } = useAuth()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    user: UserRecord | null
    resultados: ResultadoRecord[]
    respostas: RespostaRecord[]
  }>({
    user: null,
    resultados: [],
    respostas: [],
  })

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }

    if (!id) return

    const carregarDetalhes = async () => {
      setIsLoading(true)
      try {
        const det = await testeService.getDetalhesUsuario(id)
        setData(det)
      } catch (err) {
        console.error('Erro ao carregar detalhes do respondente:', err)
      } finally {
        setIsLoading(false)
      }
    }

    carregarDetalhes()
  }, [id, isAdmin, navigate])

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin" />
        <p className="text-sm font-semibold text-[#636E72]">
          Carregando histórico do participante...
        </p>
      </div>
    )
  }

  if (!data.user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
        <p className="text-[#636E72]">Respondente não encontrado.</p>
        <Link to="/admin/dashboard">
          <Button variant="outline" className="rounded-full">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Dashboard
          </Button>
        </Link>
      </div>
    )
  }

  const { user, resultados, respostas } = data
  const dataCadastroFormatada = new Date(user.created).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Agrupa respostas por parte
  const respostasParte1 = respostas.filter((r) => r.parte === '1')
  const respostasParte2 = respostas.filter((r) => r.parte === '2')

  return (
    <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 max-w-full">
      {/* Botão Voltar */}
      <div className="flex items-center justify-between">
        <Link to="/admin/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs font-semibold text-[#6C5CE7] hover:bg-[#EDE9FE]"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Voltar à Lista de Respondentes
          </Button>
        </Link>
      </div>

      {/* Card de Informações do Participante */}
      <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="h-2 bg-[#6C5CE7]" />
        <CardContent className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#EDE9FE] text-[#6C5CE7] flex items-center justify-center text-2xl font-black shrink-0 shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#2D3436]">
                  {user.name || 'Nome não preenchido'}
                </h1>
                {user.admin && (
                  <span className="px-2 py-0.5 rounded-full bg-[#EDE9FE] text-[#6C5CE7] text-[10px] font-black uppercase flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-xs text-[#636E72]">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Cadastrado em {dataCadastroFormatada}
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#636E72] block">
              Total de Tentativas
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#6C5CE7]">
              {resultados.length}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Tentativas */}
      <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg font-bold text-[#2D3436]">
            Histórico de Resultados
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#636E72]">
            Todas as classificações salvas para este participante
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {resultados.length === 0 ? (
            <p className="text-xs sm:text-sm text-[#636E72] py-4 text-center">
              Nenhum teste foi concluído por este participante até o momento.
            </p>
          ) : (
            resultados.map((res, index) => {
              const info = PERFIS_INFO[res.perfil]
              const dataFormatada = new Date(res.created).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })

              return (
                <div
                  key={res.id}
                  className="p-4 sm:p-5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  style={{ borderColor: info.cor, backgroundColor: `${info.cor}08` }}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: `${info.cor}20` }}
                    >
                      {info.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-black" style={{ color: info.cor }}>
                          {res.perfil}
                        </span>
                        {index === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#6C5CE7] text-white text-[10px] font-bold">
                            Atual
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#636E72] flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {dataFormatada}
                      </p>
                    </div>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-xs font-bold text-[#2D3436] block">
                      {res.via_parte1
                        ? 'Classificação Direta (Parte 1: 7+ Verdadeiros)'
                        : `Pontuação: ${res.pontuacao} pontos (Parte 2)`}
                    </span>
                    <span className="text-[11px] text-[#636E72]">ID: #{res.id.slice(0, 8)}</span>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      {/* Respostas Detalhadas da Parte 1 e Parte 2 */}
      {respostas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Parte 1 */}
          <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#2D3436]">
                Respostas — Parte 1 ({respostasParte1.length} afirm.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {respostasParte1.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-[#F7F5FF] border border-[#E0DEE8]/60 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-[#2D3436]">
                      Afirmação #{r.pergunta_numero}
                    </span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-full ${
                        r.resposta === 'Verdadeiro'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {r.resposta}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Parte 2 */}
          <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold text-[#2D3436]">
                Respostas — Parte 2 ({respostasParte2.length} perg.)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {respostasParte2.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl bg-[#F7F5FF] border border-[#E0DEE8]/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#6C5CE7]">
                        Pergunta #{r.pergunta_numero}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white border border-[#E0DEE8] font-bold text-[11px] text-[#2D3436]">
                        Peso: {r.peso}
                      </span>
                    </div>
                    <p className="text-[#2D3436] font-medium leading-snug">"{r.resposta}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
