import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { PERFIS_INFO } from '@/types/cronotipo'
import type { PerfilCronotipo, ResultadoRecord, UserRecord } from '@/types/cronotipo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Users,
  CheckSquare,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Shield,
  Eye,
  Loader2,
  RefreshCw,
  LogOut,
} from 'lucide-react'

interface RespondenteItem {
  id: string
  nome: string
  email: string
  perfil: PerfilCronotipo | '-'
  pontuacao: number | '-'
  dataTeste: string
  dataRaw: string
  viaParte1: boolean
  totalTentativas: number
  userId: string
}

export default function AdminDashboardPage() {
  const { user, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [estatisticas, setEstatisticas] = useState<{
    totalTentativas: number
    totalUsuarios: number
    respondentesUnicos: number
    contagemPorPerfil: Record<PerfilCronotipo, number>
    percentualPorPerfil: Record<PerfilCronotipo, number>
    resultados: ResultadoRecord[]
    users: UserRecord[]
  }>({
    totalTentativas: 0,
    totalUsuarios: 0,
    respondentesUnicos: 0,
    contagemPorPerfil: { Golfinho: 0, Leão: 0, Urso: 0, Lobo: 0 },
    percentualPorPerfil: { Golfinho: 0, Leão: 0, Urso: 0, Lobo: 0 },
    resultados: [],
    users: [],
  })

  // Carrega os dados
  const carregarDados = async () => {
    try {
      const stats = await testeService.getAdminEstatisticas()
      setEstatisticas(stats)
    } catch (err) {
      console.error('Erro ao carregar métricas admin:', err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    if (!isAdmin) {
      navigate('/admin/login')
      return
    }
    carregarDados()
  }, [isAdmin, navigate])

  const handleRefresh = () => {
    setIsRefreshing(true)
    carregarDados()
  }

  const handleSignOutAdmin = () => {
    signOut()
    navigate('/admin/login')
  }

  // Mapeia usuários para lista de respondentes da tabela
  const listaRespondentes = useMemo<RespondenteItem[]>(() => {
    const resultadosPorUser = new Map<string, ResultadoRecord[]>()
    estatisticas.resultados.forEach((r) => {
      const list = resultadosPorUser.get(r.usuario) || []
      list.push(r)
      resultadosPorUser.set(r.usuario, list)
    })

    return estatisticas.users.map((u) => {
      const userRes = resultadosPorUser.get(u.id) || []
      const ultimo = userRes[0] || null

      return {
        id: u.id,
        nome: u.name || 'Sem nome cadastrado',
        email: u.email,
        perfil: ultimo ? ultimo.perfil : u.ultimo_perfil || '-',
        pontuacao: ultimo ? ultimo.pontuacao : '-',
        dataTeste: ultimo
          ? new Date(ultimo.created).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })
          : '-',
        dataRaw: ultimo ? ultimo.created : u.created,
        viaParte1: ultimo ? ultimo.via_parte1 : false,
        totalTentativas: userRes.length,
        userId: u.id,
      }
    })
  }, [estatisticas.users, estatisticas.resultados])

  // Filtro de busca por nome ou email em tempo real
  const respondentesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return listaRespondentes
    const termo = searchTerm.toLowerCase().trim()
    return listaRespondentes.filter(
      (r) => r.nome.toLowerCase().includes(termo) || r.email.toLowerCase().includes(termo),
    )
  }, [listaRespondentes, searchTerm])

  // Paginação 10 por página
  const totalPages = Math.ceil(respondentesFiltrados.length / pageSize) || 1
  const paginatedRespondentes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return respondentesFiltrados.slice(start, start + pageSize)
  }, [respondentesFiltrados, currentPage])

  // Exportar dados em CSV com delimitador ponto e vírgula e BOM UTF-8
  const exportarCSV = () => {
    // Cabeçalho especificado: nome;email;perfil;pontuacao;data_teste;via_parte1
    const headers = ['nome', 'email', 'perfil', 'pontuacao', 'data_teste', 'via_parte1']

    const userMap = new Map<string, UserRecord>()
    estatisticas.users.forEach((u) => userMap.set(u.id, u))

    const rows: string[][] = estatisticas.resultados.map((r) => {
      const u = userMap.get(r.usuario)
      const dataFormatada = r.created ? r.created.substring(0, 10) : ''
      return [
        `"${(u?.name || 'Participante').replace(/"/g, '""')}"`,
        `"${(u?.email || '').replace(/"/g, '""')}"`,
        `"${r.perfil}"`,
        `${r.pontuacao}`,
        `"${dataFormatada}"`,
        r.via_parte1 ? '"sim"' : '"não"',
      ]
    })

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n')

    // BOM UTF-8 para correta acentuação no Excel
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `cronotipos_iceduc_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin" />
        <p className="text-sm font-semibold text-[#636E72]">Carregando painel analítico...</p>
      </div>
    )
  }

  const perfisOrdem: PerfilCronotipo[] = ['Golfinho', 'Leão', 'Urso', 'Lobo']

  return (
    <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 max-w-full">
      {/* Topo do Painel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E0DEE8] shadow-[0_2px_8px_rgba(108,92,231,0.04)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center text-[#6C5CE7] shrink-0 font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#2D3436] tracking-tight">
              Painel do Administrador
            </h1>
            <p className="text-xs sm:text-sm text-[#636E72]">
              Gestão de participantes e métricas de cronótipo IC Educ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full text-xs font-semibold border-[#E0DEE8]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            onClick={exportarCSV}
            size="sm"
            className="bg-[#27AE60] hover:bg-[#219653] text-white font-bold rounded-full text-xs shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar CSV
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOutAdmin}
            className="rounded-full text-xs font-semibold text-[#E74C3C] hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sair
          </Button>
        </div>
      </div>

      {/* Cartões de Métricas no Topo */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Usuários Cadastrados */}
        <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#636E72]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Respondentes</span>
              <Users className="w-4 h-4 text-[#6C5CE7]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2D3436]">
                {estatisticas.totalUsuarios}
              </span>
              <span className="text-[10px] text-[#636E72] block mt-0.5">cadastrados</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Tentativas Realizadas */}
        <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#636E72]">
              <span className="text-[11px] font-bold uppercase tracking-wider">Testes Feitos</span>
              <CheckSquare className="w-4 h-4 text-[#6C5CE7]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#2D3436]">
                {estatisticas.totalTentativas}
              </span>
              <span className="text-[10px] text-[#636E72] block mt-0.5">tentativas totais</span>
            </div>
          </CardContent>
        </Card>

        {/* 4 Mini-cards coloridos por perfil */}
        {perfisOrdem.map((p) => {
          const info = PERFIS_INFO[p]
          const qtd = estatisticas.contagemPorPerfil[p] || 0
          const pct = estatisticas.percentualPorPerfil[p] || 0

          return (
            <Card
              key={p}
              className="border rounded-2xl bg-white shadow-sm hover:shadow-md transition-all"
              style={{ borderTop: `4px solid ${info.cor}` }}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#636E72]">
                    {p}
                  </span>
                  <span className="text-lg">{info.emoji}</span>
                </div>
                <div className="mt-2">
                  <span className="text-2xl sm:text-3xl font-black" style={{ color: info.cor }}>
                    {qtd}
                  </span>
                  <span className="text-[11px] font-semibold text-[#636E72] block mt-0.5">
                    {pct}% do total
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráfico de Barras Horizontais (HTML/CSS Puro) */}
      <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base sm:text-lg font-bold text-[#2D3436]">
            Distribuição Percentual dos Cronótipos
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-[#636E72]">
            Proporção de perfis biológicos entre todas as tentativas registradas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          {perfisOrdem.map((perfil) => {
            const info = PERFIS_INFO[perfil]
            const qtd = estatisticas.contagemPorPerfil[perfil] || 0
            const pct = estatisticas.percentualPorPerfil[perfil] || 0

            return (
              <div key={perfil} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span className="font-bold text-[#2D3436]">{perfil}</span>
                    <span className="text-xs text-[#636E72]">
                      ({qtd} {qtd === 1 ? 'teste' : 'testes'})
                    </span>
                  </div>
                  <span className="font-black" style={{ color: info.cor }}>
                    {pct}%
                  </span>
                </div>

                {/* Barra com animação de preenchimento */}
                <div className="h-4 w-full bg-[#F7F5FF] rounded-full overflow-hidden p-0.5 border border-[#E0DEE8]/70">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${Math.max(pct, 2)}%`,
                      backgroundColor: info.cor,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Tabela de Respondentes com Busca e Paginação */}
      <Card className="border border-[#E0DEE8] rounded-2xl bg-white shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b border-[#E0DEE8]/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-bold text-[#2D3436]">
                Lista de Respondentes
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#636E72]">
                Total de {respondentesFiltrados.length} participante(s) encontrado(s)
              </CardDescription>
            </div>

            {/* Campo de Busca em Tempo Real */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 h-10 text-xs sm:text-sm rounded-full border-[#E0DEE8] focus-visible:ring-[#6C5CE7]"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF9FF] text-[#636E72] font-bold border-b border-[#E0DEE8] uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Data do Teste</th>
                  <th className="py-3 px-4">Status / Tentativas</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0DEE8]/70">
                {paginatedRespondentes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#636E72]">
                      Nenhum respondente encontrado.
                    </td>
                  </tr>
                ) : (
                  paginatedRespondentes.map((resp) => {
                    const info = resp.perfil !== '-' ? PERFIS_INFO[resp.perfil] : null

                    return (
                      <tr key={resp.id} className="hover:bg-[#F7F5FF]/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#2D3436]">{resp.nome}</td>
                        <td className="py-3.5 px-4 text-[#636E72]">{resp.email}</td>
                        <td className="py-3.5 px-4">
                          {info ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: `${info.cor}18`,
                                color: info.cor,
                              }}
                            >
                              <span>{info.emoji}</span>
                              <span>{resp.perfil}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 font-medium">Pendente</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-[#636E72]">{resp.dataTeste}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold bg-gray-100 text-[#2D3436]">
                            {resp.totalTentativas > 0
                              ? `${resp.totalTentativas} tentativa(s)`
                              : 'Não realizou'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Link to={`/admin/respondentes/${resp.userId}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs font-semibold text-[#6C5CE7] hover:bg-[#EDE9FE] rounded-full px-3"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" />
                              Detalhes
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between p-4 border-t border-[#E0DEE8] text-xs text-[#636E72]">
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="h-8 rounded-full border-[#E0DEE8]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-8 rounded-full border-[#E0DEE8]"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
