import { getCache, setCache } from "../storage/cache.js";

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
                type: ANIME,
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



export async function searchAnime(search) {
  const cacheKey = `search:${search.toLowerCase().trim()}`;
  const cachedResults = await getCache(cacheKey);
  if (cachedResults) {
    return cachedResults;
  }
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: searchQuery,
      variables: {
        search,
      },
    }),
  });


  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result = await response.json();
  await setCache(cacheKey, result.data.Page.media, 600000);

  return result.data.Page.media;
}

export async function getAnimeDetails(id) {
  const cacheKey = `details:${id}`;

  const cachedDetails = await getCache(cacheKey);

  if (cachedDetails) {
    return cachedDetails;
  }

  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      query: detailsQuery,
      variables: {
        id,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const result = await response.json();

  if (result.errors?.length) {
    throw new Error(result.errors[0].message);
  }

  const animeDetails = result.data.Media;

  await setCache(cacheKey, animeDetails, 3600000);

  return animeDetails;
}


export async function getTopAnime(sort) {
    const cacheKey = `top:${sort}`;

    const cachedResults = await getCache(cacheKey);

    if (cachedResults) {
        return cachedResults;
    }

    const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            query: topAnimeQuery,
            variables: {
                sort: [sort],
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors?.length) {
        throw new Error(result.errors[0].message);
    }

    const animeList = result.data.Page.media;

    await setCache(cacheKey, animeList, 600000);

    return animeList;
}