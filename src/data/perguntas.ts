export interface AfirmacaoParte1 {
  numero: number
  texto: string
}

export const AFIRMACOES_PARTE1: AfirmacaoParte1[] = [
  { numero: 1, texto: 'Tenho mais energia e disposição logo pela manhã.' },
  { numero: 2, texto: 'Sinto vontade de dormir cedo, geralmente antes das 22h.' },
  { numero: 3, texto: 'Prefiro realizar tarefas difíceis nas primeiras horas do dia.' },
  { numero: 4, texto: 'Meu pico de produtividade acontece antes do meio-dia.' },
  { numero: 5, texto: 'Costumo acordar naturalmente sem despertador.' },
  { numero: 6, texto: 'Sinto que meu rendimento cai bastante no fim da tarde.' },
  { numero: 7, texto: 'Tenho dificuldade em permanecer acordado depois das 23h.' },
  { numero: 8, texto: 'Meu horário ideal de sono é entre 21h e 6h.' },
  { numero: 9, texto: 'Pela manhã, minha mente está mais clara e criativa.' },
  { numero: 10, texto: 'Prefiro jantar cedo e evitar atividades estimulantes à noite.' },
]

export interface OpcaoParte2 {
  texto: string
  peso: number
}

export interface PerguntaParte2 {
  numero: number
  enunciado: string
  opcoes: OpcaoParte2[]
}

