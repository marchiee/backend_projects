#!/usr/bin/env node

import { askQuestion, selectOption } from "../src/ui/prompts.js";
import {
    searchAnime,
    getAnimeDetails,
    getTopAnime,
} from "../src/api/animeApi.js";
import {
    addToHistory,
    getSearchHistory,
} from "../src/storage/history.js";

const LINE = "========================================";

function displayHeader(title) {
    console.log("");
    console.log(LINE);
    console.log(`              ${title}`);
    console.log(LINE);
}

function displayAnimeDetails(animeDetails) {
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
        if (!date?.year) {
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
              .trim()
        : "No synopsis available.";

    displayHeader(selectedTitle);

    console.log("");
    console.log(`Score     : ${score}`);
    console.log(`Episodes  : ${episodes}`);
    console.log(`Status    : ${status}`);
    console.log(`Aired     : ${aired}`);

    console.log("");
    console.log("Genres");
    console.log("----------------------------------------");

    if (animeDetails.genres?.length) {
        animeDetails.genres.forEach((genre) => {
            console.log(`- ${genre}`);
        });
    } else {
        console.log("No genres available.");
    }

    console.log("");
    console.log("Story");
    console.log("----------------------------------------");
    console.log(description);

    console.log("");
    console.log("Where to Watch");
    console.log("----------------------------------------");

    const streamingLinks =
        animeDetails.externalLinks?.filter(
            (link) => link.type === "STREAMING"
        ) || [];

    if (streamingLinks.length === 0) {
        console.log("No streaming platforms found.");
    } else {
        streamingLinks.forEach((link) => {
            console.log(`- ${link.site}`);
            console.log(`  ${link.url}`);
        });
    }

    console.log("");
}

async function searchAnimeFlow() {
    const searchQuery = (
        await askQuestion("Which anime are you looking for?")
    ).trim();

    if (!searchQuery) {
        console.log("");
        console.log("Please enter an anime name.");
        return;
    }

    console.log("");
    console.log(`Searching for "${searchQuery}"...`);

    try {
        const results = await searchAnime(searchQuery);

        if (results.length === 0) {
            console.log("");
            console.log("No anime found.");
            return;
        }

        const displayedResults = results.slice(0, 10);

        console.log("");
        console.log(`Found ${displayedResults.length} results.`);

        const selectedAnime = await selectOption(
            "Select an anime:",
            [
                ...displayedResults.map((anime, index) => ({
                    name: `${index + 1}. ${
                        anime.title.english || anime.title.romaji
                    } (${anime.startDate.year || "Unknown"})`,
                    value: anime,
                })),
                {
                    name: "Back to Main Menu",
                    value: null,
                },
            ]
        );

        if (selectedAnime === null) {
            return;
        }

        console.log("");
        console.log("Loading anime details...");

        const animeDetails = await getAnimeDetails(selectedAnime.id);

        try {
            await addToHistory({
                query: searchQuery,
                animeId: selectedAnime.id,
                animeTitle:
                    animeDetails.title.english ||
                    animeDetails.title.romaji,
            });
        } catch {
            console.log("Warning: Could not save this search to history.");
        }

        displayAnimeDetails(animeDetails);
    } catch (error) {
        console.log("");
        console.log("Unable to complete the search.");
        console.log(`Reason: ${error.message}`);
    }
}

async function topAnimeFlow() {
    while (true) {
        const choice = await selectOption(
            "Choose a ranking:",
            [
                {
                    name: "Top Rated Anime",
                    value: "SCORE_DESC",
                },
                {
                    name: "Most Popular Anime",
                    value: "POPULARITY_DESC",
                },
                {
                    name: "Currently Trending Anime",
                    value: "TRENDING_DESC",
                },
                {
                    name: "Back to Main Menu",
                    value: "back",
                },
            ]
        );

        if (choice === "back") {
            return;
        }

        try {
            console.log("");
            console.log("Loading anime list...");

            const results = await getTopAnime(choice);

            if (results.length === 0) {
                console.log("");
                console.log("No anime found.");
                continue;
            }

            console.log("");
            console.log(`Found ${results.length} anime.`);

            const selectedAnime = await selectOption(
                "Select an anime:",
                [
                    ...results.map((anime, index) => ({
                        name: `${index + 1}. ${
                            anime.title.english || anime.title.romaji
                        } (${anime.startDate.year || "Unknown"}) - ${
                            anime.averageScore === null
                                ? "Not rated"
                                : `${anime.averageScore / 10}/10`
                        }`,
                        value: anime,
                    })),
                    {
                        name: "Back to Ranking Menu",
                        value: null,
                    },
                ]
            );

            if (selectedAnime === null) {
                continue;
            }

            console.log("");
            console.log("Loading anime details...");

            const animeDetails = await getAnimeDetails(selectedAnime.id);

            displayAnimeDetails(animeDetails);

            return;
        } catch (error) {
            console.log("");
            console.log("Unable to load the anime list.");
            console.log(`Reason: ${error.message}`);
        }
    }
}

async function searchHistoryFlow() {
    try {
        const history = await getSearchHistory();

        if (history.length === 0) {
            console.log("");
            console.log("Your search history is empty.");
            return;
        }

        displayHeader("Search History");

        [...history].reverse().forEach((entry, index) => {
            console.log(`${index + 1}. ${entry.animeTitle}`);
            console.log(`   Search : ${entry.query}`);
            console.log(
                `   Date   : ${new Date(entry.searchedAt).toLocaleString()}`
            );
            console.log("");
        });
    } catch (error) {
        console.log("");
        console.log("Unable to load search history.");
        console.log(`Reason: ${error.message}`);
    }
}

async function main() {
    displayHeader("Anime CLI");

    while (true) {
        console.log("");

        const choice = await selectOption(
            "What would you like to do?",
            [
                {
                    name: "Search Anime",
                    value: "search",
                },
                {
                    name: "Top Anime",
                    value: "top",
                },
                {
                    name: "Search History",
                    value: "history",
                },
                {
                    name: "Exit",
                    value: "exit",
                },
            ]
        );

        console.log("");

        switch (choice) {
            case "search":
                await searchAnimeFlow();
                break;

            case "top":
                await topAnimeFlow();
                break;

            case "history":
                await searchHistoryFlow();
                break;

            case "exit":
                console.log("Thanks for using Anime CLI.");
                return;
        }
    }
}

main();