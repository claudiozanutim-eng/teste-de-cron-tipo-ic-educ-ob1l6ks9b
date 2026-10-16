onRecordAfterCreateSuccess((e) => {
  try {
    const record = e.record
    if (!record) return
    const userId = record.getString('usuario')
    if (!userId) return

    let user
    try {
      user = $app.findRecordById('users', userId)
    } catch (err) {
      console.error('[EmailHook] Usuário não encontrado:', userId, err)
      return
    }

    const userEmail = user.getString('email')
    const userName = user.getString('name') || 'Participante'
    if (!userEmail) return

    const perfil = record.getString('perfil')
    const pontuacao = record.getInt('pontuacao')
    const viaParte1 = record.getBool('via_parte1')

    // Cores oficiais dos perfis e descrições
    const perfilConfig = {
      Golfinho: {
        cor: '#F39C12',
        emoji: '🐬',
        resumo:
          'Pessoa de hábitos matinais, com pico de energia logo no início do dia e necessidade de dormir cedo.',
        descricao:
          'Você é uma pessoa de hábitos matinais! Prefere acordar cedo, rende ao máximo nas primeiras horas do dia e sente sono cedo à noite. Seu relógio biológico prioriza começar o dia com energia. Para manter esse pico, busque proteger suas manhãs para as tarefas mais desafiadoras e evite telas antes de dormir.',
      },
      Leão: {
        cor: '#E74C3C',
        emoji: '🦁',
        resumo:
          'Ritmo diurno clássico, produtivo durante a manhã e início da tarde, desacelerando à noite.',
        descricao:
          'Você tem um ritmo diurno clássico: produtivo durante o dia, com pico pela manhã e começo da tarde, e uma queda natural à noite. Prefere horários intermediários, acordando cedo com facilidade. Organize suas tarefas mais complexas antes das 15h para aproveitar seu melhor desempenho.',
      },
      Urso: {
        cor: '#8D6E63',
        emoji: '🐻',
        resumo:
          'Ritmo que acompanha a luz solar, com melhor rendimento no meio do dia e horários flexíveis.',
        descricao:
          'Seu ritmo acompanha o sol: você acorda com relativa facilidade, rende bem no meio do dia e vai desacelerando à tarde. Funciona melhor em horários flexíveis, mas sente queda após o almoço. Aproveite o período entre 10h e 16h para atividades que exigem foco.',
      },
      Lobo: {
        cor: '#34495E',
        emoji: '🐺',
        resumo:
          'Pessoa noturna por natureza, criatividade e rendimento no ápice após o pôr do sol.',
        descricao:
          'Você é uma pessoa noturna por natureza! Seu pico de energia é à noite, e você rende mais quando o sol se põe. Dormir cedo é um desafio, e acordar cedo exige esforço. Agende atividades importantes para o fim da tarde e noite e tente manter uma rotina de sono consistente para aproveitar sua criatividade.',
      },
    }

    const config = perfilConfig[perfil] || perfilConfig['Golfinho']

    // Identidade Visual IC Educ:
    // Fundo bone: #FAF7F1
    // Grafite texto: #2B2621
    // Destaque/Ação: #E55320
    // Tipografia: Fraunces em títulos/perfil, Inter Tight no corpo com fallbacks
    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Seu Resultado — Teste de Cronótipo IC Educ</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,900&family=Inter+Tight:wght@400;600;700&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2B2621;-webkit-font-smoothing:antialiased;">
  <!-- Container Global Fundo Bone #FAF7F1 -->
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF7F1;padding:36px 16px;">
    <tr>
      <td align="center">
        <!-- Card Principal Branco com Borda Grafite Sutil -->
        <table role="presentation" width="100%" style="max-width:580px;background-color:#FFFFFF;border-radius:24px;box-shadow:0 8px 30px rgba(43,38,33,0.06);overflow:hidden;border:1px solid rgba(43,38,33,0.12);" cellspacing="0" cellpadding="0">
          
          <!-- Faixa de Destaque Laranja Oficial #E55320 -->
          <tr>
            <td style="height:6px;background-color:#E55320;line-height:6px;font-size:6px;">&nbsp;</td>
          </tr>

          <!-- Cabeçalho Institucional IC Educ -->
          <tr>
            <td style="background-color:#FAF7F1;padding:28px 32px;border-bottom:1px solid rgba(43,38,33,0.08);text-align:center;">
              <table align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:44px;height:44px;background-color:#E55320;border-radius:50%;text-align:center;vertical-align:middle;color:#FAF7F1;font-weight:900;font-size:16px;font-family:'Fraunces',Georgia,serif;letter-spacing:-0.5px;">
                    ic
                  </td>
                  <td style="padding-left:14px;text-align:left;">
                    <div style="margin:0;color:#2B2621;font-family:'Fraunces',Georgia,serif;font-size:22px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">IC Educ</div>
                    <div style="margin:3px 0 0;color:#E55320;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;font-family:'Inter Tight',sans-serif;">Teste de Cronótipo</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Corpo do Email -->
          <tr>
            <td style="padding:32px 36px;">
              <p style="margin:0 0 14px;font-size:16px;line-height:1.5;color:#2B2621;font-family:'Inter Tight',sans-serif;">
                Olá, <strong>${userName}</strong>!
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(43,38,33,0.8);font-family:'Inter Tight',sans-serif;">
                Seu Teste de Cronótipo foi concluído com sucesso. Descubra abaixo seu perfil biológico de produtividade e descanso:
              </p>

              <!-- Bloco Destaque do Perfil Encontrado -->
              <div style="background-color:#FAF7F1;border-radius:18px;padding:24px;margin-bottom:24px;border:1px solid rgba(43,38,33,0.1);border-left:6px solid ${config.cor};">
                <div style="font-size:38px;line-height:1;margin-bottom:10px;">${config.emoji}</div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:rgba(43,38,33,0.6);margin-bottom:4px;font-family:'Inter Tight',sans-serif;">Seu Perfil Circadiano</div>
                <h2 style="margin:0 0 8px;color:${config.cor};font-family:'Fraunces',Georgia,serif;font-size:28px;font-weight:900;letter-spacing:-0.5px;">
                  ${perfil}
                </h2>
                <p style="margin:0 0 14px;font-size:13px;color:rgba(43,38,33,0.65);font-style:italic;font-family:'Inter Tight',sans-serif;">
                  ${viaParte1 ? 'Classificação direta pela Parte 1 (7+ afirmações matinais)' : `Pontuação obtida na Parte 2: ${pontuacao} pontos`}
                </p>
                <p style="margin:0;font-size:15px;line-height:1.65;color:#2B2621;font-family:'Inter Tight',sans-serif;">
                  ${config.descricao}
                </p>
              </div>

              <!-- Caixa de Dica da IC Educ -->
              <div style="background-color:#FAF7F1;border-radius:14px;padding:18px 20px;margin-bottom:26px;border:1px solid rgba(229,83,32,0.25);border-left:4px solid #E55320;">
                <p style="margin:0;font-size:13px;line-height:1.55;color:#2B2621;font-family:'Inter Tight',sans-serif;">
                  💡 <strong style="color:#E55320;">Recomendação Prática IC Educ:</strong> Conhecer seu cronótipo permite planejar estudos, reuniões e momentos de descanso nos horários em que seu cérebro rende melhor.
                </p>
              </div>

              <!-- Botão de Ação Laranja #E55320 -->
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:0 auto 24px auto;">
                <tr>
                  <td align="center" style="border-radius:50px;background-color:#E55320;">
                    <a href="https://teste-de-cronotipo-ic-educ-12bfb.shrd01.internal.goskip.dev" target="_blank" style="display:inline-block;padding:14px 28px;font-family:'Inter Tight',sans-serif;font-size:14px;font-weight:700;color:#FFFFFF;text-decoration:none;border-radius:50px;text-align:center;">
                      Acessar Meu Painel e Baixar PDF
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;line-height:1.6;color:rgba(43,38,33,0.7);text-align:center;font-family:'Inter Tight',sans-serif;">
                Você pode acessar sua conta a qualquer momento para refazer o teste ou baixar seu relatório em PDF.
              </p>
            </td>
          </tr>

          <!-- Rodapé Institucional -->
          <tr>
            <td style="background-color:#FAF7F1;padding:22px 32px;text-align:center;border-top:1px solid rgba(43,38,33,0.08);">
              <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:#2B2621;font-family:'Inter Tight',sans-serif;">
                IC Educ • Teste de Cronótipo
              </p>
              <p style="margin:0;font-size:11px;color:rgba(43,38,33,0.55);font-family:'Inter Tight',sans-serif;">
                © IC Educ — Todos os direitos reservados.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

    try {
      const message = new MailerMessage({
        from: {
          address: $app.settings().meta.senderAddress || 'noreply@iceduc.com.br',
          name: $app.settings().meta.senderName || 'IC Educ',
        },
        to: [{ address: userEmail, name: userName }],
        subject: `Seu Perfil de Cronótipo: ${perfil} ${config.emoji} — IC Educ`,
        html: html,
      })

      $app.newMailClient().send(message)
      console.log(`[EmailHook] Email de resultado enviado para ${userEmail} (${perfil})`)
    } catch (mailErr) {
      console.error('[EmailHook] Erro no envio do email:', mailErr)
    }

    // Atualiza também o campo ultimo_perfil no registro de usuário
    try {
      user.set('ultimo_perfil', perfil)
      $app.save(user)
    } catch (saveErr) {
      console.warn('[EmailHook] Não foi possível atualizar ultimo_perfil do usuário:', saveErr)
    }
  } catch (err) {
    console.error('[EmailHook] Erro geral no hook:', err)
  } finally {
    return e.next()
  }
}, 'resultados')
