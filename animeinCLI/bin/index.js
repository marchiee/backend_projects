#!/usr/bin/env node

import { askQuestion } from "../src/ui/prompts.js";
import { searchAnime, getAnimeDetails } from "../src/api/animeApi.js";

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
    const year = anime.startDate.year || "Unknown";

    console.log(`${index + 1}. ${title} (${year})`);
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
    console.log("Getting anime details...");

    const animeDetails = await getAnimeDetails(selectedAnime.id);

    const selectedTitle =
        animeDetails.title.english || animeDetails.title.romaji;

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

    const startDate = formatDate(animeDetails.startDate);
    const endDate = formatDate(animeDetails.endDate);

    const aired =
        endDate === "Unknown"
            ? `${startDate} - ?`
            : `${startDate} - ${endDate}`;

    const score =
        animeDetails.averageScore === null
            ? "Not rated"
            : `${animeDetails.averageScore / 10}/10`;

    const episodes = animeDetails.episodes ?? "Unknown";

    const status =
        statusMap[animeDetails.status] || animeDetails.status;

    const description = animeDetails.description
        ? animeDetails.description
              .replace(/<br\s*\/?>/gi, "\n")
              .replace(/<[^>]*>/g, "")
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

    animeDetails.genres.forEach((genre) => {
        console.log(`• ${genre}`);
    });

    console.log("");
    console.log("Story:");
    console.log(description);

    console.log("");
    console.log("Where to Watch:");

    if (
        !animeDetails.streamingEpisodes ||
        animeDetails.streamingEpisodes.length === 0
    ) {
        console.log("No streaming links found.");
    } else {
        animeDetails.streamingEpisodes.forEach((episode) => {
            console.log("");
            console.log(`▶ ${episode.title}`);
            console.log(`  ${episode.site}`);
            console.log(`  ${episode.url}`);
        });
    }
} catch (error) {
    console.log("");
    console.log("Something went wrong.");
    console.error(error.message);
}