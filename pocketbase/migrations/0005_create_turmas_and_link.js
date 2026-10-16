migrate(
  (app) => {
    // 1. Criar coleção 'turmas'
    let turmas
    try {
      turmas = app.findCollectionByNameOrId('turmas')
    } catch (_) {
      turmas = new Collection({
        name: 'turmas',
        type: 'base',
        listRule: "@request.auth.id != ''",
        viewRule: "@request.auth.id != ''",
        createRule: "@request.auth.id != '' && @request.auth.admin = true",
        updateRule: "@request.auth.id != '' && @request.auth.admin = true",
        deleteRule: "@request.auth.id != '' && @request.auth.admin = true",
        fields: [
          { name: 'nome', type: 'text', required: true },
          { name: 'data', type: 'text', required: false },
          { name: 'created', type: 'autodate', onCreate: true, onUpdate: false },
          { name: 'updated', type: 'autodate', onCreate: true, onUpdate: true },
        ],
        indexes: ['CREATE INDEX idx_turmas_nome ON turmas (nome)'],
      })
      app.save(turmas)
      turmas = app.findCollectionByNameOrId('turmas')
    }

    // 2. Adicionar campo 'turma' na coleção 'users'
    const users = app.findCollectionByNameOrId('users')
    if (!users.fields.getByName('turma')) {
      users.fields.add(
        new RelationField({
          name: 'turma',
          required: false,
          collectionId: turmas.id,
          maxSelect: 1,
        }),
      )
    }

    // Permitir que admins atualizem e excluam registros de usuários
    users.updateRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.admin = true)"
    users.deleteRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.admin = true)"

    app.save(users)

    // 3. Adicionar campo 'turma' na coleção 'resultados'
    const resultados = app.findCollectionByNameOrId('resultados')
    if (!resultados.fields.getByName('turma')) {
      resultados.fields.add(
        new RelationField({
          name: 'turma',
          required: false,
          collectionId: turmas.id,
          maxSelect: 1,
        }),
      )
    }

    // Permitir update e delete por admin para manutenção consistente
    resultados.updateRule =
      "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)"
    resultados.deleteRule =
      "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)"

    app.save(resultados)
  },
  (app) => {
    try {
      const users = app.findCollectionByNameOrId('users')
      if (users.fields.getByName('turma')) {
        users.fields.removeByName('turma')
        app.save(users)
      }
    } catch (_) {}

    try {
      const resultados = app.findCollectionByNameOrId('resultados')
      if (resultados.fields.getByName('turma')) {
        resultados.fields.removeByName('turma')
        app.save(resultados)
      }
    } catch (_) {}

    try {
      const turmas = app.findCollectionByNameOrId('turmas')
      app.delete(turmas)
    } catch (_) {}
  },
)
