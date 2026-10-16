import pb from '@/lib/pocketbase/client'
import type {
  RespostaRecord,
  ResultadoRecord,
  PerfilCronotipo,
  UserRecord,
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
  }): Promise<ResultadoRecord> {
    const record = await pb.collection('resultados').create({
      usuario: params.usuarioId,
      perfil: params.perfil,
      pontuacao: params.pontuacao,
      via_parte1: params.viaParte1,
    })

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
    })

    // Busca todos os usuários
    const users = await pb.collection('users').getFullList({
      sort: '-created',
    })

    const totalTentativas = resultados.length
    // Respondentes únicos com pelo menos um teste
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
    }
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
    const user = (await pb.collection('users').getOne(userId)) as unknown as UserRecord
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
