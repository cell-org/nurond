const Path = require('path')
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')
const fs = require('fs')
const paths = {}
module.exports = (nuron) => {
  const appRoot = Path.resolve(nuron.path, "apps")
  console.log("app root", appRoot)
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
    console.log("params", req.params[0])
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
        console.log("nuronConfig", nuronConfig)
        if (nuronConfig.path) {
          appPath = Path.resolve(appRoot, appNameHex, nuronConfig.path)
        } else {
          appPath = Path.resolve(appRoot, appNameHex)
        }
      } catch (e) {
        console.log("Error", e)
        appPath = Path.resolve(appRoot, appNameHex)
      }
      paths[appNameHex] = appPath
    }

    let filePath = Path.resolve(appPath, req.params[0].split("/").slice(1).join("/"))

    console.log("filePath", filePath)
    let stream = fs.createReadStream(filePath)
    stream.on("error", (e) => {
      res.status(500).json({ error: e.message })
    })
    stream.pipe(res)
  })
  nuron.app.post("/uninstall", async (req, res) => {
    /*
      req.body := {
        git: <git url>,
      }
    */
    let key = nuron.core.wallet.key()
    if (key) {
      console.log("uninstall", req.body)
      // name => hex version of the 
      let hex = Buffer.from(req.body.git).toString("hex")
      let appPath = Path.resolve(appRoot, hex)
      console.log("delete", appPath)
      await fs.promises.rm(appPath, { recursive: true })
      res.json({})
    } else {
      res.redirect("/")
    }
  })
  nuron.app.post("/install", async (req, res) => {
    /*
      req.body := {
        git: <git url>,
      }
    */
    console.log("req.body", req.body)
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
      res.redirect("/apps")
    } else {
      res.redirect("/")
    }
  })
}
