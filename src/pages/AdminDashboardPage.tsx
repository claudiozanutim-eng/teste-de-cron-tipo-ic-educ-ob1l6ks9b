import React, { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { testeService } from '@/services/testeService'
import { PERFIS_INFO } from '@/types/cronotipo'
import type { PerfilCronotipo, ResultadoRecord, UserRecord, TurmaRecord } from '@/types/cronotipo'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Users,
  CheckSquare,
  Download,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader2,
  RefreshCw,
  LogOut,
  Calendar,
  Filter,
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  X,
  AlertTriangle,
} from 'lucide-react'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'
import { toast } from '@/hooks/use-toast'

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
  turmaId?: string
  turmaNome: string
}

export default function AdminDashboardPage() {
  const { isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Estado dos dados brutos
  const [resultados, setResultados] = useState<ResultadoRecord[]>([])
  const [users, setUsers] = useState<UserRecord[]>([])
  const [turmas, setTurmas] = useState<TurmaRecord[]>([])

  // Filtros Globais
  const [filtroTurma, setFiltroTurma] = useState<string>('todas')
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('')
  const [filtroDataFim, setFiltroDataFim] = useState<string>('')

  // Tabela de Respondentes: Busca e Paginação
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  // Modais de Turma
  const [modalTurmaOpen, setModalTurmaOpen] = useState(false)
  const [turmaEmEdicao, setTurmaEmEdicao] = useState<TurmaRecord | null>(null)
  const [turmaNomeInput, setTurmaNomeInput] = useState('')
  const [turmaDataInput, setTurmaDataInput] = useState('')
  const [isSavingTurma, setIsSavingTurma] = useState(false)

  const [dialogExcluirTurmaOpen, setDialogExcluirTurmaOpen] = useState(false)
  const [turmaParaExcluir, setTurmaParaExcluir] = useState<TurmaRecord | null>(null)
  const [isDeletingTurma, setIsDeletingTurma] = useState(false)

  // Modais de Usuário / Participante
  const [modalUsuarioOpen, setModalUsuarioOpen] = useState(false)
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<UserRecord | null>(null)
  const [userNomeInput, setUserNomeInput] = useState('')
  const [userEmailInput, setUserEmailInput] = useState('')
  const [userPasswordInput, setUserPasswordInput] = useState('')
  const [userTurmaInput, setUserTurmaInput] = useState<string>('nenhuma')
  const [isSavingUser, setIsSavingUser] = useState(false)

  const [dialogExcluirUserOpen, setDialogExcluirUserOpen] = useState(false)
  const [userParaExcluir, setUserParaExcluir] = useState<UserRecord | null>(null)
  const [isDeletingUser, setIsDeletingUser] = useState(false)

  // Carrega dados completos
  const carregarDados = async () => {
    try {
      const stats = await testeService.getAdminEstatisticas()
      setResultados(stats.resultados)
      setUsers(stats.users)
      setTurmas(stats.turmas || [])
    } catch (err) {
      console.error('Erro ao carregar métricas admin:', err)
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados atualizados.',
        variant: 'destructive',
      })
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

  // Mapa de Turmas para acesso rápido por ID
  const mapTurmas = useMemo(() => {
    const map = new Map<string, TurmaRecord>()
    turmas.forEach((t) => map.set(t.id, t))
    return map
  }, [turmas])

  // Filtragem dos RESULTADOS com base nos filtros de data e turma
  const resultadosFiltrados = useMemo(() => {
    return resultados.filter((r) => {
      // 1. Filtro de turma (baseado na turma do resultado ou do usuário)
      if (filtroTurma !== 'todas') {
        const turmaIdResultado = r.turma || (r.expand?.usuario?.turma ?? undefined)
        // Se o resultado não tem turma gravada, checar o user na lista geral
        let turmaFinal = turmaIdResultado
        if (!turmaFinal) {
          const u = users.find((usr) => usr.id === r.usuario)
          turmaFinal = u?.turma
        }
        if (turmaFinal !== filtroTurma) return false
      }

      // 2. Filtro de data de início (YYYY-MM-DD)
      if (filtroDataInicio) {
        const dataRes = r.created ? r.created.slice(0, 10) : ''
        if (dataRes < filtroDataInicio) return false
      }

      // 3. Filtro de data fim (YYYY-MM-DD)
      if (filtroDataFim) {
        const dataRes = r.created ? r.created.slice(0, 10) : ''
        if (dataRes > filtroDataFim) return false
      }

      return true
    })
  }, [resultados, users, filtroTurma, filtroDataInicio, filtroDataFim])

  // Métricas calculadas sobre os dados filtrados
  const metricasFiltradas = useMemo(() => {
    const totalTentativas = resultadosFiltrados.length
    const respondentesUnicosIds = new Set(resultadosFiltrados.map((r) => r.usuario))

    // Usuários elegíveis com os filtros
    const usuariosFiltrados = users.filter((u) => {
      if (filtroTurma !== 'todas' && u.turma !== filtroTurma) {
        return false
      }
      return true
    })

    const contagemPorPerfil: Record<PerfilCronotipo, number> = {
      Golfinho: 0,
      Leão: 0,
      Urso: 0,
      Lobo: 0,
    }

    resultadosFiltrados.forEach((r) => {
      if (contagemPorPerfil[r.perfil] !== undefined) {
        contagemPorPerfil[r.perfil] += 1
      }
    })

    const percentualPorPerfil: Record<PerfilCronotipo, number> = {
      Golfinho:
        totalTentativas > 0 ? Math.round((contagemPorPerfil.Golfinho / totalTentativas) * 100) : 0,
      Leão: totalTentativas > 0 ? Math.round((contagemPorPerfil.Leão / totalTentativas) * 100) : 0,
      Urso: totalTentativas > 0 ? Math.round((contagemPorPerfil.Urso / totalTentativas) * 100) : 0,
      Lobo: totalTentativas > 0 ? Math.round((contagemPorPerfil.Lobo / totalTentativas) * 100) : 0,
    }

    return {
      totalTentativas,
      totalUsuarios: usuariosFiltrados.length,
      respondentesUnicos: respondentesUnicosIds.size,
      contagemPorPerfil,
      percentualPorPerfil,
    }
  }, [resultadosFiltrados, users, filtroTurma])

  // Lista de respondentes unificados para a tabela (respeitando filtros de turma e data)
  const listaRespondentes = useMemo<RespondenteItem[]>(() => {
    // Agrupa resultados filtrados por usuário
    const resultadosPorUser = new Map<string, ResultadoRecord[]>()
    resultadosFiltrados.forEach((r) => {
      const list = resultadosPorUser.get(r.usuario) || []
      list.push(r)
      resultadosPorUser.set(r.usuario, list)
    })

    // Se houver filtro de data ativo, mostramos apenas quem teve testes no período
    const filtroDataAtivo = Boolean(filtroDataInicio || filtroDataFim)

    const itens: RespondenteItem[] = []

    users.forEach((u) => {
      // Filtro de turma
      if (filtroTurma !== 'todas' && u.turma !== filtroTurma) {
        return
      }

      const resList = resultadosPorUser.get(u.id) || []

      // Se filtro de data estiver ativo e o usuário não tiver testes no período, ignoramos
      if (filtroDataAtivo && resList.length === 0) {
        return
      }

      const ultimo = resList[0] || null
      const turmaObj = u.turma ? mapTurmas.get(u.turma) : undefined
      const turmaNome = turmaObj ? turmaObj.nome : 'Sem turma'

      itens.push({
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
        totalTentativas: resList.length,
        userId: u.id,
        turmaId: u.turma,
        turmaNome,
      })
    })

    return itens
  }, [users, resultadosFiltrados, filtroTurma, filtroDataInicio, filtroDataFim, mapTurmas])

  // Filtro de busca textual por nome ou e-mail
  const respondentesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return listaRespondentes
    const termo = searchTerm.toLowerCase().trim()
    return listaRespondentes.filter(
      (r) => r.nome.toLowerCase().includes(termo) || r.email.toLowerCase().includes(termo),
    )
  }, [listaRespondentes, searchTerm])

  // Paginação
  const totalPages = Math.ceil(respondentesFiltrados.length / pageSize) || 1
  const paginatedRespondentes = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return respondentesFiltrados.slice(start, start + pageSize)
  }, [respondentesFiltrados, currentPage])

  // Reset de página ao alterar filtros
  const handleFiltroTurmaChange = (val: string) => {
    setFiltroTurma(val)
    setCurrentPage(1)
  }

  const handleLimparFiltros = () => {
    setFiltroTurma('todas')
    setFiltroDataInicio('')
    setFiltroDataFim('')
    setSearchTerm('')
    setCurrentPage(1)
  }

  const temFiltroAtivo =
    filtroTurma !== 'todas' || !!filtroDataInicio || !!filtroDataFim || !!searchTerm

  // Exportar dados VISÍVEIS/FILTRADOS em CSV com delimitador ; e BOM UTF-8
  const exportarCSV = () => {
    // Colunas especificadas: nome;email;perfil;data_teste;turma;pontuacao
    const headers = ['nome', 'email', 'perfil', 'data_teste', 'turma', 'pontuacao']

    const rows: string[][] = respondentesFiltrados.map((resp) => {
      return [
        `"${resp.nome.replace(/"/g, '""')}"`,
        `"${resp.email.replace(/"/g, '""')}"`,
        `"${resp.perfil}"`,
        `"${resp.dataTeste}"`,
        `"${resp.turmaNome.replace(/"/g, '""')}"`,
        resp.pontuacao !== '-' ? `${resp.pontuacao}` : '""',
      ]
    })

    const csvContent = [headers.join(';'), ...rows.map((row) => row.join(';'))].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute(
      'download',
      `respondentes_cronotipo_iceduc_${new Date().toISOString().slice(0, 10)}.csv`,
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast({
      title: 'Planilha exportada',
      description: `${respondentesFiltrados.length} registro(s) exportado(s) com sucesso.`,
    })
  }

  // === HANDLERS DE TURMAS ===
  const handleAbrirNovaTurma = () => {
    setTurmaEmEdicao(null)
    setTurmaNomeInput('')
    setTurmaDataInput('')
    setModalTurmaOpen(true)
  }

  const handleAbrirEditarTurma = (t: TurmaRecord) => {
    setTurmaEmEdicao(t)
    setTurmaNomeInput(t.nome)
    setTurmaDataInput(t.data || '')
    setModalTurmaOpen(true)
  }

  const handleSalvarTurma = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!turmaNomeInput.trim()) {
      toast({
        title: 'Nome obrigatório',
        description: 'Por favor, informe o nome da turma.',
        variant: 'destructive',
      })
      return
    }

    setIsSavingTurma(true)
    try {
      if (turmaEmEdicao) {
        await testeService.atualizarTurma(turmaEmEdicao.id, {
          nome: turmaNomeInput,
          data: turmaDataInput,
        })
        toast({ title: 'Turma atualizada', description: 'As alterações foram salvas com sucesso.' })
      } else {
        await testeService.criarTurma({
          nome: turmaNomeInput,
          data: turmaDataInput,
        })
        toast({ title: 'Turma criada', description: 'A nova turma foi cadastrada com sucesso.' })
      }
      setModalTurmaOpen(false)
      await carregarDados()
    } catch (err) {
      console.error('Erro ao salvar turma:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a turma. Verifique os dados.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingTurma(false)
    }
  }

  const handleConfirmarExcluirTurma = async () => {
    if (!turmaParaExcluir) return
    setIsDeletingTurma(true)
    try {
      await testeService.excluirTurma(turmaParaExcluir.id)
      toast({
        title: 'Turma excluída',
        description: `A turma "${turmaParaExcluir.nome}" foi removida.`,
      })
      setDialogExcluirTurmaOpen(false)
      setTurmaParaExcluir(null)
      if (filtroTurma === turmaParaExcluir.id) {
        setFiltroTurma('todas')
      }
      await carregarDados()
    } catch (err) {
      console.error('Erro ao excluir turma:', err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a turma.',
        variant: 'destructive',
      })
    } finally {
      setIsDeletingTurma(false)
    }
  }

  // === HANDLERS DE USUÁRIOS ===
  const handleAbrirNovoUsuario = () => {
    setUsuarioEmEdicao(null)
    setUserNomeInput('')
    setUserEmailInput('')
    setUserPasswordInput('')
    setUserTurmaInput('nenhuma')
    setModalUsuarioOpen(true)
  }

  const handleAbrirEditarUsuario = (u: UserRecord) => {
    setUsuarioEmEdicao(u)
    setUserNomeInput(u.name || '')
    setUserEmailInput(u.email || '')
    setUserPasswordInput('')
    setUserTurmaInput(u.turma || 'nenhuma')
    setModalUsuarioOpen(true)
  }

  const handleSalvarUsuario = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userNomeInput.trim() || !userEmailInput.trim()) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o nome e o e-mail do participante.',
        variant: 'destructive',
      })
      return
    }

    setIsSavingUser(true)
    try {
      const turmaValue = userTurmaInput === 'nenhuma' ? '' : userTurmaInput
      if (usuarioEmEdicao) {
        await testeService.atualizarUsuario(usuarioEmEdicao.id, {
          nome: userNomeInput,
          email: userEmailInput,
          turma: turmaValue,
        })
        toast({
          title: 'Participante atualizado',
          description: 'Dados do participante alterados com sucesso.',
        })
      } else {
        await testeService.criarUsuario({
          nome: userNomeInput,
          email: userEmailInput,
          password: userPasswordInput || 'Mudar@123',
          turma: turmaValue,
        })
        toast({
          title: 'Participante cadastrado',
          description: 'Novo participante registrado com sucesso.',
        })
      }
      setModalUsuarioOpen(false)
      await carregarDados()
    } catch (err) {
      console.error('Erro ao salvar participante:', err)
      toast({
        title: 'Erro ao salvar',
        description: 'Verifique se o e-mail já está em uso ou é válido.',
        variant: 'destructive',
      })
    } finally {
      setIsSavingUser(false)
    }
  }

  const handleConfirmarExcluirUsuario = async () => {
    if (!userParaExcluir) return
    setIsDeletingUser(true)
    try {
      await testeService.excluirUsuario(userParaExcluir.id)
      toast({
        title: 'Registro excluído',
        description: `O participante "${userParaExcluir.name || userParaExcluir.email}" foi excluído.`,
      })
      setDialogExcluirUserOpen(false)
      setUserParaExcluir(null)
      await carregarDados()
    } catch (err) {
      console.error('Erro ao excluir participante:', err)
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir este participante.',
        variant: 'destructive',
      })
    } finally {
      setIsDeletingUser(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20 space-y-4 font-sans">
        <Loader2 className="w-10 h-10 text-[#E55320] animate-spin" />
        <p className="text-sm font-semibold text-[#2B2621]/70">Carregando painel analítico...</p>
      </div>
    )
  }

  const perfisOrdem: PerfilCronotipo[] = ['Golfinho', 'Leão', 'Urso', 'Lobo']

  return (
    <div className="flex-1 flex flex-col space-y-6 sm:space-y-8 max-w-full font-sans text-[#2B2621]">
      {/* Topo do Painel */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-3xl border border-[#2B2621]/15 shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src={icLogo}
            alt="IC Educ"
            className="w-11 h-11 rounded-full object-contain shrink-0"
          />
          <div>
            <h1 className="text-xl sm:text-2xl font-fraunces font-bold text-[#2B2621] tracking-tight">
              Painel do Administrador
            </h1>
            <p className="text-xs sm:text-sm text-[#2B2621]/70 font-sans">
              Gestão de participantes, turmas e métricas de cronótipo IC Educ
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto font-sans flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="rounded-full text-xs font-semibold border-[#2B2621]/20 text-[#2B2621]"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>

          <Button
            onClick={exportarCSV}
            size="sm"
            className="bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full text-xs shadow-sm"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Exportar CSV ({respondentesFiltrados.length})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOutAdmin}
            className="rounded-full text-xs font-semibold text-[#2B2621]/70 hover:text-red-700 hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5 mr-1" />
            Sair
          </Button>
        </div>
      </div>

      {/* Barra de Filtros: Período de Data e Turma */}
      <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#E55320]" />
              <span className="text-sm font-fraunces font-bold text-[#2B2621]">
                Filtros do Dashboard e Relatórios
              </span>
            </div>
            {temFiltroAtivo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLimparFiltros}
                className="h-7 text-xs text-[#E55320] hover:bg-[#E55320]/10 rounded-full px-2.5"
              >
                <X className="w-3 h-3 mr-1" />
                Limpar filtros
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Filtro por Turma */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2B2621]/80">Filtrar por Turma</Label>
              <Select value={filtroTurma} onValueChange={handleFiltroTurmaChange}>
                <SelectTrigger className="h-10 text-xs sm:text-sm rounded-full border-[#2B2621]/20 bg-[#FAF7F1]">
                  <SelectValue placeholder="Todas as Turmas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as Turmas</SelectItem>
                  {turmas.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome} {t.data ? `(${t.data})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Início */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2B2621]/80">Data Início</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  value={filtroDataInicio}
                  onChange={(e) => {
                    setFiltroDataInicio(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 h-10 text-xs sm:text-sm rounded-full border-[#2B2621]/20 bg-[#FAF7F1] text-[#2B2621]"
                />
              </div>
            </div>

            {/* Data Fim */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[#2B2621]/80">Data Fim</Label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <Input
                  type="date"
                  value={filtroDataFim}
                  onChange={(e) => {
                    setFiltroDataFim(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9 h-10 text-xs sm:text-sm rounded-full border-[#2B2621]/20 bg-[#FAF7F1] text-[#2B2621]"
                />
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cartões de Métricas no Topo */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4 font-sans">
        {/* Total Usuários Cadastrados */}
        <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#2B2621]/60">
              <span className="text-[11px] font-bold uppercase tracking-wider">Respondentes</span>
              <Users className="w-4 h-4 text-[#E55320]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2B2621]">
                {metricasFiltradas.totalUsuarios}
              </span>
              <span className="text-[10px] text-[#2B2621]/60 block mt-0.5">
                {filtroTurma !== 'todas' ? 'na turma' : 'cadastrados'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Total Tentativas Realizadas */}
        <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
            <div className="flex items-center justify-between text-[#2B2621]/60">
              <span className="text-[11px] font-bold uppercase tracking-wider">Testes Feitos</span>
              <CheckSquare className="w-4 h-4 text-[#E55320]" />
            </div>
            <div className="mt-2">
              <span className="text-2xl sm:text-3xl font-fraunces font-bold text-[#2B2621]">
                {metricasFiltradas.totalTentativas}
              </span>
              <span className="text-[10px] text-[#2B2621]/60 block mt-0.5">no filtro atual</span>
            </div>
          </CardContent>
        </Card>

        {/* 4 Mini-cards coloridos por perfil */}
        {perfisOrdem.map((p) => {
          const info = PERFIS_INFO[p]
          const qtd = metricasFiltradas.contagemPorPerfil[p] || 0
          const pct = metricasFiltradas.percentualPorPerfil[p] || 0

          return (
            <Card
              key={p}
              className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
              style={{ borderTop: `4px solid ${info.cor}` }}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-fraunces font-bold uppercase tracking-wider text-[#2B2621]/70">
                    {p}
                  </span>
                  <span className="text-lg">{info.emoji}</span>
                </div>
                <div className="mt-2">
                  <span
                    className="text-2xl sm:text-3xl font-fraunces font-bold"
                    style={{ color: info.cor }}
                  >
                    {qtd}
                  </span>
                  <span className="text-[11px] font-semibold text-[#2B2621]/60 block mt-0.5 font-sans">
                    {pct}% do total
                  </span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Gráfico de Barras Horizontais com Percentuais */}
      <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base sm:text-lg font-fraunces font-bold text-[#2B2621]">
                Distribuição Percentual dos Cronótipos
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#2B2621]/70 font-sans">
                Percentual dos 4 perfis biológicos (Golfinho, Leão, Urso, Lobo) no recorte
                selecionado
              </CardDescription>
            </div>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAF7F1] border border-[#2B2621]/10 text-[#2B2621]">
              Base: {metricasFiltradas.totalTentativas} teste(s)
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-2 font-sans">
          {perfisOrdem.map((perfil) => {
            const info = PERFIS_INFO[perfil]
            const qtd = metricasFiltradas.contagemPorPerfil[perfil] || 0
            const pct = metricasFiltradas.percentualPorPerfil[perfil] || 0

            return (
              <div key={perfil} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <span>{info.emoji}</span>
                    <span className="font-fraunces font-bold text-[#2B2621]">{perfil}</span>
                    <span className="text-xs text-[#2B2621]/60">
                      ({qtd} {qtd === 1 ? 'teste' : 'testes'})
                    </span>
                  </div>
                  <span className="font-bold text-sm" style={{ color: info.cor }}>
                    {pct}%
                  </span>
                </div>

                {/* Barra de distribuição percentual */}
                <div className="h-3.5 w-full bg-[#FAF7F1] rounded-full overflow-hidden p-0.5 border border-[#2B2621]/10">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${pct > 0 ? Math.max(pct, 2) : 0}%`,
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
      <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm overflow-hidden font-sans">
        <CardHeader className="pb-4 border-b border-[#2B2621]/10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base sm:text-lg font-fraunces font-bold text-[#2B2621]">
                Lista de Respondentes
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm text-[#2B2621]/70 font-sans">
                Mostrando {respondentesFiltrados.length} participante(s) conforme os filtros ativos
              </CardDescription>
            </div>

            {/* Campo de Busca em Tempo Real */}
            <div className="relative w-full sm:w-72 font-sans">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9 h-10 text-xs sm:text-sm rounded-full border-[#2B2621]/20 focus-visible:ring-[#E55320] text-[#2B2621]"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-[#FAF7F1] text-[#2B2621]/70 font-bold border-b border-[#2B2621]/10 uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Nome</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Data do Teste</th>
                  <th className="py-3 px-4">Turma</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2621]/10">
                {paginatedRespondentes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-[#2B2621]/60">
                      Nenhum respondente encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  paginatedRespondentes.map((resp) => {
                    const info = resp.perfil !== '-' ? PERFIS_INFO[resp.perfil] : null
                    const userOriginal = users.find((u) => u.id === resp.userId)

                    return (
                      <tr key={resp.id} className="hover:bg-[#FAF7F1]/80 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#2B2621]">{resp.nome}</td>
                        <td className="py-3.5 px-4 text-[#2B2621]/70">{resp.email}</td>
                        <td className="py-3.5 px-4">
                          {info ? (
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-fraunces font-bold"
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
                        <td className="py-3.5 px-4 text-[#2B2621]/70">{resp.dataTeste}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FAF7F1] border border-[#2B2621]/15 text-[#2B2621]">
                            {resp.turmaNome}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Link to={`/admin/respondentes/${resp.userId}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-xs font-semibold text-[#E55320] hover:bg-[#E55320]/10 rounded-full px-2.5"
                                title="Ver histórico completo"
                              >
                                <Eye className="w-3.5 h-3.5 mr-1" />
                                Detalhes
                              </Button>
                            </Link>
                            {userOriginal && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAbrirEditarUsuario(userOriginal)}
                                  className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-[#E55320] hover:bg-[#2B2621]/5 rounded-full"
                                  title="Editar dados do participante"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setUserParaExcluir(userOriginal)
                                    setDialogExcluirUserOpen(true)
                                  }}
                                  className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-red-600 hover:bg-red-50 rounded-full"
                                  title="Excluir participante"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          <div className="flex items-center justify-between p-4 border-t border-[#2B2621]/10 text-xs text-[#2B2621]/70">
            <span>
              Página <strong>{currentPage}</strong> de <strong>{totalPages}</strong>
            </span>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="h-8 rounded-full border-[#2B2621]/20 text-[#2B2621]"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="h-8 rounded-full border-[#2B2621]/20 text-[#2B2621]"
              >
                Próxima
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Gerenciamento de Turmas & Gerenciamento de Usuários (mesma tela) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bloco 1: Gerenciar Turmas */}
        <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-[#2B2621]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-[#FAF7F1] border border-[#2B2621]/10 text-[#E55320]">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-fraunces font-bold text-[#2B2621]">
                      Gerenciamento de Turmas
                    </CardTitle>
                    <CardDescription className="text-xs text-[#2B2621]/70">
                      Crie novas turmas, altere nomes e datas
                    </CardDescription>
                  </div>
                </div>

                <Button
                  onClick={handleAbrirNovaTurma}
                  size="sm"
                  className="bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full text-xs shadow-sm h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Nova Turma
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
              {turmas.length === 0 ? (
                <p className="text-xs text-[#2B2621]/60 py-6 text-center">
                  Nenhuma turma cadastrada ainda. Clique em "Nova Turma" para começar.
                </p>
              ) : (
                turmas.map((t) => {
                  const totalAlunos = users.filter((u) => u.turma === t.id).length
                  return (
                    <div
                      key={t.id}
                      className="p-3 rounded-2xl bg-[#FAF7F1] border border-[#2B2621]/10 flex items-center justify-between gap-2 hover:border-[#E55320]/40 transition-colors"
                    >
                      <div>
                        <span className="font-fraunces font-bold text-sm text-[#2B2621] block">
                          {t.nome}
                        </span>
                        <div className="flex items-center gap-3 text-[11px] text-[#2B2621]/70 mt-0.5">
                          {t.data && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#E55320]" />
                              {t.data}
                            </span>
                          )}
                          <span>{totalAlunos} participante(s)</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarTurma(t)}
                          className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-[#E55320] hover:bg-white rounded-full"
                          title="Editar turma"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setTurmaParaExcluir(t)
                            setDialogExcluirTurmaOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-red-600 hover:bg-red-50 rounded-full"
                          title="Excluir turma"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </CardContent>
          </div>
        </Card>

        {/* Bloco 2: Gerenciar Usuários */}
        <Card className="border border-[#2B2621]/15 rounded-3xl bg-white shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-[#2B2621]/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-2xl bg-[#FAF7F1] border border-[#2B2621]/10 text-[#E55320]">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg font-fraunces font-bold text-[#2B2621]">
                      Gerenciamento de Usuários
                    </CardTitle>
                    <CardDescription className="text-xs text-[#2B2621]/70">
                      Cadastre novos participantes e gerencie vínculos
                    </CardDescription>
                  </div>
                </div>

                <Button
                  onClick={handleAbrirNovoUsuario}
                  size="sm"
                  className="bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full text-xs shadow-sm h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Cadastrar Usuário
                </Button>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-2 max-h-[360px] overflow-y-auto">
              {users.length === 0 ? (
                <p className="text-xs text-[#2B2621]/60 py-6 text-center">
                  Nenhum usuário cadastrado.
                </p>
              ) : (
                users.slice(0, 15).map((u) => {
                  const turmaObj = u.turma ? mapTurmas.get(u.turma) : undefined
                  return (
                    <div
                      key={u.id}
                      className="p-3 rounded-2xl bg-[#FAF7F1] border border-[#2B2621]/10 flex items-center justify-between gap-2 hover:border-[#E55320]/40 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-[#2B2621] truncate">
                            {u.name || 'Sem nome'}
                          </span>
                          {u.admin && (
                            <span className="px-1.5 py-0.2 rounded-full bg-[#E55320]/15 text-[#E55320] text-[9px] font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#2B2621]/70 truncate">{u.email}</p>
                        <span className="text-[10px] text-[#2B2621]/60 font-medium">
                          Turma: {turmaObj ? turmaObj.nome : 'Nenhuma'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAbrirEditarUsuario(u)}
                          className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-[#E55320] hover:bg-white rounded-full"
                          title="Editar usuário"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setUserParaExcluir(u)
                            setDialogExcluirUserOpen(true)
                          }}
                          className="h-8 w-8 p-0 text-[#2B2621]/70 hover:text-red-600 hover:bg-red-50 rounded-full"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
              {users.length > 15 && (
                <p className="text-[11px] text-center text-[#2B2621]/60 pt-2">
                  Exibindo 15 de {users.length} usuários. Use a tabela acima para buscar todos.
                </p>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* MODAL: Criar / Editar Turma */}
      <Dialog open={modalTurmaOpen} onOpenChange={setModalTurmaOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#2B2621]/15 text-[#2B2621] font-sans">
          <form onSubmit={handleSalvarTurma}>
            <DialogHeader>
              <DialogTitle className="font-fraunces text-xl font-bold text-[#2B2621]">
                {turmaEmEdicao ? 'Editar Turma' : 'Nova Turma'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#2B2621]/70">
                {turmaEmEdicao
                  ? 'Atualize o nome e as informações da turma selecionada.'
                  : 'Cadastre uma nova turma para agrupar participantes.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="nomeTurma" className="text-xs font-semibold text-[#2B2621]">
                  Nome da Turma *
                </Label>
                <Input
                  id="nomeTurma"
                  value={turmaNomeInput}
                  onChange={(e) => setTurmaNomeInput(e.target.value)}
                  placeholder="Ex: Turma Executiva 2026.1"
                  required
                  className="rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="dataTurma" className="text-xs font-semibold text-[#2B2621]">
                  Data / Período
                </Label>
                <Input
                  id="dataTurma"
                  value={turmaDataInput}
                  onChange={(e) => setTurmaDataInput(e.target.value)}
                  placeholder="Ex: Outubro/2026 ou 16/10/2026"
                  className="rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320]"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalTurmaOpen(false)}
                className="rounded-full border-[#2B2621]/20 text-[#2B2621]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSavingTurma}
                className="bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm"
              >
                {isSavingTurma && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {turmaEmEdicao ? 'Salvar Alterações' : 'Criar Turma'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Confirmar Exclusão de Turma */}
      <Dialog open={dialogExcluirTurmaOpen} onOpenChange={setDialogExcluirTurmaOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#2B2621]/15 text-[#2B2621] font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="font-fraunces text-lg font-bold text-[#2B2621]">
                Excluir Turma
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#2B2621]/70">
              Tem certeza que deseja excluir a turma{' '}
              <strong className="text-[#2B2621]">"{turmaParaExcluir?.nome}"</strong>? Esta ação não
              pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogExcluirTurmaOpen(false)}
              className="rounded-full border-[#2B2621]/20 text-[#2B2621]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingTurma}
              onClick={handleConfirmarExcluirTurma}
              className="rounded-full font-bold shadow-sm"
            >
              {isDeletingTurma && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir Turma
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Cadastrar / Editar Usuário */}
      <Dialog open={modalUsuarioOpen} onOpenChange={setModalUsuarioOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#2B2621]/15 text-[#2B2621] font-sans">
          <form onSubmit={handleSalvarUsuario}>
            <DialogHeader>
              <DialogTitle className="font-fraunces text-xl font-bold text-[#2B2621]">
                {usuarioEmEdicao ? 'Editar Participante' : 'Novo Participante'}
              </DialogTitle>
              <DialogDescription className="text-xs text-[#2B2621]/70">
                {usuarioEmEdicao
                  ? 'Edite as informações cadastrais e turma do participante.'
                  : 'Cadastre manualmente um novo participante para o teste.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-1.5">
                <Label htmlFor="nomeUser" className="text-xs font-semibold text-[#2B2621]">
                  Nome Completo *
                </Label>
                <Input
                  id="nomeUser"
                  value={userNomeInput}
                  onChange={(e) => setUserNomeInput(e.target.value)}
                  placeholder="Ex: Carlos Eduardo Silva"
                  required
                  className="rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320]"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="emailUser" className="text-xs font-semibold text-[#2B2621]">
                  E-mail *
                </Label>
                <Input
                  id="emailUser"
                  type="email"
                  value={userEmailInput}
                  onChange={(e) => setUserEmailInput(e.target.value)}
                  placeholder="Ex: carlos@empresa.com"
                  required
                  className="rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320]"
                />
              </div>

              {!usuarioEmEdicao && (
                <div className="space-y-1.5">
                  <Label htmlFor="passUser" className="text-xs font-semibold text-[#2B2621]">
                    Senha Inicial (mínimo 8 caracteres)
                  </Label>
                  <Input
                    id="passUser"
                    type="password"
                    value={userPasswordInput}
                    onChange={(e) => setUserPasswordInput(e.target.value)}
                    placeholder="Padrão: Mudar@123"
                    className="rounded-xl border-[#2B2621]/20 focus-visible:ring-[#E55320]"
                  />
                  <p className="text-[10px] text-[#2B2621]/60">
                    Se deixado em branco, a senha padrão será <code>Mudar@123</code>.
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[#2B2621]">Turma</Label>
                <Select value={userTurmaInput} onValueChange={setUserTurmaInput}>
                  <SelectTrigger className="rounded-xl border-[#2B2621]/20 bg-[#FAF7F1]">
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhuma">Nenhuma turma vinculada</SelectItem>
                    {turmas.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome} {t.data ? `(${t.data})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalUsuarioOpen(false)}
                className="rounded-full border-[#2B2621]/20 text-[#2B2621]"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSavingUser}
                className="bg-[#E55320] hover:bg-[#c94517] text-white font-bold rounded-full shadow-sm"
              >
                {isSavingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {usuarioEmEdicao ? 'Salvar Alterações' : 'Cadastrar Participante'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG: Confirmar Exclusão de Usuário */}
      <Dialog open={dialogExcluirUserOpen} onOpenChange={setDialogExcluirUserOpen}>
        <DialogContent className="sm:max-w-md bg-white rounded-3xl border border-[#2B2621]/15 text-[#2B2621] font-sans">
          <DialogHeader>
            <div className="flex items-center gap-2 text-red-600 mb-1">
              <AlertTriangle className="w-5 h-5" />
              <DialogTitle className="font-fraunces text-lg font-bold text-[#2B2621]">
                Excluir Participante
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-[#2B2621]/70">
              Tem certeza que deseja excluir o cadastro de{' '}
              <strong className="text-[#2B2621]">
                "{userParaExcluir?.name || userParaExcluir?.email}"
              </strong>
              ? Todos os resultados e respostas vinculados serão removidos. Esta ação é
              irreversível.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDialogExcluirUserOpen(false)}
              className="rounded-full border-[#2B2621]/20 text-[#2B2621]"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeletingUser}
              onClick={handleConfirmarExcluirUsuario}
              className="rounded-full font-bold shadow-sm"
            >
              {isDeletingUser && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Excluir Registro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
