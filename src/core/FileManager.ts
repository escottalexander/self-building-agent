import * as fs from 'fs/promises';
import * as path from 'path';

export class FileManager {
    constructor() {}

    async initialize(): Promise<void> {
        // Create necessary directories if they don't exist
        await this.ensureDirectory('src/modules');
    }

    async createFile(filePath: string, content: string): Promise<void> {
        await this.ensureDirectory(path.dirname(filePath));
        await fs.writeFile(filePath, content, 'utf-8');
    }

    async readFile(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    async editFile(filePath: string, content: string): Promise<void> {
        await fs.writeFile(filePath, content, 'utf-8');
    }

    private async ensureDirectory(dirPath: string): Promise<void> {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
                throw error;
            }
        }
    }
} 