#!/usr/bin/env mode

//upper line is called a shebang, which tells systems that this file should be executed using Node.js.

import { askQuestion } from "../src/ui/prompts.js";

console.log("");
console.log("===================================");
console.log("          Anime CLI 🎌");
console.log("===================================");
console.log("");

const anime = await askQuestion("Which anime are you looking for? ");

console.log("");
console.log(`You searched for: ${anime}`);