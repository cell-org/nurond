const path = require('path')
const archiver = require('archiver')
const fs = require('fs')
module.exports = (nuron) => {
  nuron.app.get("/config", async (req, res) => {
    try {
      nuron.config = await nuron.getConfig()
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

  nuron.app.get("/workspace/config", async (req, res) => {
    try {
      nuron.config = await nuron.getConfig()
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

  nuron.app.post("/workspace/configure", async (req, res) => {
    try {
      await nuron.setConfig(req.body)
      res.json({ success: true })
    } catch (e) {
      res.status(500).json({ error: e.message })
    }
  })

  nuron.app.get("/workspace/download", (req, res) => {
    // req.query = <workspace path>
    const home = path.resolve(nuron.path, "workspace", req.query.workspace)
    const tmpPath = path.resolve(nuron.core.tmp, `${req.query.workspace}.zip`)
    console.log("download request", tmpPath)
    const output = fs.createWriteStream(tmpPath)
    const archive = archiver('zip');
    output.on('close', () => {
      console.log(archive.pointer() + ' total bytes');
      res.download(tmpPath, `${req.query.workspace}.zip`, async (err) => {
        await fs.promises.rm(tmpPath)
        console.log("deleted", tmpPath)
      })
    });
    archive.on('error', (err) => {
      throw err;
    });
    archive.pipe(output);
    archive.directory(home + "/", false);
    archive.finalize();
  })
}
