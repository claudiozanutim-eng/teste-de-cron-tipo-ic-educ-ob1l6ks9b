migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    const collection = new Collection({
      name: 'respostas',
      type: 'base',
      listRule:
        "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)",
      viewRule:
        "@request.auth.id != '' && (usuario = @request.auth.id || @request.auth.admin = true)",
      createRule: "@request.auth.id != '' && usuario = @request.auth.id",
      updateRule: '', // Allow update so tentativa relation can be linked after finish (or for answers in flow)
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
          name: 'tentativa',
          type: 'text',
          required: false,
        },
        {
          name: 'parte',
          type: 'select',
          required: true,
          values: ['1', '2'],
          maxSelect: 1,
        },
        {
          name: 'pergunta_numero',
          type: 'number',
          required: true,
          onlyInt: true,
        },
        {
          name: 'resposta',
          type: 'text',
          required: true,
        },
        {
          name: 'peso',
          type: 'number',
          required: true,
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
        'CREATE INDEX idx_respostas_usuario ON respostas (usuario)',
        'CREATE INDEX idx_respostas_created ON respostas (created)',
      ],
    })

    app.save(collection)
  },
  (app) => {
    const collection = app.findCollectionByNameOrId('respostas')
    app.delete(collection)
  },
)
