migrate(
  (app) => {
    const users = app.findCollectionByNameOrId('_pb_users_auth_')
    const adminEmail = 'luizfelipe.pateo@iceduc.com.br'

    try {
      const existing = app.findAuthRecordByEmail('_pb_users_auth_', adminEmail)
      existing.set('admin', true)
      if (!existing.getString('name')) {
        existing.set('name', 'Luiz Felipe Pateo')
      }
      existing.setVerified(true)
      app.save(existing)
      return
    } catch (_) {
      // Record does not exist, create it below
    }

    const record = new Record(users)
    record.setEmail(adminEmail)
    record.setPassword('Skip@Pass')
    record.setVerified(true)
    record.set('name', 'Luiz Felipe Pateo')
    record.set('admin', true)
    app.save(record)
  },
  (app) => {
    try {
      const record = app.findAuthRecordByEmail('_pb_users_auth_', 'luizfelipe.pateo@iceduc.com.br')
      app.delete(record)
    } catch (_) {}
  },
)
