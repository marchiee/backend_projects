import { resolve } from "node:dns";
import readline from "node:readline";

export function askQuestion(question){
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    return new Promise((resolve)=>{
        rl.question(question,(answer)=>{ //asks question
            rl.close();
            resolve(answer);
        });
    });
}
