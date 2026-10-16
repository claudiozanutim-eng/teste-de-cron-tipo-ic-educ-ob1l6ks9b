import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { AFIRMACOES_PARTE1 } from '@/data/perguntas'
import { testeService } from '@/services/testeService'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, X, Sparkles, Loader2 } from 'lucide-react'

export default function TesteParte1Page() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [currentIndex, setCurrentIndex] = useState(0)
  const [verdadeiroCount, setVerdadeiroCount] = useState(0)
  const [clickedOption, setClickedOption] = useState<'Verdadeiro' | 'Falso' | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isFinishing, setIsFinishing] = useState(false)
  const [salvandoResposta, setSalvandoResposta] = useState(false)
  const [respostasIds, setRespostasIds] = useState<string[]>([])

  const total = AFIRMACOES_PARTE1.length
  const currentAfirmacao = AFIRMACOES_PARTE1[currentIndex]
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100)

  const handleSelect = async (opcao: 'Verdadeiro' | 'Falso') => {
    if (isTransitioning || isFinishing || salvandoResposta || !user) return

    setClickedOption(opcao)
    setIsTransitioning(true)
    setSalvandoResposta(true)

    const isVerdadeiro = opcao === 'Verdadeiro'
    const newVerdadeiroCount = isVerdadeiro ? verdadeiroCount + 1 : verdadeiroCount
    setVerdadeiroCount(newVerdadeiroCount)

    // Salva resposta imediatamente no PocketBase
    let novaRespostaId = ''
    try {
      const resp = await testeService.salvarResposta({
        usuarioId: user.id,
        parte: '1',
        perguntaNumero: currentAfirmacao.numero,
        resposta: opcao,
        peso: 0,
      })
      novaRespostaId = resp.id
    } catch (err) {
      console.error('Erro ao salvar resposta parte 1:', err)
    } finally {
      setSalvandoResposta(false)
    }

    const updatedIds = novaRespostaId ? [...respostasIds, novaRespostaId] : respostasIds
    setRespostasIds(updatedIds)

    // Delay de 250ms com feedback de pop/flash
    setTimeout(async () => {
      setClickedOption(null)

      if (currentIndex < total - 1) {
        // Próxima afirmação
        setCurrentIndex((prev) => prev + 1)
        setIsTransitioning(false)
      } else {
        // Fim da Parte 1
        setIsFinishing(true)

        if (newVerdadeiroCount >= 7) {
          // Classifica como Golfinho imediatamente!
          try {
            const resultado = await testeService.salvarResultado({
              usuarioId: user.id,
              perfil: 'Golfinho',
              pontuacao: newVerdadeiroCount,
              viaParte1: true,
            })
            if (updatedIds.length > 0) {
              await testeService.vincularRespostasATentativa(updatedIds, resultado.id)
            }
            navigate('/resultado', {
              state: {
                resultadoId: resultado.id,
                novoCalculo: true,
              },
            })
          } catch (resErr) {
            console.error('Erro ao salvar resultado direto:', resErr)
            navigate('/resultado')
          }
        } else {
          // Passa para a Parte 2 levando o histórico de ids de respostas
          sessionStorage.setItem('respostas_parte1_ids', JSON.stringify(updatedIds))
          navigate('/teste/parte2')
        }
      }
    }, 250)
  }

  return (
    <div className="flex-1 flex flex-col justify-center items-center py-4 sm:py-8 max-w-2xl mx-auto w-full">
      {/* Barra de Progresso Superior */}
      <div className="w-full mb-6 sm:mb-8 space-y-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#636E72]">
          <div className="flex items-center gap-1.5 text-[#6C5CE7]">
            <Sparkles className="w-4 h-4 text-[#6C5CE7]" />
            <span>Parte 1 — Afirmações Matinais</span>
          </div>
          <span>
            Afirmação {currentIndex + 1} de {total}
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

      {/* Card da Afirmação Atual */}
      <Card className="w-full border border-[#E0DEE8] shadow-[0_8px_30px_rgba(108,92,231,0.08)] rounded-2xl bg-white overflow-hidden transition-all">
        <CardContent className="p-6 sm:p-10 flex flex-col items-center text-center space-y-8 min-h-[300px] justify-between">
          <div className="space-y-4">
            <span className="inline-block px-3 py-1 rounded-full bg-[#EDE9FE] text-[#6C5CE7] text-xs font-black uppercase tracking-wider">
              Afirmação #{currentAfirmacao.numero}
            </span>

            <h2
              key={currentAfirmacao.numero}
              className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2D3436] leading-snug animate-slide-in-right px-2"
            >
              "{currentAfirmacao.texto}"
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-[#636E72] max-w-md">
            Essa afirmação descreve bem a sua rotina habitual e como você se sente no dia a dia?
          </p>

          {/* Botões Verdadeiro e Falso lado a lado */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full pt-2">
            {/* Botão Verdadeiro */}
            <button
              type="button"
              disabled={isTransitioning || isFinishing}
              onClick={() => handleSelect('Verdadeiro')}
              className={`group relative flex items-center justify-center gap-2 py-4 px-4 sm:px-6 rounded-2xl font-black text-base sm:text-lg transition-all duration-200 border-2 cursor-pointer shadow-md select-none ${
                clickedOption === 'Verdadeiro'
                  ? 'bg-[#27AE60] text-white border-[#27AE60] scale-95 shadow-inner'
                  : 'bg-white hover:bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60] hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  clickedOption === 'Verdadeiro'
                    ? 'bg-white text-[#27AE60]'
                    : 'bg-[#27AE60] text-white'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Verdadeiro</span>
            </button>

            {/* Botão Falso */}
            <button
              type="button"
              disabled={isTransitioning || isFinishing}
              onClick={() => handleSelect('Falso')}
              className={`group relative flex items-center justify-center gap-2 py-4 px-4 sm:px-6 rounded-2xl font-black text-base sm:text-lg transition-all duration-200 border-2 cursor-pointer shadow-md select-none ${
                clickedOption === 'Falso'
                  ? 'bg-[#E74C3C] text-white border-[#E74C3C] scale-95 shadow-inner'
                  : 'bg-white hover:bg-[#E74C3C]/10 text-[#E74C3C] border-[#E74C3C] hover:scale-[1.02] active:scale-95'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                  clickedOption === 'Falso' ? 'bg-white text-[#E74C3C]' : 'bg-[#E74C3C] text-white'
                }`}
              >
                <X className="w-4 h-4 stroke-[3]" />
              </div>
              <span>Falso</span>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Indicador de status final */}
      {isFinishing && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#6C5CE7] animate-fade-in">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Calculando e avançando...</span>
        </div>
      )}

      {/* Legenda explicativa de regra */}
      <div className="mt-6 text-center text-xs text-[#636E72] px-4">
        Responda com sinceridade. Suas escolhas revelam como funciona seu relógio biológico.
      </div>
    </div>
  )
}
