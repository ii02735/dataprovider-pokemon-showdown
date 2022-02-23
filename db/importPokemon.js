const { knex } = require('./db')
const pokemon = require('./pokemon').flatMap((pokemon_object) => pokemon_object.gen.map((gen) => ({...pokemon_object,gen})))
let results = { table: 'pokemon', CREATED: 0, UPDATED: 0 }
module.exports.execute = () => Promise.all(pokemon.map(async(object) => {
   
    let row = await knex('type').where({name: object.type_1, gen: object.gen}).first(['id'])
    object.type_1_id = row.id
    
    if(object.type_2){
       row = await knex('type').where({name: object.type_2, gen: object.gen}).first(['id']);
       object.type_2_id = row.id
    }

    for(const abilityKey of ['ability_1','ability_2','ability_hidden'])
    {
        if(object.hasOwnProperty(abilityKey)){
            row = await knex('ability').where({name: object[abilityKey], gen: object.gen}).first(['id']);
            object[`${abilityKey}_id`] = row.id
            delete object[abilityKey]
        }     
    }

    delete object.baseForm
    delete object.prevo
    delete object.type_1
    delete object.type_2
     
    row = await knex('pokemon').where({name: object.name, gen: object.gen}).first(['id'])
    if(row){
        await knex('pokemon').update(object).where({ id: row.id })
        results.UPDATED++
    }else{
        await knex('pokemon').insert(object)
        results.CREATED++
    }
}))
.then(() => Promise.all(pokemon.map(async(object) => {
    let row = null;
    if(object.baseForm){
        row = await knex('pokemon').where({name: object.baseForm, gen: object.gen}).first(['id']);
        if(row)
             object.base_form_id = row.id;
    }
    
    if(object.prevo){
        row = await knex('pokemon').where({name: object.prevo, gen: object.gen}).first(['id']);
        if(row)
             object.prevo_id = row.id;
    }

    delete object.baseForm
    delete object.prevo
    delete object.type_1
    delete object.type_2
     
    row = await knex('pokemon').where({name: object.name, gen: object.gen}).first(['id']);

    await knex('pokemon').update(object).where({id: row.id})
    
})))
.then(() => console.log('pokemon',results))  
.finally(() => knex.destroy());