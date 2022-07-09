const ipfsh = require('ipfsh')
const fs = require('fs')
const Path = require('path')
const Pinster = require('pinster')
const git = require('isomorphic-git')
const stringify = require('json-stringify-deterministic')
const exists = path => fs.promises.stat(path).then(() => true, () => false);
class FS {
  constructor(core) {
    this.core = core
    this.synchronize()
  }
  synchronize() {
    this.pinster = new Pinster({
      endpoint: this.core.endpoint,
      ipfs: this.core.ipfs,
      tmp: this.core.tmp
    })
  }
  async pin(workspace, cid, cb) {
    let resolvedPath
    if (cid) {
      if (cid === "*") {
        resolvedPath = Path.resolve(this.core.path, workspace, "fs")
      } else {
        resolvedPath = Path.resolve(this.core.path, workspace, "fs", cid)
      }
    } else {
      throw new Error("cid required")
    }
    console.log("pinning", resolvedPath)
    let pubcid = await this.pinster.publish(resolvedPath, cb)
    console.log("pubcid", pubcid)
    return pubcid
  }
  async write(path, body) {
    console.log("write", path, body)
    const rootPath = Path.resolve(this.core.path, path, "fs")
    console.log("rootPath", rootPath)
    let e = await exists(rootPath)
    if (!e) {
      console.log("no")
      await fs.promises.mkdir(rootPath, { recursive: true }).catch((e) => {})
      await git.init({ fs, dir: Path.resolve(this.core.path, path) }).catch((e) => {})
    }
    if (Buffer.isBuffer(body)) {
      const buf = body
      const cid = await ipfsh.file(buf)
      console.log("write to", Path.resolve(rootPath, cid))
      await fs.promises.writeFile(Path.resolve(rootPath, cid), body)
      return cid
    } else if (typeof body === 'object') {
      //const buf = Buffer.from(JSON.stringify(body, null, 2))
      const buf = Buffer.from(stringify(body))
      const cid = await ipfsh.file(buf)
      await fs.promises.writeFile(Path.resolve(rootPath, cid), buf)
      return cid
    }
  }
  async rm(path, cids) {
    if (Array.isArray(cids)) {
      for(let cid of cids) {
        const resolvedPath = Path.resolve(this.core.path, path, "fs", cid)
        await fs.promises.rm(resolvedPath, { recursive: true, force: true })
      }
    } else {
      if (cids === "*") {
        const resolvedPath = Path.resolve(this.core.path, path, "fs")
        await fs.promises.rm(resolvedPath, { recursive: true, force: true }).catch((e) => { })
        await fs.promises.mkdir(resolvedPath, { recursive: true }).catch((e) => {})
      } else {
        const resolvedPath = Path.resolve(this.core.path, path, "fs", cids)
        await fs.promises.rm(resolvedPath, { recursive: true, force: true })
      }
    }
  }
  async rm2(path, paths) {
    console.log("path", path)
    console.log("paths", paths)
    if (Array.isArray(paths)) {
      for(let p of paths) {
        const resolvedPath = Path.resolve(this.core.path, path, p)
        await fs.promises.rm(resolvedPath, { recursive: true, force: true })
      }
    } else {
      if (paths === "*") {
        const resolvedPath = Path.resolve(this.core.path, path)
        console.log("resolvedPath", resolvedPath)
        await fs.promises.rm(resolvedPath, { recursive: true, force: true }).catch((e) => { console.log("error", e) })
//        await fs.promises.mkdir(resolvedPath, { recursive: true }).catch((e) => {})
      } else {
        const resolvedPath = Path.resolve(this.core.path, path, paths)
        await fs.promises.rm(resolvedPath, { recursive: true, force: true })
      }
    }
  }
}
module.exports = FS
