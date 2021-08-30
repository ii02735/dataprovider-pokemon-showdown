const fileSystem = require('fs');


const log = (name, e) => {
	if (e) {
		console.error(`Erreur lors de la création du  fichier ${name}.json :`, e);
	} else {
		console.info(`Création du fichier ${name}.json réussi`);
	}
};

const removeParenthesis = string => string.replace(/\(+/g, '').replace(/\)+/g, '');

// prettier-ignore
const writeFile = (fileName, values) => fileSystem.writeFile(
	`json/${fileName}.json`,
	JSON.stringify(values),
	e => log(fileName, e)
);

const pokemonIsStandard = value =>
	!value.isNonstandard ||
	value.isNonstandard === 'Past' || // keep pokemons that are not import in gen8
	value.isNonstandard === 'Gigantamax' || // keep Gmax forms
	value.isNonstandard === 'Unobtainable' &&  // keep Unobtainable real mons
	value.tier !== 'Illegal'

module.exports.writeFile = writeFile
module.exports.pokemonIsStandard = pokemonIsStandard
module.exports.removeParenthesis = removeParenthesis