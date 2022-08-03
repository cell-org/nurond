const fs = require('fs')
const Path = require('path')
const ejs = require('ejs')
const git = require('isomorphic-git')
const fetch = require('cross-fetch')
const exists = path => fs.promises.stat(path).then(() => true, () => false);
class Web {
  constructor(core) {
    this.core = core
  }
  async publish(o) {
    // create a 'published' folder
    const workspacePath = Path.resolve(this.core.path, o.workspace)
    const publishedPath = Path.resolve(workspacePath, "published")
    let e = await exists(publishedPath)
    if (!e) {
      await fs.promises.mkdir(publishedPath, { recursive: true }).catch((e) => {})
    }
    // copy db, fs, web into published
    const fsPath = Path.resolve(workspacePath, "fs")
    const dbPath = Path.resolve(workspacePath, "db")
    const webPath = Path.resolve(workspacePath, "web")

    const fsDestPath = Path.resolve(workspacePath, "published", "fs")
    const dbDestPath = Path.resolve(workspacePath, "published", "db")
    const webDestPath = Path.resolve(workspacePath, "published", "web")

    await fs.promises.cp(fsPath, fsDestPath, { recursive: true })
    await fs.promises.cp(dbPath, dbDestPath, { recursive: true })
    await fs.promises.cp(webPath, webDestPath, { recursive: true })
  }
  async build(o) {
    //  o := {
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
    const rootPath = Path.resolve(this.core.path, o.workspace, o.path)

    let e = await exists(rootPath)
    if (!e) {
      await fs.promises.mkdir(rootPath, { recursive: true }).catch((e) => {})
      await git.init({ fs, dir: Path.resolve(this.core.path, o.workspace) }).catch((e) => {})
    }

    let templates = [{
      src: __dirname + "/templates/index.ejs",
      dest: "index.html"
    }, {
      src: __dirname + "/templates/token.ejs",
      dest: "token.html"
    }]

    // custom templates
    if (o.templates && Array.isArray(o.templates)) {
      templates = o.templates
    }

    for(let template of templates) {
      // if src starts with http => download first
      let html
      if (template.src.startsWith("http")) {
        let tpl = await fetch(template.src).then((r) => {
          return r.text()
        })
        html = await ejs.render(tpl, { domain: o.domain, config: o.config }, { async: true })
      } else {
        html = await ejs.renderFile(template.src, { domain: o.domain, config: o.config }, { async: true })
      }

      await fs.promises.writeFile(Path.resolve(this.core.path, o.workspace, o.path, template.dest), html).catch((e) => {})

    }

  }
}
module.exports = Web
