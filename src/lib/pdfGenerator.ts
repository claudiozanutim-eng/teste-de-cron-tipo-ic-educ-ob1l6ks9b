import { jsPDF } from 'jspdf'
import { PERFIS_INFO } from '@/types/cronotipo'
import type { ResultadoRecord, UserRecord, PerfilCronotipo } from '@/types/cronotipo'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

// Cores Oficiais IC Educ
const COLORS = {
  bone: '#FAF7F1',
  grafite: '#2B2621',
  laranja: '#E55320',
  white: '#FFFFFF',
  border: '#E8E2D8',
  subtleText: '#6D655E',
  lightGray: '#F3EFE7',
}

interface RGB {
  r: number
  g: number
  b: number
}

function hexToRgb(hex: string): RGB {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255,
  }
}

/**
 * Converte a imagem do logo para DataURL base64 para inclusão no PDF
 */
async function getLogoDataUrl(): Promise<string | null> {
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = img.naturalWidth || img.width || 120
          canvas.height = img.naturalHeight || img.height || 120
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            resolve(null)
            return
          }
          // Garante círculo ou fundo transparente
          ctx.drawImage(img, 0, 0)
          const dataUrl = canvas.toDataURL('image/png')
          resolve(dataUrl)
        } catch {
          resolve(null)
        }
      }
      img.onerror = () => resolve(null)
      img.src = icLogo
    })
  } catch {
    return null
  }
}

/**
 * Sanitiza o nome do arquivo para download confiável em todos os SOs e navegadores
 */
