export type PerfilCronotipo = 'Golfinho' | 'Leão' | 'Urso' | 'Lobo'

export interface UserRecord {
  id: string
  email: string
  name?: string
  avatar?: string
  admin?: boolean
  ultimo_perfil?: PerfilCronotipo
  created: string
  updated: string
  verified: boolean
}

export interface RespostaRecord {
  id: string
  usuario: string
  tentativa?: string
  parte: '1' | '2'
  pergunta_numero: number
  resposta: string
  peso: number
  created: string
  updated: string
}

export interface ResultadoRecord {
  id: string
  usuario: string
  perfil: PerfilCronotipo
  pontuacao: number
  via_parte1: boolean
  created: string
  updated: string
  expand?: {
    usuario?: UserRecord
  }
}

export interface PerfilDetalhes {
  perfil: PerfilCronotipo
  cor: string
  emoji: string
  animal: string
  tagline: string
  descricao: string
  pontosChave: string[]
  dicaRotina: string
}

export const PERFIS_INFO: Record<PerfilCronotipo, PerfilDetalhes> = {
  Golfinho: {
    perfil: 'Golfinho',
    cor: '#F39C12',
    emoji: '🐬',
    animal: 'Golfinho',
    tagline: 'Madrugador e focado nas manhãs',
    descricao:
      'Você é uma pessoa de hábitos matinais! Prefere acordar cedo, rende ao máximo nas primeiras horas do dia e sente sono cedo à noite. Seu relógio biológico prioriza começar o dia com energia. Para manter esse pico, busque proteger suas manhãs para as tarefas mais desafiadoras e evite telas antes de dormir.',
    pontosChave: [
      'Pico de produtividade antes das 12h',
      'Despertar natural e disposição matinal',
      'Sono cedo, preferência por noites calmas',
    ],
    dicaRotina: 'Reserve o início da manhã para os projetos de maior esforço cognitivo.',
  },
  Leão: {
    perfil: 'Leão',
    cor: '#E74C3C',
    emoji: '🦁',
    animal: 'Leão',
    tagline: 'Ritmo diurno clássico e dinâmico',
    descricao:
      'Você tem um ritmo diurno clássico: produtivo durante o dia, com pico pela manhã e começo da tarde, e uma queda natural à noite. Prefere horários intermediários, acordando cedo com facilidade. Organize suas tarefas mais complexas antes das 15h para aproveitar seu melhor desempenho.',
    pontosChave: [
      'Excelente ritmo matutino e início de tarde',
      'Liderança e foco estruturado no período comercial',
      'Desaceleração gradual após as 16h',
    ],
    dicaRotina: 'Concentre reuniões estratégicas e tomada de decisões até as 14h.',
  },
  Urso: {
    perfil: 'Urso',
    cor: '#8D6E63',
    animal: 'Urso',
    emoji: '🐻',
    tagline: 'Acompanha o sol com flexibilidade',
    descricao:
      'Seu ritmo acompanha o sol: você acorda com relativa facilidade, rende bem no meio do dia e vai desacelerando à tarde. Funciona melhor em horários flexíveis, mas sente queda após o almoço. Aproveite o período entre 10h e 16h para atividades que exigem foco.',
    pontosChave: [
      'Maior janela de energia entre 10h e 16h',
      'Sensível ao ciclo solar e iluminação natural',
      'Necessidade de pausa restauradora pós-almoço',
    ],
    dicaRotina: 'Faça uma caminhada rápida ou pausa ativa logo após o almoço para recarregar.',
  },
  Lobo: {
    perfil: 'Lobo',
    cor: '#34495E',
    animal: 'Lobo',
    emoji: '🐺',
    tagline: 'Criatividade e rendimento noturnos',
    descricao:
      'Você é uma pessoa noturna por natureza! Seu pico de energia é à noite, e você rende mais quando o sol se põe. Dormir cedo é um desafio, e acordar cedo exige esforço. Agende atividades importantes para o fim da tarde e noite e tente manter uma rotina de sono consistente para aproveitar sua criatividade.',
    pontosChave: [
      'Pico de criatividade e concentração à noite',
      'Dificuldade natural para acordar muito cedo',
      'Mente ativa e produtiva quando o ambiente silencia',
    ],
    dicaRotina:
      'Evite compromissos críticos no primeiro horário da manhã e use as noites para estudos aprofundados.',
  },
}
