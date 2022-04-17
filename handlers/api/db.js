module.exports = (nuron) => {
  nuron.app.post("/db/write", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    table: <table name>,
    //    payload: <token>
    //  }
    try {
      await nuron.core.db.write(req.body.workspace, req.body.table, req.body.payload)
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
      let response = await nuron.core.db.read(req.body.workspace, req.body.table, req.body.payload)
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
      let response = await nuron.core.db.readOne(req.body.workspace, req.body.table, req.body.payload)
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
    console.log("/db/rm", req.body)
    try {
      let response = await nuron.core.db.rm(req.body.workspace, req.body.table, req.body.payload)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
