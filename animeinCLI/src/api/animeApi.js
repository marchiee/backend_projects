const query = `
  query ($search: String) {
    Page(perPage: 5) {
      media(search: $search, type: ANIME) {
        id
        title {
          romaji
          english
          native
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
      query,
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