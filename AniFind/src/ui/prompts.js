import { input, select } from "@inquirer/prompts";

export async function askQuestion(message) {
    return await input({
        message,
    });
}

export async function selectOption(message, choices) {
    return await select({
        message,
        choices,
    });
}