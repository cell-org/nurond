const path = require('path')
const workspace = (req) => {
  if (req.session && Object.keys(req.session).length > 0) {
    let key = Object.keys(req.session)
    return path.join(req.session[key].account, req.body.workspace)
  } else {
    return req.body.workspace
  }
}
module.exports = (nuron) => {
  nuron.app.post("/db/write", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    table: <table name>,
    //    payload: <token>
    //  }
    try {
      const ws = workspace(req)
      await nuron.core.db.write(ws, req.body.table, req.body.payload)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/db/read", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    table: <table name>,
    //    payload: <query>
    //  }
    try {
      const ws = workspace(req)
      let response = await nuron.core.db.read(ws, req.body.table, req.body.payload)
      res.json({ response })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/db/readOne", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    table: <table name>,
    //    payload: <query>
    //  }
    try {
      const ws = workspace(req)
      let response = await nuron.core.db.readOne(ws, req.body.table, req.body.payload)
      res.json({ response })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/db/rm", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    table: <table name>,
    //    payload: <query>
    //  }
    try {
      const ws = workspace(req)
      let response = await nuron.core.db.rm(ws, req.body.table, req.body.payload)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
