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

  return result.data.Page.media;
}

export async function getAnimeDetails(id) {
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

  return result.data.Media;
}


export async function getTopAnime(sort) {
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

    return result.data.Page.media;
}