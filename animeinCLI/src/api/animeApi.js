export async function searchAnime(query) {
  const response = await fetch(
    `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    const errorData = await response.text();
    console.log("API response:", errorData);

    throw new Error(`API request failed: ${response.status}`);
  }

  const data = await response.json();

  return data.data;
}