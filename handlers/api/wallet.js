const chainInfo = require('../../chains.json')
const chains = chainInfo.map((c) => {
  return {
    name:c.name,
    chain:c.chain,
    chainId: c.chainId,
    slip44: (c.slip44 ? c.slip44 : 60),
  }
})
module.exports = (nuron) => {
  // 1. WALLET API - GET
  nuron.app.get("/wallet/accounts", async (req, res) => {
    try {
      let accounts = await nuron.core.wallet.accounts()
      res.json({ response: accounts })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.get("/wallet/session", async (req, res) => {
    try {
      let session = await nuron.core.wallet.session(req.query.path)
      res.json({ response: session })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.get("/wallet/chains", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      res.json({ name: nuron.core.wallet.name(), chains })
    } else {
      res.status(500).json({ error: "logged out" })
    }
  })
  nuron.app.get("/wallet/chains/:chainId", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      let c = await nuron.core.wallet.get(req.params.chainId)
      if (c) {
        res.json({
          response: {
            name: c.name, chain: c.chain.chain, chainId: c.chain.chainId, accounts: c.accounts
          }
        })
      } else {
        res.status(500).json({ error: "non-existent chainId: " + req.params.chainId })
      }
    } else {
      res.status(500).json({ error: "logged out" })
    }
  })

  // can only delete when logged in (username already exists)

  // 2. WALLET API - POST
  nuron.app.post("/wallet/connect", async (req, res) => {
    try {
      await nuron.core.wallet.connect(req.body.password, req.body.username)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/wallet/disconnect", async (req, res) => {
    try {
      await nuron.core.wallet.disconnect()
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/wallet/delete", async (req, res) => {
    try {
      await nuron.core.wallet.delete(req.body.password)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  // can only export when logged in (username already exists)
  nuron.app.post("/wallet/export", async (req, res) => {
    try {
      let exported = await nuron.core.wallet.export(req.body.password, req.body.key)
      res.json({ response: exported })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  // username
  nuron.app.post("/wallet/import", async (req, res) => {
    try {
      let imported = await nuron.core.wallet.import(req.body.password, req.body.seed, req.body.username)
      res.json({ response: imported })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  // username
  nuron.app.post("/wallet/generate", async (req, res) => {
    try {
      let generated = await nuron.core.wallet.generate(req.body.password, req.body.username)
      res.json({ response: generated })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  /*
  POST /wallet/sign
  {
    key: <bip44 keypath>,
    domain: <domain>,
    body: <message to sign>
  }
  */
//    nuron.app.post("/wallet/sign", async (req, res) => {
//      try {
//        let signed = await nuron.keyport.exec(req.body.key, async (key) => {
//          let signature = sigUtil.signTypedData({
//            privateKey: key.privateKey,
//            data: req.body,
//            version: "V4"
//          })
//          return {
//            domain: req.body.domain,
//            signature
//          }
//        })
//        res.json(signed)
//      } catch (e) {
//        res.status(500).json({ error: e.message })
//      }
//    })
}