export function sanitizeFilename(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Gera e baixa o relatório em formato PDF profissional
 */
export async function gerarRelatorioPDF(
  resultado: ResultadoRecord,
  user: UserRecord | null,
): Promise<void> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const perfilKey: PerfilCronotipo = resultado.perfil || 'Golfinho'
  const info = PERFIS_INFO[perfilKey] || PERFIS_INFO.Golfinho

  const nomeParticipante = (
    user?.name ||
    user?.email?.split('@')[0] ||
    'Participante IC Educ'
  ).trim()
  const emailParticipante = user?.email || ''

  const dataObj = resultado.created ? new Date(resultado.created) : new Date()
  const dataFormatada = dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const logoDataUrl = await getLogoDataUrl()

  const pageWidth = 210
  const pageHeight = 297
  const margin = 16
  const contentWidth = pageWidth - margin * 2 // 178 mm

  // 1. Fundo Bone Completo
  const boneRgb = hexToRgb(COLORS.bone)
  doc.setFillColor(boneRgb.r, boneRgb.g, boneRgb.b)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Faixa superior decorativa Laranja IC Educ
  const laranjaRgb = hexToRgb(COLORS.laranja)
  doc.setFillColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.rect(0, 0, pageWidth, 4, 'F')

  let currentY = 12

  // 2. CABEÇALHO com Logo IC Educ
  const headerHeight = 24
  const headerBoxY = currentY

  // Logo da IC Educ
  const logoSize = 18
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin, headerBoxY, logoSize, logoSize)
    } catch {
      drawFallbackLogo(doc, margin, headerBoxY, logoSize)
    }
  } else {
    drawFallbackLogo(doc, margin, headerBoxY, logoSize)
  }

  // Título e Subtítulo da Marca
  const grafiteRgb = hexToRgb(COLORS.grafite)
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('times', 'bold')
  doc.setFontSize(22)
  doc.text('IC Educ', margin + logoSize + 4, headerBoxY + 8)

  doc.setTextColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('TESTE DE CRONÓTIPO • RELATÓRIO OFICIAL', margin + logoSize + 4, headerBoxY + 14)

  // Metadados no canto direito do cabeçalho
  doc.setTextColor(COLORS.subtleText)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  const metaLine1 = `Data: ${dataFormatada}`
  const metaLine2 = `Código: #${(resultado.id || 'ICEDUC').substring(0, 8).toUpperCase()}`
  doc.text(metaLine1, pageWidth - margin, headerBoxY + 8, { align: 'right' })
  doc.text(metaLine2, pageWidth - margin, headerBoxY + 14, { align: 'right' })

  // Linha separadora discreta do cabeçalho
  currentY = headerBoxY + headerHeight + 2
  const borderRgb = hexToRgb(COLORS.border)
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
  doc.setLineWidth(0.4)
  doc.line(margin, currentY, pageWidth - margin, currentY)

  currentY += 6

  // 3. CARTÃO DO PARTICIPANTE (Fundo Branco Arredondado)
  const userCardHeight = 18
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, currentY, contentWidth, userCardHeight, 3, 3, 'FD')

  // Nome e Email
  doc.setTextColor(COLORS.subtleText)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('PARTICIPANTE', margin + 6, currentY + 6)

  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('times', 'bold')
  doc.setFontSize(12)
  doc.text(nomeParticipante, margin + 6, currentY + 12)

  if (emailParticipante) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor(COLORS.subtleText)
    doc.text(emailParticipante, margin + 70, currentY + 12)
  }

  // Tag de Status
  doc.setFillColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.roundedRect(pageWidth - margin - 38, currentY + 5, 32, 8, 2, 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('AVALIAÇÃO OFICIAL', pageWidth - margin - 22, currentY + 10.5, { align: 'center' })

  currentY += userCardHeight + 6

  // 4. CARTÃO DE DESTAQUE DO PERFIL (Com a cor temática do animal)
  const perfilCorRgb = hexToRgb(info.cor)

  // Altura dinâmica calculada a partir do texto descritivo
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  const descLinhas = doc.splitTextToSize(info.descricao, contentWidth - 14)
  const descHeight = descLinhas.length * 4.8
  const profileCardHeight = 44 + descHeight

  // Fundo branco com borda na cor do perfil
  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(perfilCorRgb.r, perfilCorRgb.g, perfilCorRgb.b)
  doc.setLineWidth(0.8)
  doc.roundedRect(margin, currentY, contentWidth, profileCardHeight, 4, 4, 'FD')

  // Faixa esquerda temática
  doc.setFillColor(perfilCorRgb.r, perfilCorRgb.g, perfilCorRgb.b)
  doc.roundedRect(margin, currentY, 4, profileCardHeight, 2, 2, 'F')

  // Círculo com Emoji / Nome do Animal
  const avatarX = margin + 8
  const avatarY = currentY + 8
  const avatarRadius = 11
  doc.setFillColor(perfilCorRgb.r, perfilCorRgb.g, perfilCorRgb.b)
  doc.circle(avatarX + avatarRadius, avatarY + avatarRadius, avatarRadius, 'F')

  // Emoji ou Inicial do Cronótipo dentro do círculo
  doc.setTextColor(255, 255, 255)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(info.emoji, avatarX + avatarRadius, avatarY + avatarRadius + 5, { align: 'center' })

  // Título do Perfil em Grande Destaque
  const profileTextX = avatarX + avatarRadius * 2 + 8
  doc.setTextColor(COLORS.subtleText)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text('SEU CRONÓTIPO BIOLÓGICO', profileTextX, currentY + 10)

  doc.setTextColor(perfilCorRgb.r, perfilCorRgb.g, perfilCorRgb.b)
  doc.setFont('times', 'bold')
  doc.setFontSize(24)
  doc.text(info.perfil, profileTextX, currentY + 20)

  // Tagline
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(info.tagline, profileTextX, currentY + 26)

  // Badge da pontuação / método
  const badgeText = resultado.via_parte1
    ? 'Classificação Direta: Parte 1 (7+ Afirmações Matinais)'
    : `Pontuação na Parte 2: ${resultado.pontuacao} pontos`
  doc.setFillColor(boneRgb.r, boneRgb.g, boneRgb.b)
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
  doc.setLineWidth(0.2)
  doc.roundedRect(profileTextX, currentY + 29, 90, 6.5, 1.5, 1.5, 'FD')
  doc.setTextColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.text(badgeText, profileTextX + 4, currentY + 33.5)

  // Linha sutil separando descrição dentro do card
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
  doc.setLineWidth(0.3)
  doc.line(margin + 6, currentY + 38, pageWidth - margin - 6, currentY + 38)

  // Descrição Completa conforme o gabarito
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9.5)
  doc.text(descLinhas, margin + 8, currentY + 45)

  currentY += profileCardHeight + 6

  // 5. PADRÕES E DESTAQUES BIOLÓGICOS (Pontos-chave)
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('times', 'bold')
  doc.setFontSize(13)
  doc.text('Padrões e Características Marcantes', margin, currentY + 4)

  currentY += 7

  info.pontosChave.forEach((ponto) => {
    // Card para cada item
    const pontoHeight = 11
    doc.setFillColor(255, 255, 255)
    doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, currentY, contentWidth, pontoHeight, 2, 2, 'FD')

    // Borda esquerda laranja
    doc.setFillColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
    doc.roundedRect(margin, currentY, 3, pontoHeight, 1.5, 1.5, 'F')

    // Ícone de check
    doc.setTextColor(39, 174, 96) // Verde elegante
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('✔', margin + 6, currentY + 7.5)

    // Texto do ponto
    doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8.5)
    doc.text(ponto, margin + 12, currentY + 7.2)

    currentY += pontoHeight + 2.5
  })

  currentY += 2

  // 6. CAIXA DE DICA E RECOMENDAÇÃO IC EDUC
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  const dicaLinhas = doc.splitTextToSize(info.dicaRotina, contentWidth - 22)
  const dicaBoxHeight = 18 + dicaLinhas.length * 4.5

  doc.setFillColor(255, 255, 255)
  doc.setDrawColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.setLineWidth(0.6)
  doc.roundedRect(margin, currentY, contentWidth, dicaBoxHeight, 3, 3, 'FD')

  // Borda esquerda laranja cheia
  doc.setFillColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.roundedRect(margin, currentY, 4, dicaBoxHeight, 2, 2, 'F')

  // Ícone de lâmpada e título
  doc.setTextColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9.5)
  doc.text('💡  Recomendação Prática de Rotina IC Educ', margin + 8, currentY + 7)

  // Conteúdo da dica
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.text(dicaLinhas, margin + 8, currentY + 13)

  // 7. RODAPÉ INSTITUCIONAL IC EDUC
  const footerY = pageHeight - 18

  // Linha superior do rodapé
  doc.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b)
  doc.setLineWidth(0.3)
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4)

  // Linha 1: Marca e Copyright
  doc.setTextColor(grafiteRgb.r, grafiteRgb.g, grafiteRgb.b)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  const footerTitle = 'IC Educ • Formação e Desenvolvimento Humano • Todos os direitos reservados'
  doc.text(footerTitle, pageWidth / 2, footerY, { align: 'center' })

  // Linha 2: Informações Institucionais e Plataforma
  doc.setTextColor(COLORS.subtleText)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  const footerMeta =
    'Relatório emitido através da plataforma oficial Teste de Cronótipo IC Educ • Suporte: contato@iceduc.com.br'
  doc.text(footerMeta, pageWidth / 2, footerY + 4.5, { align: 'center' })

  // Nome do arquivo padronizado e seguro para download
  const nomeSanitizado = sanitizeFilename(nomeParticipante)
  const perfilSanitizado = sanitizeFilename(info.perfil)
  const fileName = `resultado-cronotipo-${perfilSanitizado}-${nomeSanitizado}.pdf`

  // 8. Download confiável para mobile e desktop
  salvarPdfCrossPlatform(doc, fileName)
}

