import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cacheFile = path.join(__dirname, "cache.json");

let cacheQueue = Promise.resolve();

async function readCache() {
    try {
        const data = await fs.readFile(cacheFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        if (error.code === "ENOENT") {
            return {};
        }

        throw error;
    }
}

async function writeCache(cache) {
    await fs.writeFile(
        cacheFile,
        JSON.stringify(cache, null, 4),
        "utf-8"
    );
}

export function getCache(key) {
    const operation = cacheQueue.then(async () => {
        const cache = await readCache();
        const entry = cache[key];

        if (!entry) {
            return null;
        }

        if (Date.now() > entry.expiresAt) {
            delete cache[key];
            await writeCache(cache);
            return null;
        }

        return entry.data;
    });

    cacheQueue = operation.catch(() => {});

    return operation;
}

export function setCache(key, data, ttl) {
    const operation = cacheQueue.then(async () => {
        const cache = await readCache();

        cache[key] = {
            data,
            expiresAt: Date.now() + ttl,
        };

        await writeCache(cache);
    });

    cacheQueue = operation.catch(() => {});

    return operation;
}