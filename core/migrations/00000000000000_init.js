exports.up = function(knex) {
  return knex.schema
  .createTable('tokens', (table) => {
    table.boolean("signed")
    table.string("data").notNullable()
    table.string("id").notNullable().primary()
    table.string("meta").notNullable()
    table.string("minter")
    table.integer("price")
    table.integer("start")
    table.integer("end")
    table.string("royaltyReceiver")
    table.integer("royaltyAmount")
    table.string("merkleHash")
    table.string("puzzleHash")
    table.bigInteger('created_at').defaultTo(Date.now())
    table.bigInteger('updated_at').defaultTo(Date.now())

    table.index('created_at', 'tokens_created_at_index')
    table.index('updated_at', 'tokens_updated_at_index')
    table.index('data', 'tokens_data_index')
    table.index('id', 'tokens_id_index')
    table.index('minter', 'tokens_minter_index')
    table.index('price', 'tokens_price_index')
    table.index("merkleHash", 'tokens_merklehash_index')
    table.index("puzzleHash", 'tokens_puzzlehash_index')
  })
};
exports.down = function(knex) {
  return knex.schema.dropTable("tokens")
};
