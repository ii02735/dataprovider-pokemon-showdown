const { isRegional } = require("../../providers/learns");

test("Should return true when regional form encountered", () => {
  // Regional form case

  let species = {
    name: "Ninetales-Alola",
    forme: "Alola",
    baseSpecies: "Ninetales",
  };

  expect(isRegional(species)).toBe(true);

  // Regular form case

  species = {
    name: "Venusaur",
    forme: "",
  };

  expect(isRegional(species)).toBe(false);

  // Non-regional case

  species = {
    name: "Vensuaur-Mega",
    forme: "Mega",
  };

  expect(isRegional(species)).toBe(false);

  species = {
    name: "Venusaur-Gmax",
    forme: "Gmax",
  };

  expect(isRegional(species)).toBe(false);

  species = {
    name: "",
  };

  species = {
    name: "Growlithe-Hisui",
    forme: "Hisui",
  };

  expect(isRegional(species)).toBe(true);

  species = {
    name: "Weezing-Galar",
    forme: "Galar",
  };

  expect(isRegional(species)).toBe(true);
});
