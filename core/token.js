const fs = require('fs')
const Knex = require('knex')
const Path = require('path')
const C0 = require('c0js')
const Query = require("./query")
class Token {
  constructor(core) {
    this.core = core
    this.dbs = {}
    this.engines = {}
  }
  disconnect() {
    this.engines = {}
  }
  async engine(bip44) {
    let engine = this.engines[bip44]
    if (!engine) {
      engine = new C0()
      let privateKey = await this.core.wallet.privateKey(bip44)
      await engine.init({
        web3: this.core.web3,
        key: privateKey,
      })
      this.engines[bip44] = engine
    }
    return engine
  }
  async build(req) {
    //  req := {
    //    payload: {
    //      body: <token body>,
    //      domain: <sign domain>
    //    }
    //  }
    // just build with whatever engine because it doesn't matter
    let engine = await this.engine("m/44'/60'/0'/0/0")
    let unsignedToken = await engine.token.build(req.payload)
    return unsignedToken
  }
  async sign(req) {
    //  req : = {
    //    key: <bip44path>,
    //    payload: {
    //      body: <token body>,
    //      domain: <sign domain>
    //    }
    //  }
    let engine = await this.engine(req.key)
    let signedToken = await engine.token.sign(req.payload)
    return signedToken
  }
  async create(req) {
    //  req := {
    //    key: <bip44path>,
    //    payload: {
    //      body: <token body description>,
    //      domain: <sign domain description>
    //    }
    //  }
    let engine = await this.engine(req.key)
    // transform the bip44 path to private key before passing it to c0
    let signedToken = await engine.token.create(req.payload)
    return signedToken
  }
}
module.exports = Token
