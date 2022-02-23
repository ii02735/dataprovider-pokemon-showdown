const { knex } = require('./db');
const { withoutSpaces } = require('./util');
const learns = require('./learns').flatMap((learn) => learn.gen.map((gen) => ({...learn,gen})))
let results = { table: 'pokemon_move', CREATED: 0 }
let learnCount = 0;

module.exports.execute = async () => {
    for(const object of learns)
    {

        learnCount++;
        console.log(`${learnCount}/${learns.length}`)        
        let pokemonRow = await knex('pokemon').where({name: object.pokemon, gen: object.gen}).first(['id'])
        if(!pokemonRow){
            pokemonRow = await knex('pokemon').where({name: withoutSpaces(object.pokemon), gen: object.gen}).first(['id'])
            if(!pokemonRow)
            {
                console.log(`Pokémon ${object.pokemon} en génération ${object.gen} introuvable`)
                continue
            }
        }
        
        let moveRow = await knex('move').where({name: object.move, gen: object.gen}).first(['id'])
        
        if(!moveRow){
            moveRow = await knex('move').where({name: withoutSpaces(object.move), gen: object.gen}).first(['id'])
            if(!moveRow){
                console.log(`Move ${object.move} en génération ${object.gen} introuvable`)
                continue
            }
                
        }

        const samePokemonMoveRow = await knex('pokemon_move').where({pokemon_id: pokemonRow.id, move_id: moveRow.id}).first(['id'])
        if(samePokemonMoveRow)
            continue;

        await knex('pokemon_move').insert({pokemon_id: pokemonRow.id, move_id: moveRow.id, gen: object.gen})
        results.CREATED++;
    }
}