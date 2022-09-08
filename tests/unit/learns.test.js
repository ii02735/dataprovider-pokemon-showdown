import LearnProvider from "../../src/providers/learns.js";
import ModdedDex from "./__mocks__/ModdedDex.js";

test("Should return true when regional form encountered", () => {
  const learnProvider = new LearnProvider(ModdedDex);

  // Regional form case

  let species = {
    name: "Ninetales-Alola",
    forme: "Alola",
    baseSpecies: "Ninetales",
  };

  expect(learnProvider.isRegional(species)).toBe(true);

  // Regular form case

  species = {
    name: "Venusaur",
    forme: "",
  };

  expect(learnProvider.isRegional(species)).toBe(false);

  // Non-regional case

  species = {
    name: "Vensuaur-Mega",
    forme: "Mega",
  };

  expect(learnProvider.isRegional(species)).toBe(false);

  species = {
    name: "Venusaur-Gmax",
    forme: "Gmax",
  };

  expect(learnProvider.isRegional(species)).toBe(false);

  species = {
    name: "",
  };

  species = {
    name: "Growlithe-Hisui",
    forme: "Hisui",
  };

  expect(learnProvider.isRegional(species)).toBe(true);

  species = {
    name: "Weezing-Galar",
    forme: "Galar",
  };

  expect(learnProvider.isRegional(species)).toBe(true);
});
