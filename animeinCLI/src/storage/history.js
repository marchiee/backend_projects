import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const historyFile = path.join(__dirname, "history.json");

export async function getSearchHistory() {
    try {
        const data = await fs.readFile(historyFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
}

export async function addToHistory(entry) {
    const history = await getSearchHistory();

    history.push({
        ...entry,
        searchedAt: new Date().toISOString(),
    });

    await fs.writeFile(
        historyFile,
        JSON.stringify(history, null, 4),
        "utf-8"
    );
}