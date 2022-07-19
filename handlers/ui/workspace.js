const fs = require('fs')
const path = require('path')
module.exports = (nuron) => {
  nuron.app.get("/workspaces", async (req, res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      let files = await fs.promises.readdir(nuron.core.path, {
        withFileTypes: true
      })
      files = files.filter((file) => {
        return file.name !== ".DS_Store"
      }).map((file) => {
        let isFile = file.isFile()
        let isDirectory = file.isDirectory()
        return {
          workspace: file.name,
          path: "*",
          current: "/workspaces",
          icon: "fa-solid fa-folder-open",
          name: file.name,
          type: (isFile ? "file" : (isDirectory ? "directory" : null))
        }
      })
      res.render("files/list", { view: false,  name: nuron.core.wallet.name(),  path: req.params[0], files })
    } else {
      res.redirect("/")
    }
  })
  nuron.app.get("/workspaces/*", async (req,res) => {
    let key = nuron.core.wallet.key()
    if (key) {
      try {
        let filePath = path.join(nuron.core.path, req.params[0])
        const stat = await fs.promises.lstat(filePath)
        let filetype;
        if (stat.isFile()) {
          filetype = "file"
        } else if (stat.isDirectory()) {
          filetype = "directory"
        }
        if (req.params[0][req.params[0].length-1] === "/") {
          req.params[0] = req.params[0].slice(0, -1)
        }
        let back = req.params[0].split("/").slice(0, -1).join("/")
        if (filetype === "file") {
          let chunks = req.params[0].split("/")
          let workspace = chunks[0]
          let path = chunks.slice(1).join("/")
          res.render("files/raw", {
            workspace,
            current: path,
            name: nuron.core.wallet.name(),
            path: "/workspaces/" + req.params[0],
            back: "/workspaces/" + back,
            url: "/raw/" + req.params[0]
          })
        } else if (filetype === "directory") {
          let files = await fs.promises.readdir(filePath, {
            withFileTypes: true
          })
          files = files.map((file) => {
            let isFile = file.isFile()
            let isDirectory = file.isDirectory()
            let type = (isFile ? "file" : (isDirectory ? "directory" : null))
            let chunks = req.params[0].split("/")
            let workspace = chunks[0]
            let path = chunks.slice(1).concat(file.name).join("/")
            return {
              workspace,
              path,
              current: "/workspaces/" + req.params[0],
              raw: "/raw/" + req.params[0],
              name: file.name,
              icon: (type === "directory" ? "fa-solid fa-folder-open" : "fa-solid fa-file"),
              type,
            }
          })

          let chunks = req.params[0].split("/")
          let published = null
          if(chunks.length === 2 && chunks[1] === "published") {
            published = `/collections/${chunks[0]}/web/index.html`
          }

          let download = null
          if (chunks.length === 1) {
            download = `/workspace/download?workspace=${chunks[0]}`
          }

          res.render("files/list", {
            name: nuron.core.wallet.name(),
            filepath: filePath,
            path: "/workspaces/" + req.params[0],
            back: "/workspaces/" + back,
            files,
            view: false,
            published,
            download
          })
        }
      } catch (e) {
        res.status(404).send(e.message)
      }
    } else {
      res.redirect("/")
    }
  })
}
