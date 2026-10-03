#!/usr/bin/env node

import { askQuestion, selectOption } from "../src/ui/prompts.js";
import { searchAnime, getAnimeDetails, getTopAnime } from "../src/api/animeApi.js";



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
    console.log(selectedTitle);
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

    const streamingLinks =
        animeDetails.externalLinks?.filter(
            (link) => link.type === "STREAMING"
        ) || [];

    if (streamingLinks.length === 0) {
        console.log("No streaming platforms found.");
    } else {
        streamingLinks.forEach((link) => {
            console.log("");
            console.log(`- ${link.site}:`);
            console.log(`  ${link.url}`);
        });
    }
}

async function searchAnimeFlow() {
    const searchQuery = await askQuestion("Which anime are you looking for? ");

    console.log("");
    console.log("Searching...");

    try {
        const results = await searchAnime(searchQuery);

        console.log("");

        if (results.length === 0) {
            console.log("No anime found.");
            return;
        }

        const displayedResults = results.slice(0, 10);

        console.log(`Found ${displayedResults.length} results.`);
        console.log("");

        const selectedAnime = await selectOption(
            "Which one do you want?",
            displayedResults.map((anime, index) => ({
                name: `${index + 1}. ${anime.title.english || anime.title.romaji
                    } (${anime.startDate.year || "Unknown"})`,
                value: anime,
            }))
        );

        console.log("");
        console.log("Getting anime details...");

        const animeDetails = await getAnimeDetails(selectedAnime.id);

        displayAnimeDetails(animeDetails);
    } catch (error) {
        console.log("");
        console.log("Something went wrong.");
        console.error(error.message);
    }
}




async function topAnimeFlow() {
    while (true) {
        const choice = await selectOption(
            "What kind of anime list would you like?",
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
            console.log("Fetching anime list...");

            const results = await getTopAnime(choice);

            if (results.length === 0) {
                console.log("No anime found.");
                continue;
            }

            console.log("");
            console.log(`Found ${results.length} anime.`);
            console.log("");

            const selectedAnime = await selectOption(
                "Choose an anime to view its details:",
                [
                    ...results.map((anime, index) => ({
                        name: `${index + 1}. ${anime.title.english || anime.title.romaji
                            } (${anime.startDate.year || "Unknown"}) - ${anime.averageScore === null
                                ? "Not rated"
                                : `${anime.averageScore / 10}/10`
                            }`,
                        value: anime,
                    })),
                    {
                        name: "Back to ranking menu",
                        value: null,
                    },
                ]
            );

            if (selectedAnime === null) {
                continue;
            }

            console.log("");
            console.log("Getting anime details...");

            const animeDetails = await getAnimeDetails(selectedAnime.id);

            displayAnimeDetails(animeDetails);

            return;
        } catch (error) {
            console.log("");
            console.log("Something went wrong.");
            console.error(error.message);
        }
    }
}



async function main() {
    console.log("");
    console.log("===================================");
    console.log("           Anime CLI ^ ^");
    console.log("===================================");

    while (true) {
        console.log("");

        const choice = await selectOption(
            "What would you like to do?",
            [
                {
                    name: "Search anime",
                    value: "search",
                },
                {
                    name: "Top anime",
                    value: "top",
                },
                {
                    name: "Search history",
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
                console.log("Search history feature coming soon!");
                break;

            case "exit":
                console.log("Thanks for using Anime CLI! ^ ^");
                return;
        }
    }
}

main();