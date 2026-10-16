import pb from '@/lib/pocketbase/client'
import type {
  RespostaRecord,
  ResultadoRecord,
  PerfilCronotipo,
  UserRecord,
  TurmaRecord,
} from '@/types/cronotipo'

export const testeService = {
  // Salva uma resposta individual (parte 1 ou 2)
  async salvarResposta(params: {
    usuarioId: string
    parte: '1' | '2'
    perguntaNumero: number
    resposta: string
    peso: number
    tentativaId?: string
  }): Promise<RespostaRecord> {
    const data: Record<string, unknown> = {
      usuario: params.usuarioId,
      parte: params.parte,
      pergunta_numero: params.perguntaNumero,
      resposta: params.resposta,
      peso: params.peso,
    }
    if (params.tentativaId) {
      data.tentativa = params.tentativaId
    }
    const record = await pb.collection('respostas').create(data)
    return record as unknown as RespostaRecord
  },

  // Vincula respostas pendentes a um resultado criado
  async vincularRespostasATentativa(respostaIds: string[], tentativaId: string): Promise<void> {
    await Promise.allSettled(
      respostaIds.map((id) => pb.collection('respostas').update(id, { tentativa: tentativaId })),
    )
  },

  // Cria o registro final do resultado
  async salvarResultado(params: {
    usuarioId: string
    perfil: PerfilCronotipo
    pontuacao: number
    viaParte1: boolean
    turmaId?: string
  }): Promise<ResultadoRecord> {
    // Se turmaId não fornecido, busca turma atual do usuário
    let turma = params.turmaId
    if (!turma) {
      try {
        const u = await pb.collection('users').getOne(params.usuarioId)
        if (u.turma) {
          turma = u.turma
        }
      } catch {
        /* intentionally ignored */
      }
    }

    const payload: Record<string, unknown> = {
      usuario: params.usuarioId,
      perfil: params.perfil,
      pontuacao: params.pontuacao,
      via_parte1: params.viaParte1,
    }
    if (turma) {
      payload.turma = turma
    }

    const record = await pb.collection('resultados').create(payload)

    // Atualiza ultimo_perfil no users
    try {
      await pb.collection('users').update(params.usuarioId, {
        ultimo_perfil: params.perfil,
      })
    } catch (err) {
      console.warn('Erro ao atualizar ultimo_perfil do usuário:', err)
    }

    return record as unknown as ResultadoRecord
  },

  // Busca o último resultado do usuário autenticado
  async getUltimoResultado(usuarioId: string): Promise<ResultadoRecord | null> {
    try {
      const records = await pb.collection('resultados').getList(1, 1, {
        filter: `usuario = "${usuarioId}"`,
        sort: '-created',
      })
      if (records.items.length > 0) {
        return records.items[0] as unknown as ResultadoRecord
      }
      return null
    } catch (err) {
      console.error('Erro ao buscar último resultado:', err)
      return null
    }
  },

  // Busca resultado específico por ID
  async getResultadoPorId(id: string): Promise<ResultadoRecord | null> {
    try {
      const record = await pb.collection('resultados').getOne(id, {
        expand: 'usuario',
      })
      return record as unknown as ResultadoRecord
    } catch (err) {
      console.error('Erro ao buscar resultado por id:', err)
      return null
    }
  },

  // Métodos para o painel Admin
  async getAdminEstatisticas() {
    // Busca todos os resultados
    const resultados = await pb.collection('resultados').getFullList({
      sort: '-created',
      expand: 'usuario,turma',
    })

    // Busca todos os usuários
    const users = await pb.collection('users').getFullList({
      sort: '-created',
      expand: 'turma',
    })

    // Busca todas as turmas
    const turmas = await pb.collection('turmas').getFullList({
      sort: 'nome',
    })

    const totalTentativas = resultados.length
    const respondentesUnicos = new Set(
      resultados.map((r) => (r as unknown as ResultadoRecord).usuario),
    ).size
    const totalUsuarios = users.length

    const contagemPorPerfil: Record<PerfilCronotipo, number> = {
      Golfinho: 0,
      Leão: 0,
      Urso: 0,
      Lobo: 0,
    }

    resultados.forEach((r) => {
      const p = (r as unknown as ResultadoRecord).perfil
      if (contagemPorPerfil[p] !== undefined) {
        contagemPorPerfil[p] += 1
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
      totalUsuarios,
      respondentesUnicos,
      contagemPorPerfil,
      percentualPorPerfil,
      resultados: resultados as unknown as ResultadoRecord[],
      users: users as unknown as UserRecord[],
      turmas: turmas as unknown as TurmaRecord[],
    }
  },

  // === Gerenciamento de Turmas ===
  async getTurmas(): Promise<TurmaRecord[]> {
    const list = await pb.collection('turmas').getFullList({
      sort: 'nome',
    })
    return list as unknown as TurmaRecord[]
  },

  async criarTurma(data: { nome: string; data?: string }): Promise<TurmaRecord> {
    const rec = await pb.collection('turmas').create({
      nome: data.nome.trim(),
      data: data.data?.trim() || '',
    })
    return rec as unknown as TurmaRecord
  },

  async atualizarTurma(id: string, data: { nome: string; data?: string }): Promise<TurmaRecord> {
    const rec = await pb.collection('turmas').update(id, {
      nome: data.nome.trim(),
      ...(data.data !== undefined ? { data: data.data.trim() } : {}),
    })
    return rec as unknown as TurmaRecord
  },

  async excluirTurma(id: string): Promise<void> {
    await pb.collection('turmas').delete(id)
  },

  // === Gerenciamento de Usuários / Participantes ===
  async criarUsuario(data: {
    nome: string
    email: string
    password?: string
    turma?: string
  }): Promise<UserRecord> {
    const password = data.password && data.password.length >= 8 ? data.password : 'Mudar@123'
    const payload: Record<string, unknown> = {
      name: data.nome.trim(),
      email: data.email.trim().toLowerCase(),
      password,
      passwordConfirm: password,
      verified: true,
      turma: data.turma || '',
    }
    const rec = await pb.collection('users').create(payload)
    return rec as unknown as UserRecord
  },

  async atualizarUsuario(
    id: string,
    data: {
      nome?: string
      email?: string
      turma?: string
    },
  ): Promise<UserRecord> {
    const payload: Record<string, unknown> = {}
    if (data.nome !== undefined) payload.name = data.nome.trim()
    if (data.email !== undefined) payload.email = data.email.trim().toLowerCase()
    if (data.turma !== undefined) payload.turma = data.turma || ''

    const rec = await pb.collection('users').update(id, payload, {
      expand: 'turma',
    })
    return rec as unknown as UserRecord
  },

  async excluirUsuario(id: string): Promise<void> {
    // Exclui respostas e resultados associados ao usuário para manter consistência
    try {
      const resultados = await pb.collection('resultados').getFullList({
        filter: `usuario = "${id}"`,
      })
      for (const res of resultados) {
        await pb.collection('resultados').delete(res.id)
      }
    } catch {
      /* intentionally ignored */
    }

    try {
      const respostas = await pb.collection('respostas').getFullList({
        filter: `usuario = "${id}"`,
      })
      for (const resp of respostas) {
        await pb.collection('respostas').delete(resp.id)
      }
    } catch {
      /* intentionally ignored */
    }

    await pb.collection('users').delete(id)
  },

  // Busca lista de respondentes enriquecida
  async getRespondentesComResultados() {
    const [usersList, resultadosList] = await Promise.all([
      pb.collection('users').getFullList({ sort: '-created' }),
      pb.collection('resultados').getFullList({ sort: '-created' }),
    ])

    const resultadosPorUsuario = new Map<string, ResultadoRecord[]>()
    resultadosList.forEach((r) => {
      const rec = r as unknown as ResultadoRecord
      const list = resultadosPorUsuario.get(rec.usuario) || []
      list.push(rec)
      resultadosPorUsuario.set(rec.usuario, list)
    })

    const respondentes = usersList.map((u) => {
      const user = u as unknown as UserRecord
      const userResultados = resultadosPorUsuario.get(user.id) || []
      const ultimo = userResultados[0] || null
      return {
        user,
        ultimoResultado: ultimo,
        totalTentativas: userResultados.length,
        resultados: userResultados,
      }
    })

    return respondentes
  },

  // Busca detalhes de um usuário específico para tela de detalhes do admin
  async getDetalhesUsuario(userId: string) {
    const user = (await pb.collection('users').getOne(userId, {
      expand: 'turma',
    })) as unknown as UserRecord
    const resultados = (await pb.collection('resultados').getFullList({
      filter: `usuario = "${userId}"`,
      sort: '-created',
    })) as unknown as ResultadoRecord[]

    const respostas = (await pb.collection('respostas').getFullList({
      filter: `usuario = "${userId}"`,
      sort: 'parte,pergunta_numero',
    })) as unknown as RespostaRecord[]

    return {
      user,
      resultados,
      respostas,
    }
  },
}
