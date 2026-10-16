import { PERFIS_INFO } from '@/types/cronotipo'
import type { ResultadoRecord, UserRecord } from '@/types/cronotipo'
import icLogo from '@/assets/ic-educ-oficial-avatar-e53cf.png'

export function gerarRelatorioPDF(resultado: ResultadoRecord, user: UserRecord | null) {
  const info = PERFIS_INFO[resultado.perfil] || PERFIS_INFO.Golfinho
  const dataFormatada = new Date(resultado.created || Date.now()).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const nomeParticipante = user?.name || 'Participante IC Educ'
  const emailParticipante = user?.email || ''

  // Logo em base64 ou URL absoluta para impressão
  const logoUrl = window.location.origin + icLogo

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Cronótipo — IC Educ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Inter+Tight:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 18mm;
    }
    body {
      font-family: 'Inter Tight', -apple-system, Roboto, Helvetica, Arial, sans-serif;
      color: #2B2621;
      background: #FAF7F1;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
      background: #FAF7F1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid rgba(43, 38, 33, 0.15);
      padding-bottom: 18px;
      margin-bottom: 24px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      object-fit: contain;
    }
    .logo-text h1 {
      margin: 0;
      font-family: 'Fraunces', serif;
      font-size: 24px;
      font-weight: 900;
      color: #2B2621;
      letter-spacing: -0.5px;
    }
    .logo-text span {
      font-size: 12px;
      font-weight: 600;
      color: #E55320;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header-meta {
      text-align: right;
      font-size: 11px;
      color: rgba(43, 38, 33, 0.7);
    }
    .user-card {
      background: #FFFFFF;
      border: 1px solid rgba(43, 38, 33, 0.12);
      border-radius: 12px;
      padding: 14px 20px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-name {
      font-size: 15px;
      font-weight: 700;
      color: #2B2621;
    }
    .user-email {
      font-size: 12px;
      color: rgba(43, 38, 33, 0.65);
    }
    .profile-card {
      border: 2px solid ${info.cor};
      border-radius: 16px;
      padding: 24px;
      background: #FFFFFF;
      margin-bottom: 20px;
    }
    .profile-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 14px;
    }
    .profile-emoji {
      font-size: 44px;
      line-height: 1;
    }
    .profile-title {
      font-family: 'Fraunces', serif;
      font-size: 30px;
      font-weight: 900;
      color: ${info.cor};
      margin: 0;
    }
    .profile-tagline {
      font-size: 13px;
      font-weight: 600;
      color: rgba(43, 38, 33, 0.75);
      margin: 2px 0 0;
    }
    .profile-score {
      display: inline-block;
      margin-top: 8px;
      background: #FAF7F1;
      border: 1px solid rgba(229, 83, 32, 0.3);
      color: #E55320;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }
    .description {
      font-size: 14px;
      line-height: 1.6;
      color: #2B2621;
      margin-top: 14px;
    }
    .section-title {
      font-family: 'Fraunces', serif;
      font-size: 16px;
      font-weight: 800;
      color: #2B2621;
      margin: 20px 0 10px;
    }
    .highlights {
      list-style: none;
      padding: 0;
      margin: 0 0 20px;
    }
    .highlights li {
      padding: 9px 12px;
      background: #FFFFFF;
      border-left: 4px solid #E55320;
      border-radius: 6px;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 600;
      color: #2B2621;
      border: 1px solid rgba(43, 38, 33, 0.08);
      border-left-width: 4px;
      border-left-color: #E55320;
    }
    .tip-box {
      background: #FFFFFF;
      border-left: 4px solid #E55320;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 24px;
      border: 1px solid rgba(43, 38, 33, 0.1);
      border-left-width: 4px;
      border-left-color: #E55320;
    }
    .tip-box h4 {
      margin: 0 0 4px;
      font-size: 13px;
      font-weight: 800;
      color: #E55320;
    }
    .tip-box p {
      margin: 0;
      font-size: 12.5px;
      color: #2B2621;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid rgba(43, 38, 33, 0.15);
      padding-top: 16px;
      text-align: center;
      font-size: 11px;
      color: rgba(43, 38, 33, 0.65);
      margin-top: 30px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background: #FAF7F1 !important;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <img src="${logoUrl}" alt="IC Educ" class="logo-img" />
        <div class="logo-text">
          <h1>IC Educ</h1>
          <span>Relatório Oficial de Cronótipo</span>
        </div>
      </div>
      <div class="header-meta">
        <div><strong>Data de Emissão:</strong> ${dataFormatada}</div>
        <div>Código: #${resultado.id.substring(0, 8).toUpperCase()}</div>
      </div>
    </div>

    <div class="user-card">
      <div>
        <div class="user-name">${nomeParticipante}</div>
        <div class="user-email">${emailParticipante}</div>
      </div>
      <div style="text-align: right;">
        <span style="font-size: 12px; color: #636E72;">Avaliação Concluída</span>
      </div>
    </div>

    <div class="profile-card">
      <div class="profile-top">
        <div class="profile-emoji">${info.emoji}</div>
        <div>
          <h2 class="profile-title">${info.perfil}</h2>
          <div class="profile-tagline">${info.tagline}</div>
          <div class="profile-score">
            ${
              resultado.via_parte1
                ? 'Classificação Direta pela Parte 1 (7+ Afirmações Matinais)'
                : `Pontuação Parte 2: ${resultado.pontuacao} pontos`
            }
          </div>
        </div>
      </div>

      <div class="description">
        ${info.descricao}
      </div>
    </div>

    <div class="section-title">Padrões e Destaques Biológicos</div>
    <ul class="highlights">
      ${info.pontosChave.map((pt) => `<li>✔ ${pt}</li>`).join('')}
    </ul>

    <div class="tip-box">
      <h4>💡 Recomendação de Rotina IC Educ</h4>
      <p>${info.dicaRotina}</p>
    </div>

    <div class="footer">
      <div>© IC Educ • Todos os direitos reservados • Formação e Desenvolvimento Humano</div>
      <div style="margin-top: 4px; font-size: 11px; color: #8E9296;">Este relatório foi gerado automaticamente através da plataforma Teste de Cronótipo IC Educ.</div>
    </div>
  </div>
  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 300);
    };
  </script>
</body>
</html>
`

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  } else {
    // Fallback: se popup bloqueado, abre num iframe oculto
    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)
    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
    }
  }
}
