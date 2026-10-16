import { PERFIS_INFO } from '@/types/cronotipo'
import type { ResultadoRecord, UserRecord } from '@/types/cronotipo'

export function gerarRelatorioPDF(resultado: ResultadoRecord, user: UserRecord | null) {
  const info = PERFIS_INFO[resultado.perfil] || PERFIS_INFO.Golfinho
  const dataFormatada = new Date(resultado.created || Date.now()).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const nomeParticipante = user?.name || 'Participante IC Educ'
  const emailParticipante = user?.email || ''

  const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Cronótipo — IC Educ</title>
  <style>
    @page {
      size: A4;
      margin: 20mm;
    }
    body {
      font-family: 'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif;
      color: #2D3436;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      line-height: 1.5;
    }
    .container {
      max-width: 720px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 3px solid #6C5CE7;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      width: 44px;
      height: 44px;
      background: #6C5CE7;
      color: #FFFFFF;
      font-weight: 900;
      font-size: 20px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      line-height: 44px;
    }
    .logo-text h1 {
      margin: 0;
      font-size: 22px;
      font-weight: 800;
      color: #2D3436;
    }
    .logo-text span {
      font-size: 13px;
      font-weight: 600;
      color: #6C5CE7;
    }
    .header-meta {
      text-align: right;
      font-size: 12px;
      color: #636E72;
    }
    .user-card {
      background: #F7F5FF;
      border-radius: 12px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .user-name {
      font-size: 16px;
      font-weight: 700;
      color: #2D3436;
    }
    .user-email {
      font-size: 13px;
      color: #636E72;
    }
    .profile-card {
      border: 2px solid ${info.cor};
      border-radius: 16px;
      padding: 28px;
      background: #FFFFFF;
      margin-bottom: 28px;
    }
    .profile-top {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 16px;
    }
    .profile-emoji {
      font-size: 44px;
      line-height: 1;
    }
    .profile-title {
      font-size: 28px;
      font-weight: 900;
      color: ${info.cor};
      margin: 0;
    }
    .profile-tagline {
      font-size: 14px;
      font-weight: 600;
      color: #636E72;
      margin: 2px 0 0;
    }
    .profile-score {
      display: inline-block;
      margin-top: 8px;
      background: #EDE9FE;
      color: #5A4BD1;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 700;
    }
    .description {
      font-size: 15px;
      line-height: 1.7;
      color: #2D3436;
      margin-top: 16px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 800;
      color: #2D3436;
      margin: 24px 0 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .highlights {
      list-style: none;
      padding: 0;
      margin: 0 0 24px;
    }
    .highlights li {
      padding: 10px 14px;
      background: #FAF9FF;
      border-left: 4px solid #6C5CE7;
      border-radius: 6px;
      margin-bottom: 8px;
      font-size: 14px;
      font-weight: 600;
      color: #2D3436;
    }
    .tip-box {
      background: #FFF9E6;
      border-left: 4px solid #F39C12;
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 30px;
    }
    .tip-box h4 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 800;
      color: #D68910;
    }
    .tip-box p {
      margin: 0;
      font-size: 13px;
      color: #7D6608;
      line-height: 1.5;
    }
    .footer {
      border-top: 1px solid #E0DEE8;
      padding-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #636E72;
      margin-top: 40px;
    }
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo-area">
        <div class="logo-badge">IC</div>
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
