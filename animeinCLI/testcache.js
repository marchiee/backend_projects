import { getCache, setCache } from "./src/storage/cache.js";

await setCache("test", { message: "Hello Cache!" }, 2000);

console.log("Immediately:", await getCache("test"));

setTimeout(async () => {
    console.log("After 3 seconds:", await getCache("test"));
}, 3000);