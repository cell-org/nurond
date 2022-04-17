const Web3 = require('web3')
const path = require('path')
const fs = require('fs')
const FS = require('./fs')
const DB = require('./db')
const Web = require('./web')
const Token = require('./token')
const Wallet = require('./wallet')
class Core {
  constructor(o) {
    this.ipfs = o.ipfs
    this.keyportPath = o.keyportPath
    this.endpoint = o.endpoint
    this.web3 = o.web3
    this.path = (o.path ? o.path : "fs")
    this.tmp = (o.tmp ? o.tmp : "tmp")
    this.nuron = (o.nuron ? o.nuron : "http://localhost:42000")
    this.fs = new FS(this)
    this.token = new Token(this)
    this.web = new Web(this)
    this.wallet = new Wallet(this)
    this.db = new DB(this)
    this.wallet.keyport.on("connect", () => {
      this.token.disconnect()
    })
    try {
      fs.mkdirSync(this.path, { recursive: true })
    } catch (e) { }
  }
}
module.exports = Core
