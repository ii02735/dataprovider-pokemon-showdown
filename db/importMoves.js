const { knex, insertOrUpdate, resultRecords } = require('./db')
const moves = require('../moves').flatMap((move) => move.gen.map((gen) => ({...move,gen})))

Promise.all(insertOrUpdate(knex, 'move', moves, {
        hasGen: true,
        replaceColumns: {
               "type": "type_id"
        },
        ignoreColumns: [ 'shortDescription', 'usageName' ],
        relations: {
               "type_id": { "table": "type", "refColumn": "name" }
        },
 }))
        .then((results) => console.log(resultRecords('move', results)))
        .finally(() => knex.destroy())