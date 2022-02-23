const { insertOrUpdate, knex, resultRecords} = require('./db')
const abilities = require('./abilities').flatMap((ability) => ability.gen.map((gen) => ({...ability,gen})))

module.exports.execute = () => Promise.all(insertOrUpdate(knex,'ability',abilities, true, { 'shortDescription': 'short_description' }))
       .then((results) => console.log(resultRecords('ability', results)))
       .finally(() => knex.destroy())