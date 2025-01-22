import * as fs from 'fs/promises';
import * as path from 'path';
import { Agent } from '../core/Agent';

export class FileManager {
    constructor(private agent: Agent) {}

    async initialize(): Promise<void> {
        // Implementation remains the same as before
    }

    async readFile(filePath: string): Promise<string> {
        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (error: any) {
            throw new Error(`Failed to read file ${filePath}: ${error.message}`);
        }
    }

    async writeFile(filePath: string, content: string): Promise<void> {
        try {
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });
            await fs.writeFile(filePath, content, 'utf-8');
        } catch (error: any) {
            throw new Error(`Failed to write file ${filePath}: ${error.message}`);
        }
    }
}

export const moduleInfo = {
    name: 'FileManager',
    purpose: 'Handles file system operations like reading and writing files',
    methods: [
        {
            name: 'readFile',
            description: 'Reads the contents of a file',
            parameters: [
                { name: 'filePath', type: 'string', description: 'Path to the file to read' }
            ],
            returnType: 'Promise<string>',
            returnDescription: 'The contents of the file',
            example: 'FileManager.readFile("path/to/file.txt")'
        },
        {
            name: 'writeFile',
            description: 'Writes content to a file',
            parameters: [
                { name: 'filePath', type: 'string', description: 'Path to the file to write' },
                { name: 'content', type: 'string', description: 'Content to write to the file' }
            ],
            returnType: 'Promise<void>',
            returnDescription: 'Nothing',
            example: 'FileManager.writeFile("path/to/file.txt", "Hello World!")'
        }
    ]
}; 