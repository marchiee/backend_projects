import { getCache, setCache } from "../storage/cache.js";

const API_URL = "https://graphql.anilist.co";

const searchQuery = `
    query ($search: String) {
        Page(perPage: 10) {
            media(search: $search, type: ANIME) {
                id
                title {
                    romaji
                    english
                    native
                }
                startDate {
                    year
                }
            }
        }
    }
`;

const detailsQuery = `
    query ($id: Int) {
        Media(id: $id, type: ANIME) {
            id
            title {
                romaji
                english
                native
            }
            averageScore
            episodes
            status
            startDate {
                year
                month
                day
            }
            endDate {
                year
                month
                day
            }
            genres
            description
            externalLinks {
                url
                site
                type
            }
        }
    }
`;

const topAnimeQuery = `
    query ($sort: [MediaSort]) {
        Page(perPage: 10) {
            media(
                type: ANIME
                sort: $sort
            ) {
                id
                title {
                    romaji
                    english
                    native
                }
                averageScore
                episodes
                status
                startDate {
                    year
                    month
                    day
                }
            }
        }
    }
`;

async function makeRequest(query, variables) {
    const response = await fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query,
            variables,
        }),
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors?.length) {
        throw new Error(result.errors[0].message);
    }

    return result.data;
}

export async function searchAnime(search) {
    const cacheKey = `search:${search.toLowerCase().trim()}`;

    const cachedResults = await getCache(cacheKey);

    if (cachedResults) {
        return cachedResults;
    }

    const data = await makeRequest(searchQuery, {
        search,
    });

    const results = data.Page.media;

    try {
        await setCache(cacheKey, results, 600000);
    } catch {
    }

    return results;
}

export async function getAnimeDetails(id) {
    const cacheKey = `details:${id}`;

    const cachedDetails = await getCache(cacheKey);

    if (cachedDetails) {
        return cachedDetails;
    }

    const data = await makeRequest(detailsQuery, {
        id,
    });

    const animeDetails = data.Media;

    try {
        await setCache(cacheKey, animeDetails, 3600000);
    } catch {
    }

    return animeDetails;
}

export async function getTopAnime(sort) {
    const cacheKey = `top:${sort}`;

    const cachedResults = await getCache(cacheKey);

    if (cachedResults) {
        return cachedResults;
    }

    const data = await makeRequest(topAnimeQuery, {
        sort: [sort],
    });

    const animeList = data.Page.media;

    try {
        await setCache(cacheKey, animeList, 600000);
    } catch {
    }

    return animeList;
}