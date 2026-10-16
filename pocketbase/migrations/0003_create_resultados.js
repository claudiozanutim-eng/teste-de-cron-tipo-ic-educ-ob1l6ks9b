migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'resultados',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)",
      viewRule:
        "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)",
      createRule: "@request.auth.id != '' && usuario = @request.auth.id",
      updateRule: null,
      deleteRule: null,
      fields: [
        {
          name: 'usuario',
          type: 'relation',
          required: true,
          collectionId: users.id,
          cascadeDelete: true,
          maxSelect: 1,
        },
        {
          name: 'perfil',
          type: 'select',
          required: true,
          values: ['Golfinho', 'Leão', 'Urso', 'Lobo'],
          maxSelect: 1,
        },
        {
          name: 'pontuacao',
          type: 'number',
          required: true,
        },
        {
          name: 'via_parte1',
          type: 'bool',
          required: false,
        },
        {
          name: 'created',
          type: 'autodate',
          onCreate: true,
          onUpdate: false,
        },
        {
          name: 'updated',
          type: 'autodate',
          onCreate: true,
          onUpdate: true,
        },
      ],
      indexes: [
        'CREATE INDEX idx_resultados_usuario ON resultados (usuario)',
        'CREATE INDEX idx_resultados_perfil ON resultados (perfil)',
      ],
    })

    app.save(collection)

    // Now that resultados exists, update respostas collection to point tentativa as relation if desired, or keep as relation
    const respostas = app.findCollectionByNameOrId('respostas')
    const tentativaField = respostas.fields.getByName('tentativa')
    if (tentativaField) {
      respostas.fields.removeByName('tentativa')
      respostas.fields.add(
        new RelationField({
          name: 'tentativa',
          required: false,
          collectionId: collection.id,
          cascadeDelete: false,
          maxSelect: 1,
        }),
      )
      app.save(respostas)
    }
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('resultados')
    app.delete(collection)
  },
)
