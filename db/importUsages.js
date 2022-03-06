const { knex } = require('./db')
const axios = require('axios')
const { pokemonLittleName } = require('../util')

const gen = 8

const generateHerokuUrl = (date, tierName, ladderRef, pokemonName) => `https://smogon-usage-stats.herokuapp.com/${date}/${tierName}/${ladderRef}/${pokemonName}`
const formatDate = (dateObject) => {
    const d = dateObject
    let month = d.getMonth() + 1
    const year = d.getFullYear();
    if (month < 10)
        month = '0' + month;
    return [year, month].join('/')
}

const date = new Date
let currentDate = formatDate(date)
let prevDate = date
let response = null
prevDate.setMonth(prevDate.getMonth() - 1);
prevDate = formatDate(prevDate);



(async () => {
    let pokemonRows = await knex.select('name', 'usage_name', 'tier_id').from('pokemon').where({ gen }).whereNotNull('tier_id').whereNotNull('pokemon.usage_name');
    Promise.all(pokemonRows.map(async(pokemon) => {
        let tier = await knex('tier').where({ id: pokemon.tier_id }).first()
        if (tier.parent_id)
            tier = await knex('tier').where({ id: tier.parent_id }).first()
        if (!tier.playable)
            return null;
        if(!tier.ladder_ref)
            return null;
        const tierName = 'gen' + gen + tier.usage_name;
        const ladderRef = tier.ladder_ref;
        const pokemonName = pokemonLittleName(pokemon.name);
        try{
            response = await axios.get(generateHerokuUrl(currentDate, tierName, ladderRef, pokemonName))
            return {pokemonName, data: response.data}
        }catch(e){
           
                try {
                    response = await axios.get(generateHerokuUrl(prevDate, tierName, ladderRef, pokemonName))
                    return {pokemonName, data: response.data}
                } catch (e) {
                    return null;
                }
            
        }
 
    })).then((responses) => responses.filter((response) => response !== null))
       .then((responses) => {
           for(const object of responses)
            console.log(object.pokemonName)
       }).finally(() => knex.destroy())


  
})()

// TODO: create method that will import the fetched data to the DB

// Promise.all(gens.map(async (gen) => {
//     let promises = [];
    
    
//     for (const pokemonRow of pokemonRows) {
//         let tierRow = await knex('tier').where({ id: pokemonRow.tier_id }).first()
//         if (tierRow.parent_id)
//             tierRow = await knex('tier').where({ id: tierRow.parent_id }).first()
//         if (!tierRow.playable)
//             continue;

//         const tierName = 'gen' + gen + tierRow.usage_name;
//         const ladderRef = tierRow.ladder_ref;
//         promises.push(axios.get(generateHerokuUrl(currentDate, tierName, ladderRef, pokemonLittleName(pokemonRow.name))))

//     }

//     return promises;
// })).then((res) => console.log(res.data))
//    .catch((err) => console.log(err.data))  

