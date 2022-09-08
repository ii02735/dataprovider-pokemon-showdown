export default {
  modulePathIgnorePatterns: [
    "<rootDir>/pokemon-showdown",
    "<rootDir>/Smogon-Stats-Viewer/pokemon-showdown",
  ],
  testPathIgnorePatterns: ["/node_modules/"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  testMatch: ["<rootDir>/tests/**/*.test.js"],
};
