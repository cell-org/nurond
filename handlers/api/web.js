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
      req.body.workspace = workspace(req)
      await nuron.core.web.build(req.body)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
  nuron.app.post("/web/publish", async (req, res) => {
    //  req.body := {
    //    workspace: <workspace path>,
    //    path:   <file path>,
    //  }
    try {
      req.body.path = "published"
      req.body.workspace = workspace(req)
      await nuron.core.web.publish(req.body)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
