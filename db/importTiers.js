const { insertOrUpdate, knex, resultRecords} = require('./db')
const fs = require('fs')
const tiers = JSON.parse(fs.readFileSync('json/tiers.json')).flatMap((tier) => tier.gen.map((gen) => ({...tier,gen})))

module.exports.execute = () => Promise.all(insertOrUpdate(knex,'tier',tiers, {
              hasGen: true,
              replaceColumns: { "parent": "parent_id", 
                                "shortName": "short_name",
                                "usageName": "usage_name",
                                "ladderRef": "ladder_ref",
                                "isDouble": "is_double",
                                "maxPokemon": "max_pokemon" },
              relations: { 
                     "parent_id": { "table": "tier", "refColumn": "name" }  
              },
       }))
       .then((results) => console.log(resultRecords('tier', results)))
       .finally(() => knex.destroy()) 

this.execute()