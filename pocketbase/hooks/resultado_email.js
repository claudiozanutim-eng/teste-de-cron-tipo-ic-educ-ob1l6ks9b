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

    // Cores e emojis por perfil
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
<body style="margin:0;padding:0;background-color:#FAF7F1;font-family:'Inter Tight',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#2B2621;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#FAF7F1;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:580px;background-color:#FFFFFF;border-radius:24px;box-shadow:0 6px 24px rgba(43,38,33,0.06);overflow:hidden;border:1px solid rgba(43,38,33,0.12);" cellspacing="0" cellpadding="0">
          <tr>
            <td style="background-color:#2B2621;padding:28px 32px;text-align:center;">
              <table align="center" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:40px;height:40px;background-color:#E55320;border-radius:50%;text-align:center;vertical-align:middle;color:#ffffff;font-weight:900;font-size:15px;font-family:sans-serif;">
                    ic
                  </td>
                  <td style="padding-left:12px;text-align:left;">
                    <h1 style="margin:0;color:#FAF7F1;font-family:'Fraunces',Georgia,serif;font-size:24px;font-weight:900;letter-spacing:-0.5px;line-height:1.1;">IC Educ</h1>
                    <p style="margin:2px 0 0;color:#E55320;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;">Teste de Cronótipo</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <p style="margin:0 0 16px;font-size:16px;line-height:1.5;color:#2B2621;">
                Olá, <strong>${userName}</strong>!
              </p>
              <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(43,38,33,0.75);">
                Seu Teste de Cronótipo foi concluído com sucesso. Descubra abaixo seu perfil biológico de produtividade e descanso:
              </p>
              <div style="background-color:#FAF7F1;border-left:6px solid ${config.cor};border-radius:14px;padding:24px;margin-bottom:24px;border:1px solid rgba(43,38,33,0.08);border-left-width:6px;border-left-color:${config.cor};">
                <div style="font-size:36px;line-height:1;margin-bottom:8px;">${config.emoji}</div>
                <h2 style="margin:0 0 6px;color:${config.cor};font-family:'Fraunces',Georgia,serif;font-size:26px;font-weight:900;">
                  Seu perfil é: ${perfil}
                </h2>
                <p style="margin:0 0 12px;font-size:13px;color:rgba(43,38,33,0.7);font-style:italic;">
                  ${viaParte1 ? 'Classificação direta pela Parte 1 (7+ afirmações matinais)' : `Pontuação obtida na Parte 2: ${pontuacao} pontos`}
                </p>
                <p style="margin:0;font-size:15px;line-height:1.65;color:#2B2621;">
                  ${config.descricao}
                </p>
              </div>
              <div style="background-color:#FAF7F1;border-radius:12px;padding:16px;margin-bottom:24px;border:1px solid rgba(229,83,32,0.25);border-left:4px solid #E55320;">
                <p style="margin:0;font-size:13px;line-height:1.5;color:#2B2621;">
                  💡 <strong style="color:#E55320;">Dica da IC Educ:</strong> Conhecer seu cronótipo permite planejar estudos, reuniões e momentos de descanso nos horários em que seu cérebro rende melhor.
                </p>
              </div>
              <p style="margin:0;font-size:14px;line-height:1.6;color:rgba(43,38,33,0.7);">
                Você pode acessar sua conta a qualquer momento para baixar seu relatório em PDF ou refazer o teste.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#FAF7F1;padding:20px 32px;text-align:center;border-top:1px solid rgba(43,38,33,0.1);">
              <p style="margin:0;font-size:12px;color:rgba(43,38,33,0.6);">
                © IC Educ • Todos os direitos reservados.
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
