module.exports = (nuron) => {
  nuron.app.post("/token/build", async (req, res) => {
    //  req.body := {
    //    payload: {
    //      body: tokenDSL,
    //      domain: domain,
    //    }
    //  }
    try {
      let token = await nuron.core.token.build(req.body)
      res.json(token)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/token/sign", async (req, res) => {
    //  req.body := {
    //    key: bip44,
    //    payload: {
    //      body: tokenDSL,
    //      domain: domain,
    //    }
    //  }
    try {
      let token = await nuron.core.token.sign(req.body)
      res.json(token)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/token/create", async (req, res) => {
    //  req.body := {
    //    key: bip44,
    //    payload: {
    //      body: tokenDSL,
    //      domain: domain,
    //    }
    //  }
    try {
      let token = await nuron.core.token.create(req.body)
      res.json(token)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
