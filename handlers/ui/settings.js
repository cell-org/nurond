const chainInfo = require('../../chains.json')
const path = require('path')
const chains = chainInfo.map((c) => {
  return {
    name:c.name,
    chain:c.chain,
    chainId: c.chainId,
    slip44: (c.slip44 ? c.slip44 : 60),
  }
})
module.exports = (nuron) => {
  nuron.app.get("/settings", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      res.render("view/settings",{
        name: nuron.core.wallet.name()
      })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/settings/workspaces", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      try {
        nuron.config = await nuron.getConfig()
        res.render("files/config", {
          ipfs: {
            key: nuron.config.ipfs.key
          },
          workspace: {
            home: path.resolve(nuron.path, "workspace")
          },
          name: nuron.core.wallet.name()
        })
      } catch (e) {
        res.render("files/config", {
          ipfs: {
            key: ""
          },
          workspace: {
            home: path.resolve(nuron.path, "workspace")
          },
          name: nuron.core.wallet.name()
        })
      }
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/settings/wallet", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      res.render("wallet/settings", {
        name: nuron.core.wallet.name(),
      })
    } else {
      res.redirect("/")
    }
  })
}
