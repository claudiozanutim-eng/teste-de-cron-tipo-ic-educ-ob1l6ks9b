import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LegalModalsProps {
  termsOpen: boolean
  privacyOpen: boolean
  onTermsChange: (open: boolean) => void
  onPrivacyChange: (open: boolean) => void
}

export const LegalModals: React.FC<LegalModalsProps> = ({
  termsOpen,
  privacyOpen,
  onTermsChange,
  onPrivacyChange,
}) => {
  return (
    <>
      {/* Modal Termos de Uso */}
      <Dialog open={termsOpen} onOpenChange={onTermsChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FAF7F1] text-[#2B2621] border border-[#2B2621]/15 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-fraunces font-bold text-[#2B2621]">
              Termos de Uso — Teste de Cronótipo IC Educ
            </DialogTitle>
            <DialogDescription className="text-sm text-[#2B2621]/60">
              Última atualização: Outubro de 2026
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-[#2B2621] leading-relaxed pt-2">
            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                1. Sobre o Teste e Finalidade Educacional
              </h4>
              <p className="text-[#2B2621]/80">
                O <strong>Teste de Cronótipo IC Educ</strong> é uma ferramenta psicométrica e
                pedagógica desenvolvida para auxiliar estudantes e profissionais a identificarem
                seus picos biológicos de disposição, foco e produtividade ao longo do ciclo
                circadiano (24 horas). O teste baseia-se em conceitos científicos de cronobiologia
                comportamental.
              </p>
              <p className="mt-1 text-xs text-[#2B2621]/60">
                Aviso: Este teste não substitui consultas médicas, diagnósticos clínicos de
                distúrbios do sono ou intervenções terapêuticas profissionais.
              </p>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                2. Cadastro e Acesso à Plataforma
              </h4>
              <p className="text-[#2B2621]/80">
                Para realizar o teste e salvar seu histórico com segurança, é necessário informar
                nome, endereço de e-mail e cadastrar uma senha pessoal e intransferível. O
                participante se responsabiliza pela veracidade dos dados informados.
              </p>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                3. Propriedade Intelectual
              </h4>
              <p className="text-[#2B2621]/80">
                Todos os textos, marcas, identidades visuais, algoritmos de cálculo e materiais
                gerados em formato PDF associados ao <em>Teste de Cronótipo</em> são de titularidade
                exclusiva da <strong>IC Educ</strong>. É vedada a reprodução comercial não
                autorizada.
              </p>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                4. Refação e Modificação do Teste
              </h4>
              <p className="text-[#2B2621]/80">
                O usuário pode refazer o teste a qualquer momento. Novas tentativas são registradas
                no banco de dados para fins de acompanhamento evolutivo, atualizando seu perfil
                principal no sistema.
              </p>
            </section>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => onTermsChange(false)}
              className="bg-[#E55320] hover:bg-[#c94517] text-white rounded-full px-6 font-bold"
            >
              Compreendi e Concordo
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal Política de Privacidade */}
      <Dialog open={privacyOpen} onOpenChange={onPrivacyChange}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-[#FAF7F1] text-[#2B2621] border border-[#2B2621]/15 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-fraunces font-bold text-[#2B2621]">
              Política de Privacidade e Proteção de Dados
            </DialogTitle>
            <DialogDescription className="text-sm text-[#2B2621]/60">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-[#2B2621] leading-relaxed pt-2">
            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                1. Quais dados coletamos
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-[#2B2621]/80">
                <li>
                  <strong>Dados cadastrais:</strong> Nome completo e endereço de e-mail.
                </li>
                <li>
                  <strong>Respostas e resultados:</strong> Opções selecionadas nas Partes 1 e 2 do
                  teste, pontuação final obtida e cronótipo atribuído.
                </li>
                <li>
                  <strong>Metadados técnicos:</strong> Data e horário de conclusão da avaliação.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                2. Finalidade do Tratamento
              </h4>
              <p className="text-[#2B2621]/80">Os dados são coletados exclusivamente para:</p>
              <ul className="list-disc pl-5 space-y-1 mt-1 text-[#2B2621]/80">
                <li>Calcular e apresentar seu cronótipo personalizado na tela e em PDF;</li>
                <li>
                  Enviar por e-mail transacional a cópia oficial do seu resultado com dicas de
                  rotina;
                </li>
                <li>
                  Gerar estatísticas anônimas e agregadas para melhoria contínua dos programas
                  educativos da IC Educ.
                </li>
              </ul>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                3. Armazenamento e Segurança
              </h4>
              <p className="text-[#2B2621]/80">
                Suas informações são armazenadas em servidores seguros com controle estrito de
                acesso e criptografia de senhas. Seus dados nunca são vendidos ou compartilhados com
                terceiros para fins publicitários.
              </p>
            </section>

            <section>
              <h4 className="font-fraunces font-bold text-base text-[#2B2621] mb-1">
                4. Direitos do Titular (LGPD)
              </h4>
              <p className="text-[#2B2621]/80">
                Você tem o direito de solicitar a confirmação da existência de tratamento, acesso
                aos seus dados, correção de dados incompletos ou a exclusão de sua conta a qualquer
                momento mediante solicitação à equipe da IC Educ.
              </p>
            </section>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              onClick={() => onPrivacyChange(false)}
              className="bg-[#E55320] hover:bg-[#c94517] text-white rounded-full px-6 font-bold"
            >
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
