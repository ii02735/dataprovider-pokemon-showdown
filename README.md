## Pokemon Showdown API Data Provider

This application has the purpose to provide data of Pokemon Showdown's resources by reading JSON files.

These JSON files are created by using the [SMOGON Pokemon Showdown repository's assets](https://github.com/smogon/pokemon-showdown), and [GeoDaz's](https://github.com/GeoDaz) script named `dataToJson.js`

This GitHub repository is **bound to a Continuous Development process** on Heroku. 

The API can be called at https://api-data-pokemon-showdown.herokuapp.com/

Available endpoints :

- `/abilities`
- `/items`
- `/learns`
- `/moves`
- `/natures`
- `/pokemons`
- `/pokemonTier`

### Instructions for local execution

If you want to use the data provider on your machine, you must run the following commands :

```sh
git submodule init # Initializes the submodule
git submodule update --recursive --merge # Retrieve and update the submodule's content
npm install
npm run heroku-prebuild # Install submodule's dependencies + execute the build process (required for retrieving the JSON resources)
npm run heroku-postbuild # Writes the JSON resources in the json folder
```


**Warning :** the `check_submodule_diff.js` script cannot be executed locally because it requires this GitHub repository **owner's PAT (personal access token)**
