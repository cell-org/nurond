const path = require('path')
module.exports = (nuron) => {
  nuron.app.get("/config", async (req, res) => {
    try {
      nuron.config = await nuron.getConfig()
      console.log("nuron>CONFIG", nuron.config)
      res.json({
        ipfs: { key: nuron.config.ipfs.key },
        workspace: {
          home: path.resolve(nuron.path, "workspace")
        }
      })
    } catch (e) {
      res.json({
        ipfs: { key: "" },
        workspace: {
          home: path.resolve(nuron.path, "workspace")
        }
      })
    }
  })

  nuron.app.post("/configure", async (req, res) => {
    try {
      await nuron.setConfig(req.body)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })
}
