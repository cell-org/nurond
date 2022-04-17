class Query {
  constructor(knex) {
    this.knex = knex
  }
  /******************************************************
  *  {
  *    select: [<col>, <col>, .. ],
  *    from: users|tokens,
  *    where: {
  *      <key>: <val>,
  *      <key>: <val>,
  *    }
  *  }
  ******************************************************/
  async queryOne(query) {
    let promise = (query.select ? this.knex.select(...query.select) : this.knex.select())
    if (query.from) {
      promise = promise.from(query.from)
    } else {
      throw new Error("from field necessary")
    }
    promise = promise.limit(1)
    if (query.join) promise = promise.join(...query.join)
    if (query.where) {
      if (Array.isArray(query.where)) {
        promise = promise.where(...query.where)
      } else {
        promise = promise.where(query.where)
      }
    }
    if (query.offset) promise = promise.offset(query.offset)
    if (query.order) promise = promise.orderBy(...query.order)
    if (query.where) promise = promise.where(query.where)
    let response = await promise
    if (response.length > 0) {
      return response[0]
    } else {
      return null
    }
  }
  /******************************************************
  *  can only insert token. users are auto-generated
  *
  *  {
  *    select: [<col>, <col>, .. ],
  *    from: users|tokens,
  *    join: [args],
  *    where: {
  *      <key>: <val>,
  *      <key>: <val>,
  *    },
  *    order: <orderBy>,
  *    limit: <limit>,
  *    offset: <offset>
  *  }
  ******************************************************/
  async query(query) {
    let promise = (query.select ? this.knex.select(...query.select) : this.knex.select())
    if (query.from) {
      promise = promise.from(query.from)
    } else {
      throw new Error("from field necessary")
    }
    if (query.join) promise = promise.join(...query.join)
    if (query.where) {
      if (Array.isArray(query.where)) {
        promise = promise.where(...query.where)
      } else {
        promise = promise.where(query.where)
      }
    }
    if (query.limit) promise = promise.limit(query.limit)
    if (query.offset) promise = promise.offset(query.offset)
    if (query.order) promise = promise.orderBy(...query.order)
    let response = await promise
    return response
  }
  async rm(query) {
    let table;
    if (query.from) {
      table = query.from
    } else {
      throw new Error("from field necessary")
    }
    if (query.where) {
      let where = query.where
      if (Array.isArray(where)) {
        await this.knex(table).where(...where).del()
      } else if (typeof where === 'object') {
        await this.knex(table).where(where).del()
      } else {
        throw new Error("the condition must be either array or a non-empty object")
      }
    } else {
      throw new Error("where field necessary")
    }
  }
}
module.exports = Query
