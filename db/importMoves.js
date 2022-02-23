const { knex } = require('./db')
const moves = require('./moves').flatMap((move) => move.gen.map((gen) => ({...move,gen})))
let results = { table: 'move', CREATED: 0, UPDATED: 0 }
module.exports.execute = () => Promise.all(moves.map(async(object) => {
            const type = await knex('type').where({name: object.type, gen: object.gen}).first(['id'])
            delete object.shortDescription
            delete object.type
            object.type_id = type.id
            const row = await knex('move').where(object).first(['id'])
            if(row){
                await knex('move').update(object).where({ id: row.id })
                results.UPDATED++
            }else{
                await knex('move').insert(object)
                results.CREATED++
            }
        }))
       .then(() => console.log('move',results))  
       .finally(() => knex.destroy())