/**
 * Fallback visual caso a imagem não carregue
 */
function drawFallbackLogo(doc: jsPDF, x: number, y: number, size: number) {
  const laranjaRgb = hexToRgb(COLORS.laranja)
  doc.setFillColor(laranjaRgb.r, laranjaRgb.g, laranjaRgb.b)
  doc.circle(x + size / 2, y + size / 2, size / 2, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFont('times', 'bold')
  doc.setFontSize(11)
  doc.text('ic', x + size / 2, y + size / 2 + 3.5, { align: 'center' })
}

/**
 * Salva o PDF com estratégia robusta para mobile (Safari iOS, Chrome Android) e desktop
 */
function salvarPdfCrossPlatform(doc: jsPDF, fileName: string): void {
  try {
    // 1. Tenta o método nativo doc.save() que usa FileSaver sob o capô
    doc.save(fileName)
  } catch (error) {
    console.warn('doc.save() falhou, tentando fallback com Blob:', error)
    try {
      const blob = doc.output('blob')
      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = fileName
      link.target = '_blank'
      link.rel = 'noopener'
      document.body.appendChild(link)
      link.click()

      setTimeout(() => {
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      }, 30000)
    } catch (fallbackError) {
      console.error('Falha no fallback de download:', fallbackError)
      // Fallback final: abre em nova aba
      const dataUri = doc.output('datauristring')
      window.open(dataUri, '_blank')
    }
  }
}
