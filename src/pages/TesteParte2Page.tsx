import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { PERGUNTAS_PARTE2 } from '@/data/perguntas'
import { testeService } from '@/services/testeService'
import type { PerfilCronotipo } from '@/types/cronotipo'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Sparkles, Loader2 } from 'lucide-react'

export default function TesteParte2Page() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null)
  const [somaPesos, setSomaPesos] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [respostasParte2Ids, setRespostasParte2Ids] = useState<string[]>([])

  const total = PERGUNTAS_PARTE2.length
  const currentPergunta = PERGUNTAS_PARTE2[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100)

  // Função para classificar de acordo com a regra exata da especificação:
  // 1 a 19 = Golfinho, 20 a 32 = Leão, 33 a 47 = Urso, 48 a 61 = Lobo
  const calcularPerfil = (pontos: number): PerfilCronotipo => {
    if (pontos <= 19) return 'Golfinho'
    if (pontos <= 32) return 'Leão'
    if (pontos <= 47) return 'Urso'
    return 'Lobo'
  }

  const handleSelectOption = (idx: number) => {
    if (isTransitioning || isFinishing) return
    setSelectedOptionIndex(idx)
  }

  const handleNext = async () => {
    if (selectedOptionIndex === null || isTransitioning || isFinishing || !user) return

    setIsTransitioning(true)

    const opcaoEscolhida = currentPergunta.opcoes[selectedOptionIndex]
    const pesoEscolhido = opcaoEscolhida.peso
    const novaSoma = somaPesos + pesoEscolhido
    setSomaPesos(novaSoma)

    // Salva resposta imediatamente no PocketBase
    let respostaId = ''
    try {
      const resp = await testeService.salvarResposta({
        usuarioId: user.id,
        parte: '2',
        perguntaNumero: currentPergunta.numero,
        resposta: opcaoEscolhida.texto,
        peso: pesoEscolhido,
      })
      respostaId = resp.id
    } catch (err) {
      console.error('Erro ao salvar resposta parte 2:', err)
    }

    const updatedIds = respostaId ? [...respostasParte2Ids, respostaId] : respostasParte2Ids
    setRespostasParte2Ids(updatedIds)

    if (currentIndex < total - 1) {
      // Avança para a próxima pergunta com slide
      setTimeout(() => {
        setSelectedOptionIndex(null)
        setCurrentIndex((prev) => prev + 1)
        setIsTransitioning(false)
      }, 200)
    } else {
      // Fim do teste: calcula perfil e grava resultado
      setIsFinishing(true)
      const perfilFinal = calcularPerfil(novaSoma)

      try {
        const resultado = await testeService.salvarResultado({
          usuarioId: user.id,
          perfil: perfilFinal,
          pontuacao: novaSoma,
          viaParte1: false,
        })

        // Recupera também os IDs da Parte 1 se existirem
        let allIds = [...updatedIds]
        try {
          const p1Raw = sessionStorage.getItem('respostas_parte1_ids')
          if (p1Raw) {
            const p1Ids = JSON.parse(p1Raw) as string[]
            allIds = [...p1Ids, ...allIds]
            sessionStorage.removeItem('respostas_parte1_ids')
          }
        } catch {
          /* intentionally ignored */
        }

        if (allIds.length > 0) {
          await testeService.vincularRespostasATentativa(allIds, resultado.id)
        }

        navigate('/resultado', {
          state: {
            resultadoId: resultado.id,
            novoCalculo: true,
          },
        })
      } catch (saveErr) {
        console.error('Erro ao salvar resultado final:', saveErr)
        navigate('/resultado')
      }
    }
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-8 max-w-2xl mx-auto w-full">
      {/* Barra de Progresso Superior */}
      <div className="w-full mb-6 sm:mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#636E72]">
          <div className="flex items-center gap-1.5 text-[#6C5CE7]">
            <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
            <span>Parte 2 — Hábitos e Preferências</span>
          </div>
          <span>
            Pergunta {currentIndex + 1} de {total}
          </span>
        </div>

        {/* Trilho de Progresso */}
        <div className="h-3 w-full bg-[#E0DEE8] rounded-full overflow-hidden p-0.5">
          <div
            className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#8E44AD] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Card da Pergunta Atual */}
      <Card className="w-full border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden transition-all">
        <CardContent className="p-6 sm:p-8 flex flex-col space-y-6">
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6C5CE7] text-xs font-black uppercase tracking-wider">
              Pergunta #{currentPergunta.numero}
            </span>

            <h2
              key={currentPergunta.numero}
              className="text-xl sm:text-2xl font-extrabold text-[#2D3436] leading-snug animate-slide-in-right"
            >
              {currentPergunta.enunciado}
            </h2>
          </div>

          {/* Opções de múltipla escolha (3 opções empilhadas) */}
          <div className="space-y-3 pt-2">
            {currentPergunta.opcoes.map((opcao, idx) => {
              const isSelected = selectedOptionIndex === idx
              const letras = ['A', 'B', 'C']

              return (
                <button
                  type="button"
                  key={idx}
                  disabled={isTransitioning || isFinishing}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none ${
                    isSelected
                      ? 'border-[#6C5CE7] bg-[#EDE9FE]/50 shadow-[0_4px_16px_rgba(108,92,231,0.15)] scale-[1.01]'
                      : 'border-[#E0DEE8] bg-white hover:border-[#6C5CE7]/40 hover:bg-[#F7F5FF] shadow-sm hover:translate-y-[-1px]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0 ${
                        isSelected
                          ? 'bg-[#6C5CE7] text-white shadow-sm'
                          : 'bg-[#F7F5FF] text-[#636E72] border border-[#E0DEE8]'
                      }`}
                    >
                      {letras[idx]}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-[#2D3436] leading-snug">
                      {opcao.texto}
                    </span>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'border-[#6C5CE7] bg-[#6C5CE7] text-white scale-110'
                        : 'border-[#E0DEE8] bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Botão Próxima Pergunta */}
          <div className="pt-4 flex justify-end">
            <Button
              type="button"
              onClick={handleNext}
              disabled={selectedOptionIndex === null || isTransitioning || isFinishing}
              className="h-12 px-8 bg-[#6C5CE7] hover:bg-[#5A4BD1] text-white font-bold rounded-full shadow-[0_4px_14px_rgba(108,92,231,0.25)] hover:shadow-[0_6px_20px_rgba(108,92,231,0.35)] transition-all disabled:opacity-40"
            >
              {isFinishing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando resultado...
                </>
              ) : currentIndex === total - 1 ? (
                <>
                  Ver meu Resultado
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Próxima pergunta
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
