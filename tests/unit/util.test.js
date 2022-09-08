import { withoutSpaces } from "../../src/libs/util.js";

test("The withoutSpaces function should return the correct usageName", () => {
  const testSample = [
    {
      input: "Bulbasaur",
      expected: "bulbasaur",
    },
    {
      input: "Venusaur-Gmax",
      expected: "venusaurgmax",
    },
    {
      input: "Farfetch’d",
      expected: "farfetchd",
    },
  ];
  for (const { input, expected } of testSample) {
    expect(withoutSpaces(input)).toBe(expected);
  }
});
