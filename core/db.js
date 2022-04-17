const Mixtape = require('mixtapejs')
const fs = require('fs')
const Path = require('path')
class DB {
  constructor(core) {
    this.core = core
    this.tapes = {}
  }
  async tape(path) {
    let tape = this.tapes[path]
    if (!tape) {
      tape = new Mixtape()
      const rootPath = Path.resolve(this.core.path, path, "db")
      await fs.promises.mkdir(rootPath, { recursive: true }).catch((e) => { })
      await tape.init({
        path: rootPath,
        config: {
          metadata: { schema: "migrate" },
        },
      })
      this.tapes[path] = tape;
    }
    return tape;
  }
  async write(path, table, token) {
    let tape = await this.tape(path)
    let res = await tape.write(table, token)
    return res
  }
  async rm(path, table, where) {
    console.log("path", path, table, where)
    let tape = await this.tape(path)
    await tape.rm(table, where)
  }
  async read(path, table, query) {
    let tape = await this.tape(path)
    let r = await tape.read(table, query)
    return r
  }
  async readOne(path, table, query) {
    let tape = await this.tape(path)
    let r = await tape.readOne(table, query)
    return r
  }
}
module.exports = DB
