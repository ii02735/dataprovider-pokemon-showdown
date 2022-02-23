const { insertOrUpdate, knex, resultRecords} = require('./db')
const natures = require('./natures')

module.exports.execute = () => Promise.all(insertOrUpdate(knex,'nature',natures))
       .then((results) => console.log(resultRecords('nature', results)))
       .finally(() => knex.destroy()) 