
import fs from "node:fs/promises";
import path from "node:path";
import { addToHistory, getSearchHistory } from "./src/storage/history.js";

const testFile = path.join(process.cwd(), "test-history.json");

process.env.ANIME_HISTORY_FILE = testFile;

const { addToHistory, getSearchHistory } = await import(
    "./src/storage/history.js"
);

try {
    await fs.writeFile(testFile, "[]", "utf-8");

    await addToHistory({
        query: "naruto",
        animeId: 20,
        animeTitle: "Naruto",
    });

    const history = await getSearchHistory();

    if (history.length !== 1 || history[0].animeTitle !== "Naruto") {
        throw new Error("History test failed.");
    }

    console.log("History test passed!");
    console.log(history);
} finally {
    await fs.rm(testFile, { force: true });
}