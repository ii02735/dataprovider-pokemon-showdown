const { insertOrUpdate, knex, resultRecords} = require('./db')
const natures = require('../natures')

Promise.all(insertOrUpdate(knex,'nature',natures, { ignoreColumns: [ 'usageName' ] } ))
       .then((results) => console.log(resultRecords('nature', results)))
       .finally(() => knex.destroy()) 