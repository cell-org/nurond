const express = require('express')
const cors = require('cors')
const Privateparty = require('privateparty')
const ejs = require('ejs')
const fs = require('fs')
const mime = require('mime-types')
const path = require('path')
const Web3 = require('web3')
const os = require('os')
const Config = require('./config')
const Core = require('./core')
const FormData = require('form-data')
const sigUtil = require('@metamask/eth-sig-util')
const Handlers = {
  api: {
    fs: require('./handlers/api/fs'),
    token: require('./handlers/api/token'),
    db: require('./handlers/api/db'),
    web: require('./handlers/api/web'),
    wallet: require('./handlers/api/wallet'),
    workspace: require('./handlers/api/workspace'),
  },
  ui: {
    settings: require('./handlers/ui/settings'),
    wallet: require('./handlers/ui/wallet'),
    main: require('./handlers/ui/main'),
    workspace: require('./handlers/ui/workspace'),
    apps: require('./handlers/ui/apps'),
  }
}
/*******************************
*
*   NURON File System
*   
*   ~/__nuron0__
*     /workspace => store all files
*     /config.json  => 
*
*******************************/
class Nuron {
  async getConfig() {
    this.nuronfile = path.join(this.path, "config.json")
    try {
      const configStr = await fs.promises.readFile(this.nuronfile, "utf8")
      return JSON.parse(configStr)
    } catch (e) {
      return null
    }
  }
  async setConfig(config) {
    this.nuronfile = path.join(this.path, "config.json")
    await fs.promises.writeFile(this.nuronfile, JSON.stringify(config), "utf8")
    if (config.ipfs) {
      this.core.ipfs = config.ipfs
    }
    this.config = config
    this.core.fs.synchronize()
  }
  async init(options) {
    //  options := {
    //    ipfs: {
    //      key: <key>
    //    },
    //    path: <path>,
    //    tmp: <tmp path>
    //  }
    this.cores = {}
    this.progress = {
      fs: {},
      db: {}
    }
    this.keyportPath = options.keyport
    this.path = options.path
    this.workspacepath = path.join(this.path, "workspace")
    this.config = await this.getConfig()
    this.web3 = new Web3()

    // Initialize Core
    let initializer = {
      ipfs: (this.config ? this.config.ipfs : options.ipfs),
      web3: this.web3,
      path: this.workspacepath,
      keyportPath: this.keyportPath,
      tmp: (options.tmp ? options.tmp : process.cwd())
    }
    this.core = new Core(initializer)

    // Initialize App
    this.app = express()
    this.port = options && options.port ? options.port : 42000
    this.app.use(express.urlencoded({ extended: true }))
    this.app.use(express.json())
    this.app.set('view engine', 'ejs');
    this.app.set('views', path.join(__dirname, 'views'));
    this.app.use(express.static(path.join(__dirname, 'public')))

    this.app.get("/collections/*", (req, res) => {
      let chunks = req.params[0].split("/")
      chunks.splice(1, 0, "published")
      let filePath = path.join(this.core.path, chunks.join("/"))
      try {
        let stream = fs.createReadStream(filePath)
        stream.on("error", (e) => {
          res.status(404).json({ error: "not found" })
        })
        stream.pipe(res)
      } catch (e) {
        res.status(404).json({ error: "not found" })
      }
    })
    this.admins = options.admins

    // Provide admin UI for admins
    this.party = new Privateparty({
      secret: options.secret,
      app: this.app,
      cors: options.cors
    })

    // Run beforeAuth plugin => all the logic to run before protecting routes
    let protector = (options.beforeAuth ? options.beforeAuth(this.party) : {})

    // All route handlers are protected with auth from this point below
    if (Object.keys(protector).length > 0) this.app.use(this.party.protect(protector))

    // Run afterAuth plugin => all the injected route handlers on top of Nuron
    if (options.afterAuth) options.afterAuth(this.party) 

    // API handlers
    Handlers.api.fs(this)
    Handlers.api.token(this)
    Handlers.api.db(this)
    Handlers.api.web(this)
    Handlers.api.wallet(this)
    Handlers.api.workspace(this)
    // Nuron Web UI handler
    Handlers.ui.settings(this)
    Handlers.ui.wallet(this)
    Handlers.ui.workspace(this)
    Handlers.ui.main(this)
    Handlers.ui.apps(this)

    this.server = this.app.listen(this.port)
  }
  stop() {
    this.server.close()
  }
}
module.exports = Nuron
