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

    const displayedResults = results.slice(0, 10);

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

    const statusMap = {
        FINISHED: "Finished",
        RELEASING: "Currently Airing",
        NOT_YET_RELEASED: "Not Yet Released",
        CANCELLED: "Cancelled",
        HIATUS: "On Hiatus",
    };

    const formatDate = (date) => {
        if (!date.year) {
            return "Unknown";
        }

        const parts = [date.year];

        if (date.month) {
            parts.push(String(date.month).padStart(2, "0"));
        }

        if (date.day) {
            parts.push(String(date.day).padStart(2, "0"));
        }

        return parts.join("-");
    };

    const startDate = formatDate(selectedAnime.startDate);
    const endDate = formatDate(selectedAnime.endDate);

    const aired =
        endDate === "Unknown" ? `${startDate} - ?` : `${startDate} - ${endDate}`;

    const score =
        selectedAnime.averageScore === null
            ? "Not rated"
            : `${selectedAnime.averageScore / 10}/10`;

    const episodes = selectedAnime.episodes ?? "Unknown";

    const status = statusMap[selectedAnime.status] || selectedAnime.status;

    const description = selectedAnime.description
        ? selectedAnime.description.replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]*>/g, "")
        : "No synopsis available.";

    console.log("");
    console.log("========================================");
    console.log(`${selectedTitle}`);
    console.log("========================================");
    console.log("");

    console.log(`>> Score: ${score}`);
    console.log(`>> Episodes: ${episodes}`);
    console.log(`>> Status: ${status}`);
    console.log(`>> Aired: ${aired}`);

    console.log("");
    console.log("Genres:");

    selectedAnime.genres.forEach((genre) => {
        console.log(`• ${genre}`);
    });

    console.log("");
    console.log("Story:");
    console.log(description);
} catch (error) {
    console.log("");
    console.log("Something went wrong while searching.");
    console.error(error.message);
}