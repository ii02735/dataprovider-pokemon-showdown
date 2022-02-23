const { insertOrUpdate, knex, resultRecords} = require('./db')
const items = require('./items').flatMap((item) => item.gen.map((gen) => ({...item,gen})))

module.exports.execute = () => Promise.all(insertOrUpdate(knex,'item',items, true))
       .then((results) => console.log(resultRecords('item', results)))
       .finally(() => knex.destroy())