const { knex } = require('./db')
const pokemonTiers = require('../pokemonTier')
const { withoutSpaces } = require('../util')
const results = { table: 'pokemon', UPDATED: 0 }

Promise.all(pokemonTiers.map(async ({ pokemon:name, tier: short_name = null, gen, technically }) => {
    let rowPokemon = await knex('pokemon').where({ name, gen }).first(['id'])
    if(!rowPokemon){
        rowPokemon = await knex('pokemon').where({ name: withoutSpaces(name), gen }).first(['id'])
        if(!rowPokemon){
            console.log(`Pokémon ${name} introuvable en génération ${gen}`)
            return
        }
    }
    let rowTier = short_name ? await knex('tier').where({ short_name, gen }).first(['id']) : await knex('tier').where({ name: 'Untiered', gen }).first(['id']);
    console.log({ rowTier, name, short_name, gen })
    await knex('pokemon').update({ tier_id: rowTier.id, technically }).where({ name, gen })
    results.UPDATED++
})).then(() => console.log(results))
   .catch((err) => console.log(err))
   .finally(() => knex.destroy())