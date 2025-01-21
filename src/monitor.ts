import { StatusMonitor } from './core/StatusMonitor';
import * as fs from 'fs';
import * as readline from 'readline';

class StatusMonitorProcess {
    private monitor: StatusMonitor;
    private logFile = 'agent.log';
    private currentPosition = 0;

    constructor() {
        console.log('Starting Status Monitor...');
        this.monitor = new StatusMonitor();
        this.watchLogFile();

        process.on('SIGINT', () => {
            process.exit(0);
        });
    }

    private async watchLogFile(): Promise<void> {
        // Read all existing logs first
        if (fs.existsSync(this.logFile)) {
            const fileStream = fs.createReadStream(this.logFile);
            const rl = readline.createInterface({
                input: fileStream,
                crlfDelay: Infinity
            });

            // Process each existing line
            for await (const line of rl) {
                this.processLogLine(line);
            }

            // Set current position to end of file
            this.currentPosition = fs.statSync(this.logFile).size;
        }

        // Watch for changes
        fs.watch(this.logFile, (eventType) => {
            if (eventType === 'change') {
                this.readNewLines();
            }
        });
    }

    private readNewLines(): void {
        const fileSize = fs.statSync(this.logFile).size;
        if (fileSize < this.currentPosition) {
            // File was truncated, reset position
            this.currentPosition = 0;
        }

        if (fileSize > this.currentPosition) {
            const stream = fs.createReadStream(this.logFile, {
                start: this.currentPosition,
                encoding: 'utf8'
            });

            const rl = readline.createInterface({
                input: stream,
                crlfDelay: Infinity
            });

            rl.on('line', (line) => {
                this.processLogLine(line);
            });

            rl.on('close', () => {
                this.currentPosition = fileSize;
            });
        }
    }

    private processLogLine(line: string): void {
        try {
            // Parse the log line
            const match = line.match(/\[(.*?)\] \[(.*?)\] (.*)/);
            if (match) {
                const [, timestamp, namespace, message] = match;
                
                // Handle agent status messages specially
                if (namespace === 'agent:status') {
                    this.monitor.updateStatus(message);
                } else {
                    this.monitor.addLog(message);
                }
            }
        } catch (error) {
            console.error('Error processing log line:', error);
        }
    }
}

new StatusMonitorProcess(); 