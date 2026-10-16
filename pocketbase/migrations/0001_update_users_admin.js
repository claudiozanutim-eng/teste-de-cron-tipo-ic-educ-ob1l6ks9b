migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('users')

    if (!users.fields.getByName('admin')) {
      users.fields.add(
        new BoolField({
          name: 'admin',
          required: false,
        }),
      )
    }

    if (!users.fields.getByName('ultimo_perfil')) {
      users.fields.add(
        new SelectField({
          name: 'ultimo_perfil',
          required: false,
          values: ['Golfinho', 'Leão', 'Urso', 'Lobo'],
          maxSelect: 1,
        }),
      )
    }

    // Admins can list and view all users, users can view/update their own
    users.listRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.admin = true)"
    users.viewRule =
      "@request.auth.id != '' && (id = @request.auth.id || @request.auth.admin = true)"

    app.save(users)
  },
  (app) => {
    const users = app.findCollectionByNameOrId('users')
    if (users.fields.getByName('admin')) {
      users.fields.removeByName('admin')
    }
    if (users.fields.getByName('ultimo_perfil')) {
      users.fields.removeByName('ultimo_perfil')
    }
    app.save(users)
  },
)
