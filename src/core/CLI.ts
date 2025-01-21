import * as readline from 'readline';
import EventEmitter from 'events';

export class CLI extends EventEmitter {
    private rl: readline.Interface;

    constructor() {
        super();
        process.stdin.setRawMode(true);
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false
        });

        // Add global Ctrl+C handler
        process.on('SIGINT', () => {
            this.close();
            process.exit(0);
        });
    }

    async askQuestion(question: string): Promise<string> {
        console.log(`${question}\n> `);
        return new Promise((resolve) => {
            let input = '';
            
            const onData = (char: string) => {
                if (char === '\r' || char === '\n') {
                    process.stdout.write('\n');
                    cleanup();
                    resolve(input);
                } else if (char === '\u0003') { // Ctrl+C
                    cleanup();
                    resolve('exit'); // Treat Ctrl+C same as 'exit' command
                } else if (char === '\u007F') { // Backspace
                    if (input.length > 0) {
                        input = input.slice(0, -1);
                        process.stdout.write('\b \b');
                    }
                } else {
                    input += char;
                    process.stdout.write(char);
                }
            };

            const cleanup = () => {
                process.stdin.removeListener('data', onData);
            };

            process.stdin.on('data', onData);
        });
    }

    displayModelMessage(message: string): void {
        console.log("\n🤖 Model:", message);
    }

    displayError(error: string): void {
        console.error("\n❌ Error:", error);
    }

    displaySuccess(message: string): void {
        console.log("\n✅", message);
    }

    close(): void {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        this.rl.close();
        this.emit('close');
    }
} 