export const PERGUNTAS_PARTE2: PerguntaParte2[] = [
  {
    numero: 1,
    enunciado: 'Em que horário você se sente mais disposto para estudar?',
    opcoes: [
      { texto: 'Pela manhã', peso: 1 },
      { texto: 'À tarde', peso: 2 },
      { texto: 'À noite', peso: 3 },
    ],
  },
  {
    numero: 2,
    enunciado: 'Como você costuma acordar?',
    opcoes: [
      { texto: 'Naturalmente, antes do despertador', peso: 1 },
      { texto: 'Com o despertador, sem dificuldade', peso: 2 },
      { texto: 'Com dificuldade, preciso de vários alarmes', peso: 3 },
    ],
  },
  {
    numero: 3,
    enunciado: 'Qual período do dia é melhor para resolver problemas difíceis?',
    opcoes: [
      { texto: 'Início da manhã', peso: 1 },
      { texto: 'Meio do dia', peso: 2 },
      { texto: 'Noite', peso: 3 },
    ],
  },
  {
    numero: 4,
    enunciado: 'Se você tivesse livre escolha, a que horas dormiria?',
    opcoes: [
      { texto: 'Antes das 22h', peso: 1 },
      { texto: 'Entre 22h e 0h', peso: 2 },
      { texto: 'Depois de meia-noite', peso: 3 },
    ],
  },
  {
    numero: 5,
    enunciado: 'Qual horário você considera mais produtivo?',
    opcoes: [
      { texto: '8h às 10h', peso: 1 },
      { texto: '14h às 16h', peso: 2 },
      { texto: '20h às 22h', peso: 3 },
    ],
  },
  {
    numero: 6,
    enunciado: 'Como você se sente ao acordar cedo?',
    opcoes: [
      { texto: 'Cheio de energia', peso: 1 },
      { texto: 'Um pouco lento, mas funcional', peso: 2 },
      { texto: 'Muito cansado e irritado', peso: 3 },
    ],
  },
  {
    numero: 7,
    enunciado: 'Quando você costuma sentir sono?',
    opcoes: [
      { texto: 'Cedo, por volta das 21h', peso: 1 },
      { texto: 'Entre 22h e 23h', peso: 2 },
      { texto: 'Depois da meia-noite', peso: 3 },
    ],
  },
  {
    numero: 8,
    enunciado: 'Qual é seu horário preferido para praticar exercícios?',
    opcoes: [
      { texto: 'De manhã', peso: 1 },
      { texto: 'Durante a tarde', peso: 2 },
      { texto: 'À noite', peso: 3 },
    ],
  },
  {
    numero: 9,
    enunciado: 'Se pudesse escolher, a que horas começaria seu dia?',
    opcoes: [
      { texto: 'Antes das 7h', peso: 1 },
      { texto: 'Entre 7h e 9h', peso: 2 },
      { texto: 'Entre 10h e meio-dia', peso: 3 },
    ],
  },
  {
    numero: 10,
    enunciado: 'Em qual período você tem mais criatividade?',
    opcoes: [
      { texto: 'Manhã', peso: 1 },
      { texto: 'Tarde', peso: 2 },
      { texto: 'Noite', peso: 3 },
    ],
  },
  {
    numero: 11,
    enunciado: 'Como você reage a mudanças bruscas de horário?',
    opcoes: [
      { texto: 'Adapto facilmente', peso: 1 },
      { texto: 'Adaptação moderada, levo alguns dias', peso: 2 },
      { texto: 'Tenho muita dificuldade de adaptação', peso: 3 },
    ],
  },
  {
    numero: 12,
    enunciado: 'Qual é a melhor hora para reuniões ou aulas?',
    opcoes: [
      { texto: 'Pela manhã', peso: 1 },
      { texto: 'Início da tarde', peso: 2 },
      { texto: 'Fim da tarde ou noite', peso: 3 },
    ],
  },
  {
    numero: 13,
    enunciado: "Quando você sente um 'pico' de energia?",
    opcoes: [
      { texto: 'Logo ao acordar', peso: 1 },
      { texto: 'Após o almoço', peso: 2 },
      { texto: 'No fim da noite', peso: 3 },
    ],
  },
  {
    numero: 14,
    enunciado: 'Como você costuma programar atividades importantes?',
    opcoes: [
      { texto: 'Sempre primeiro pela manhã', peso: 1 },
      { texto: 'Em horários flexíveis', peso: 2 },
      { texto: 'Prefiro deixar para a noite', peso: 3 },
    ],
  },
  {
    numero: 15,
    enunciado: 'Seu sono é mais profundo em qual período?',
    opcoes: [
      { texto: 'Logo no início da noite', peso: 1 },
      { texto: 'No meio da noite', peso: 2 },
      { texto: 'De madrugada', peso: 3 },
    ],
  },
  {
    numero: 16,
    enunciado: 'Você consideraria acordar às 5h?',
    opcoes: [
      { texto: 'Sim, se preciso, com facilidade', peso: 1 },
      { texto: 'Talvez, com algum esforço', peso: 2 },
      { texto: 'Não, jamais', peso: 3 },
    ],
  },
  {
    numero: 17,
    enunciado: 'No fim de semana, você acorda…',
    opcoes: [
      { texto: 'No mesmo horário de sempre', peso: 1 },
      { texto: 'Uma ou duas horas mais tarde', peso: 2 },
      { texto: 'Muito mais tarde, quase ao meio-dia', peso: 3 },
    ],
  },
  {
    numero: 18,
    enunciado: "Qual período você associa a 'foco máximo'?",
    opcoes: [
      { texto: 'Entre 6h e 10h', peso: 1 },
      { texto: 'Entre 15h e 18h', peso: 2 },
      { texto: 'Entre 21h e 0h', peso: 3 },
    ],
  },
  {
    numero: 19,
    enunciado: 'Como você se sente no fim da tarde?',
    opcoes: [
      { texto: 'Cansado, perdendo rendimento', peso: 1 },
      { texto: 'Energia moderada', peso: 2 },
      { texto: 'Muito disposto, outra vez ativo', peso: 3 },
    ],
  },
  {
    numero: 20,
    enunciado: 'Se você pudesse escolher uma rotina ideal, qual seria?',
    opcoes: [
      { texto: 'Acordar cedo e dormir cedo', peso: 0 },
      { texto: 'Horários intermediários', peso: 2 },
      { texto: 'Acordar tarde e dormir tarde', peso: 4 },
    ],
  },
]
