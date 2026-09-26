#!/usr/bin/env node

import { askQuestion } from "../src/ui/prompts.js";
import { searchAnime } from "../src/api/animeApi.js";

console.log("");
console.log("===================================");
console.log("          Anime CLI ^ ^");
console.log("===================================");
console.log("");

const anime = await askQuestion("Which anime are you looking for? ");

console.log("");
console.log("Searching...");

try {
    const results = await searchAnime(anime);

    console.log("");

    if (results.length === 0) {
        console.log("No anime found.");
        process.exit(0);
    }

    const displayedResults = results.slice(0, 5);

    console.log(`Found ${results.length} results.`);
    console.log("");

    displayedResults.forEach((anime, index) => {
        const title = anime.title.english || anime.title.romaji;
        console.log(`${index + 1}. ${title}`);
    });

    console.log("");

    const choice = await askQuestion("Which one do you want? ");

    const selectedIndex = Number(choice);

    if (
        !Number.isInteger(selectedIndex) ||
        selectedIndex < 1 ||
        selectedIndex > displayedResults.length
    ) {
        console.log("");
        console.log("Invalid choice.");
        process.exit(0);
    }

    const selectedAnime = displayedResults[selectedIndex - 1];

    console.log("");
    const selectedTitle =
        selectedAnime.title.english || selectedAnime.title.romaji;

    console.log(`You selected: ${selectedTitle}`);
} catch (error) {
    console.log("");
    console.log("Something went wrong while searching.");
    console.error(error.message);
}