import { getTopAnime } from "./src/api/animeApi.js";

const results = await getTopAnime();

results.forEach((anime, index) => {
    const title = anime.title.english || anime.title.romaji;
    const year = anime.startDate.year || "Unknown";

    console.log(
        `${index + 1}. ${title} (${year}) - ${
            anime.averageScore / 10
        }/10`
    );
});