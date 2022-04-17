const path = require('path')
module.exports = (nuron) => {
  nuron.app.get("/", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      res.render("view/home", { name: nuron.core.wallet.name(), chainId: req.params.chainId })
    } else {
      let wallets = await nuron.core.wallet.get()
      console.log("Wallets", wallets)
      res.render("wallet/loggedout", { wallets })
    }
  })
}
