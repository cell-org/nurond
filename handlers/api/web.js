module.exports = (nuron) => {
  nuron.app.post("/web/build", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    domain: <domain>
    //  }
    try {
      req.body.path = "web"
      await nuron.core.web.build(req.body)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
