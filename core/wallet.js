const Keyport = require('keyport')
const fs = require('fs')
const chainInfo = require('../chains.json')
const chains = chainInfo.map((c) => {
  return {
    name:c.name,
    chain:c.chain,
    chainId: c.chainId,
    slip44: (c.slip44 ? c.slip44 : 60),
  }
})
class Wallet {
  constructor(core) {
    if (core.keyportPath) {
      // running in container
      console.log("init wallet", core.keyportPath)
      this.keyport = new Keyport(core.keyportPath)
    } else {
      // running standalone
      this.keyport = new Keyport()
    }
    this.core = core
  }
  key() {
    return this.keyport.key
  }
  name() {
    return this.keyport.name
  }
  async accounts() {
    let accounts = await fs.promises.readdir(this.keyport.folder)
    return accounts
  }
  async delete(password) {
    // delete current session wallet
    await this.keyport.delete(password)
  }
  async import(password, seed, username) {
    let imported = await this.keyport.import(password, seed, username)
    await this.keyport.connect(password, username)
    return imported
  }
  async export(password, derivationPath) {
    let exported = await this.keyport.export(password, derivationPath)
    return exported
  }
  async generate(password, username) {
    let generated = await this.keyport.generate(password, username)
    await this.keyport.connect(password, username)
    return generated
  }
  async connect(password, username) {
    await this.keyport.connect(password, username)
  }
  async disconnect() {
    await this.keyport.disconnect()
  }
  async session(derivationPath) {
    if (this.keyport.key) {
      if (derivationPath) {
        let { address } = await this.keyport.exec(derivationPath, async (key) => {
          return this.core.web3.eth.accounts.privateKeyToAccount(
            key.privateKey.toString("hex")
          )
        })
        return { username: this.keyport.name, address: address }
      } else {
        return { username: this.keyport.name }
      }
    } else {
      return { username: null }
    }
  }
  async get(chainId) {
    if (chainId) {
      if (this.keyport.key) {
        let c
        for(let chain of chains) {
          if (chain.chainId === parseInt(chainId)) {
            c = chain
            break;
          }
        }
        if (c) {
          let cs = []
          for(let i=0; i<100; i++) {
            let derivationPath = `m/44'/${c.slip44}'/0'/0/${i}`
            let { address } = await this.keyport.exec(derivationPath, async (key) => {
              return this.core.web3.eth.accounts.privateKeyToAccount(
                key.privateKey.toString("hex")
              )
            })
            cs.push({ address, path: derivationPath })
          }
          return { chain: c, accounts: cs }
        } else {
          return null
        }
      } else {
        return null
      }
    } else {
      let wallets = await this.keyport.wallets()
      return wallets
    }
  }
  async privateKey(derivationPath) {
    let privateKey = await this.keyport.exec(derivationPath, async (key) => {
      return key.privateKey.toString("hex")
    })
    return privateKey
  }
}
module.exports = Wallet
