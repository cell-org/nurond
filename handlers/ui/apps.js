const Path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const paths = {}
module.exports = (nuron) => {
  const appRoot = Path.resolve(nuron.path, "apps")
  fs.promises.mkdir(appRoot, { recursive: true }).catch((e) => { })
  nuron.app.get("/install", async (req, res) => {
    res.render("apps/show", {
      name: nuron.core.wallet.name(),
      chainId: req.params.chainId,
      git: req.query.git,
      app: req.query.name,
      path: req.query.path
    })
  })
  nuron.app.get("/apps", async (req, res) => {
    let key = nuron.core.wallet.key()
    let apps = await fs.promises.readdir(appRoot)
    apps = apps.map((app) => {
      return {
        hex: app,
        original: Buffer.from(app, "hex").toString()
      }
    })
    if (key) {
      res.render("apps/index", { name: nuron.core.wallet.name(), chainId: req.params.chainId, apps })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/apps/*", async (req, res) => {
    let appNameHex = req.params[0].split("/")[0]
    let appName = Buffer.from(appNameHex, "hex").toString()
    let nuronJSONpath = Path.resolve(appRoot, appNameHex, "nuron.json")
    let appPath
    if (paths[appNameHex]) {
      appPath = paths[appNameHex]
    } else {
      try {
        let nuronConfigStr = await fs.promises.readFile(nuronJSONpath, "utf8")
        let nuronConfig = JSON.parse(nuronConfigStr)
        if (nuronConfig.path) {
          appPath = Path.resolve(appRoot, appNameHex, nuronConfig.path)
        } else {
          appPath = Path.resolve(appRoot, appNameHex)
        }
      } catch (e) {
        appPath = Path.resolve(appRoot, appNameHex)
      }
      paths[appNameHex] = appPath
    }

    let filePath = Path.resolve(appPath, req.params[0].split("/").slice(1).join("/"))
    let stream = fs.createReadStream(filePath)
    stream.on("error", (e) => {
      res.status(500).json({ error: e.message })
    })
    stream.pipe(res)
  })
  nuron.app.post("/apps/uninstall", async (req, res) => {
    /*
      req.body := {
        git: <git url>,
      }
    */
    let key = nuron.core.wallet.key()
    if (key) {
      // name => hex version of the 
      let hex = Buffer.from(req.body.git).toString("hex")
      let appPath = Path.resolve(appRoot, hex)
      await fs.promises.rm(appPath, { recursive: true })
      res.json({})
    } else {
      res.redirect("/")
    }
  })
  nuron.app.post("/apps/install", async (req, res) => {
    /*
      req.body := {
        git: <git url>,
      }
    */
    let key = nuron.core.wallet.key()
    if (key) {
      // name => hex version of the 
      let hex = Buffer.from(req.body.git).toString("hex")
      let appPath = Path.resolve(appRoot, hex)
      await git.clone({
        fs,
        http,
        dir: appPath,
        url: req.body.git,
        depth: 1,
        singleBranch: true
      })
      res.json({ success: true })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.post("/apps/update", async (req, res) => {
    /*
      req.body := {
        git: <git url>,
      }
    */
    let key = nuron.core.wallet.key()
    if (key) {
      // name => hex version of the 
      let hex = Buffer.from(req.body.git).toString("hex")
      let appPath = Path.resolve(appRoot, hex)
      await git.fastForward({
        fs,
        http,
        dir: appPath,
        singleBranch: true
      })
      res.json({ success: true })
    } else {
      res.redirect("/")
    }
  })
}
