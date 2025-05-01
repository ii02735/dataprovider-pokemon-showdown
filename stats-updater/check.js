/* Check stats files */
"use strict";
import { check, checkAndUpdate } from "./update-months.js";
import { loadMonth } from "./load-month.js";

let currMonth = -1;
let monthsList = [];

function checkNext() {
  currMonth++;
  if (currMonth >= monthsList.length) {
    console.log("DONE: Check completed.");
    checkAndUpdate();
    return;
  }
  loadMonth(monthsList[currMonth], (err) => {
    if (err) {
      console.log("Error parsing month: " + monthsList[currMonth]);
    } else {
      console.log("DONE: Parsed month data for " + monthsList[currMonth]);
    }
    checkNext();
  });
}

export const start = () => {
  console.log("Checking usage stats files...");
  monthsList = check().list;
  if (monthsList.length === 0) {
    console.log("DONE: Nothing to check.");
    checkAndUpdate();
  } else {
    checkNext();
  }
};
