import { addToHistory, getSearchHistory } from "./src/storage/history.js";

await addToHistory({
    query: "naruto",
    animeId: 20,
    animeTitle: "Naruto",
});

const history = await getSearchHistory();

console.log(history);