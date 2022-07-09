const fs = require('fs')
const path = require('path')
const multer  = require('multer')
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
    if (nuron.progress.fs[req.body.workspace]) {
      res.json(nuron.progress.fs[req.body.workspace])
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
      let r = await nuron.core.fs.pin(req.body.workspace, req.body.cid, (total, completed) => {
        nuron.progress.fs[req.body.workspace] = {
          total, completed
        }
      })
      delete nuron.progress.fs[req.body.workspace]
      res.json({ response: r })
    } catch (e) {
      console.log("ERROR", e)
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/fs/rm", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace>,
    //    cids: <cid array>|<cid>|*
    //  }
    try {
      await nuron.core.fs.rm(req.body.workspace, req.body.cids)
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
    const cid = await nuron.core.fs.write(req.body.workspace, req.body.body)
    res.json({ cid })
  })
  nuron.app.post("/fs/binary", upload.single("file"), async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //  }
    //  req.file := {
    //    buffer: <buffer>
    //  }
    console.log("req.file.buffer", req.file.buffer)
    console.log("req.body", req.body)
    const cid = await nuron.core.fs.write(req.body.workspace, req.file.buffer)
    res.json({ cid })
  })
  nuron.app.post("/fs/rm2", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace>,
    //    paths: <path array>|<path>|*
    //  }
    try {
      console.log("rm2", req.body)
      await nuron.core.fs.rm2(req.body.workspace, req.body.paths)
      res.json({ response: "success" })
    } catch (e) {
      res.json({ error: e.toString() })
    }
  })
}
