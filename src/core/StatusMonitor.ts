import { Task } from './TaskManager';
import blessed from 'blessed';
import * as fs from 'fs';

export class StatusMonitor {
    private screen!: blessed.Widgets.Screen;
    private statusBox!: blessed.Widgets.BoxElement;
    private logBox!: blessed.Widgets.BoxElement;
    private maxLogLines: number = 1000; // Adjust based on typical screen size
    private logs: string[] = [];

    constructor() {
        this.initializeUI();
    }

    private initializeUI(): void {
        this.screen = blessed.screen({
            smartCSR: true,
            title: 'AI Agent Status Monitor'
        });

        // Status box at top
        this.statusBox = blessed.box({
            top: 0,
            left: 0,
            width: '100%',
            height: '10%',
            content: 'Idle',
            border: { type: 'line' },
            style: { border: { fg: 'blue' } },
            label: ' Status '
        });

        // Log box below status
        this.logBox = blessed.box({
            top: '10%',
            left: 0,
            width: '100%',
            height: '90%',
            scrollable: true,
            alwaysScroll: true,
            content: '',
            border: { type: 'line' },
            style: { border: { fg: 'blue' } },
            label: ' Logs '
        });

        this.screen.append(this.statusBox);
        this.screen.append(this.logBox);

        // Quit on Ctrl-C
        this.screen.key(['C-c'], () => {
            process.exit(0);
        });

        this.screen.render();
    }

    updateStatus(status: string): void {
        this.statusBox.setContent(status);
        if (status === 'Initializing...') {
            // reset any existing logs
            this.logs = [];
        }
        this.screen.render();
    }

    addLog(message: string): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${message}`;
        
        // Add to memory buffer
        this.logs.push(logEntry);
        if (this.logs.length > this.maxLogLines) {
            this.logs = this.logs.slice(-this.maxLogLines);
        }

        // Update display
        const visibleLines = Math.floor((this.logBox.height as number) * 0.9);
        const startIndex = Math.max(0, this.logs.length - visibleLines);
        
        this.logBox.setContent(this.logs.slice(startIndex).join('\n'));
        this.logBox.scrollTo(this.logs.length);
        this.screen.render();
    }
}