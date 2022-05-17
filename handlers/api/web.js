module.exports = (nuron) => {
  nuron.app.post("/web/build", async (req, res) => {
    //  req.body := {
    //    templates: [{
    //      src: <index.ejs url>,
    //      dest: "index.html"
    //    }, {
    //      src: <token.ejs url>,
    //      dest: "token.html"
    //    }],
    //    workspace: <workspace path>,
    //    domain: <domain>,
    //    path:   <file path>,
    //    config: <config>
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
