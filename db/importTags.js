const { insertOrUpdate, knex, resultRecords } = require('./db')
const fs = require('fs')
const tags = JSON.parse(fs.readFileSync('json/tags.json'))

Promise.all(insertOrUpdate(knex,'tag',tags))
       .then((results) => console.log(resultRecords('tag', results)))
       .finally(() => knex.destroy()) 