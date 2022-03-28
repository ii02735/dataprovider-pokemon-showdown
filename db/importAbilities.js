const { insertOrUpdate, knex, resultRecords } = require('./db');
const abilities = require('../abilities').flatMap(ability =>
	ability.gen.map(gen => ({ ...ability, gen }))
);

Promise.all(
	insertOrUpdate(knex, 'ability', abilities, {
		hasGen: true,
		ignoreColumns: ['shortDescription'],
		replaceColumns: { usageName: 'usage_name' },
	})
)
	.then(results => console.log(resultRecords('ability', results)))
	.finally(() => knex.destroy());
