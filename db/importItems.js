const { insertOrUpdate, knex, resultRecords } = require('./db');
const items = require('../items').flatMap(item =>
	item.gen.map(gen => ({ ...item, gen }))
);

Promise.all(
	insertOrUpdate(knex, 'item', items, {
		hasGen: true,
		replaceColumns: { usageName: 'usage_name' },
	})
)
	.then(results => console.log(resultRecords('item', results)))
	.finally(() => knex.destroy());