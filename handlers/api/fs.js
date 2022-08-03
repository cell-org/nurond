const fs = require('fs')
const path = require('path')
const multer  = require('multer')
const workspace = (req) => {
  if (req.session && Object.keys(req.session).length > 0) {
    let key = Object.keys(req.session)
    return path.join(req.session[key].account, req.body.workspace)
  } else {
    return req.body.workspace
  }
}
module.exports = (nuron) => {
  const storage = multer.memoryStorage()
  const upload = multer({ storage: storage })
  nuron.app.get("/raw/*", (req, res) => {
    let filePath = path.join(nuron.core.path, req.params[0])
    try {
      let stream = fs.createReadStream(filePath)
      stream.on("error", (e) => {
        res.status(500).json({ error: e.message })
      })
      stream.pipe(res)
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/fs/pin/progress", async (req, res) => {
    //  req.body := {
    //    workscpace: <workspace>fs namespace>,
    //  }
    const ws = workspace(req)
    if (nuron.progress.fs[ws]) {
      res.json(nuron.progress.fs[ws])
    } else {
      res.json({})
    }
  })
  nuron.app.post("/fs/pin", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace>,
    //    cid: <cid>
    //  }
    try {
      const ws = workspace(req)
      let r = await nuron.core.fs.pin(ws, req.body.cid, (total, completed) => {
        nuron.progress.fs[ws] = {
          total, completed
        }
      })
      delete nuron.progress.fs[ws]
      res.json({ response: r })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/fs/rm", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace>,
    //    cids: <cid array>|<cid>|*
    //  }
    try {
      const ws = workspace(req)
      await nuron.core.fs.rm(ws, req.body.cids)
      res.json({ response: "success" })
    } catch (e) {
      res.json({ error: e.toString() })
    }
  })
  nuron.app.post("/fs/json", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    body: <JSON body>
    //  }
    const ws = workspace(req)
    const cid = await nuron.core.fs.write(ws, req.body.body)
    res.json({ cid })
  })
  nuron.app.post("/fs/binary", upload.single("file"), async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //  }
    //  req.file := {
    //    buffer: <buffer>
    //  }
    const ws = workspace(req)
    const cid = await nuron.core.fs.write(ws, req.file.buffer)
    res.json({ cid })
  })
  nuron.app.post("/fs/rm2", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace>,
    //    paths: <path array>|<path>|*
    //  }
    try {
      const ws = workspace(req)
      await nuron.core.fs.rm2(ws, req.body.paths)
      res.json({ response: "success" })
    } catch (e) {
      res.json({ error: e.toString() })
    }
  })
}
