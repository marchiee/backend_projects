import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheFile = path.join(__dirname, "cache.json");

export async function getCache(key) {   /*key -> the cache needs a way to distinguish one cached piece of data from another(example "search:naruto")*/
    try {
        const data = await fs.readFile(cacheFile, "utf-8");
        const cache = JSON.parse(data);

        const entry = cache[key];

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            delete cache[key];

            await fs.writeFile(
                cacheFile,
                JSON.stringify(cache, null, 4),
                "utf-8"
            );

            return null;
        }

        return entry.data;
    } catch (error) {
        if (error.code === "ENOENT") {
            return null;
        }

        throw error;
    }
}

export async function setCache(key, data, ttl) {
    let cache = {};

    try {
        const fileData = await fs.readFile(cacheFile, "utf-8");
        cache = JSON.parse(fileData);
    } catch (error) {
        if (error.code !== "ENOENT") {
            throw error;
        }
    }

    cache[key] = {
        data,
        expiresAt: Date.now() + ttl,
    };

    await fs.writeFile(
        cacheFile,
        JSON.stringify(cache, null, 4),
        "utf-8"
    );
}