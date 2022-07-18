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
  nuron.app.get("/wallets", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      res.render("wallet/loggedin", { name: nuron.core.wallet.name(), chains })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/wallets/:chainId", async (req, res) => {
    let c = await nuron.core.wallet.get(req.params.chainId)
    if (c) {
      res.render("wallet/chain", { name: nuron.core.wallet.name(), chain_name: c.chain.name, chain: c.chain.chain, chainId: c.chain.chainId, chains: c.accounts })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/wallet/generate", async (req, res) => {
    res.render("wallet/generate")
  })
  nuron.app.get("/wallet/import", async (req, res) => {
    res.render("wallet/import")
  })
}
