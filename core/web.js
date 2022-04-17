const fs = require('fs')
const Path = require('path')
const ejs = require('ejs')
const git = require('isomorphic-git')
const exists = path => fs.promises.stat(path).then(() => true, () => false);
class Web {
  constructor(core) {
    this.core = core
  }
  async build(o) {
    /*
    o := {
      workspace,
      domain,
      path,
      config
    }
    */
    const rootPath = Path.resolve(this.core.path, o.workspace, o.path)

    let e = await exists(rootPath)
    if (!e) {
      await fs.promises.mkdir(rootPath, { recursive: true }).catch((e) => {})
      await git.init({ fs, dir: Path.resolve(this.core.path, o.workspace) }).catch((e) => {})
    }

    const index = await ejs.renderFile(__dirname + "/templates/index.ejs", { domain: o.domain, config: o.config }, { async: true })
    const token = await ejs.renderFile(__dirname + "/templates/token.ejs", { domain: o.domain, config: o.config }, { async: true })
    // => Rendered HTML string
    await fs.promises.writeFile(Path.resolve(this.core.path, o.workspace, o.path, "index.html"), index).catch((e) => {})
    await fs.promises.writeFile(Path.resolve(this.core.path, o.workspace, o.path, "token.html"), token).catch((e) => {})
  }
}
module.exports = Web
