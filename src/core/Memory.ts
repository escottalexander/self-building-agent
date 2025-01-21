import * as fs from 'fs';
import * as path from 'path';

export interface MethodInfo {
    name: string;
    description: string;
    parameters: {
        name: string;
        type: string;
        description: string;
    }[];
    returnType: string;
    returnDescription: string;
    example: string;
}

export interface ModuleInfo {
    name: string;
    path: string;
    createdAt: Date;
    purpose: string;
    methods: MethodInfo[];
}

export class Memory {
    private modulesDir: string;
    private data: Map<string, ModuleInfo>;

    constructor() {
        this.modulesDir = path.join(process.cwd(), 'src', 'modules');
        this.data = new Map();
    }

    private async loadModuleInfo(modulePath: string): Promise<ModuleInfo | null> {
        try {
            // Import the module
            const module = await import(modulePath);
            
            // Get static moduleInfo if it exists
            const moduleInfo = module.moduleInfo;
            if (!moduleInfo) {
                return null;
            }

            // Get the class methods programmatically
            const moduleClass = Object.values(module).find(
                (exp): exp is new () => any => 
                    typeof exp === 'function' && 
                    exp.prototype?.constructor?.name !== 'Object'
            );

            if (moduleClass) {
                const methods = Object.getOwnPropertyNames(moduleClass.prototype)
                    .filter(name => name !== 'constructor')
                    .map(name => {
                        const method = moduleClass.prototype[name];
                        return {
                            name,
                            description: moduleInfo.methods?.find((m: MethodInfo) => m.name === name)?.description || 'No description',
                            parameters: moduleInfo.methods?.find((m: MethodInfo) => m.name === name)?.parameters || [],
                            returnType: moduleInfo.methods?.find((m: MethodInfo) => m.name === name)?.returnType || 'unknown',
                            returnDescription: moduleInfo.methods?.find((m: MethodInfo) => m.name === name)?.returnDescription || '',
                            example: moduleInfo.methods?.find((m: MethodInfo) => m.name === name)?.example || ''
                        };
                    });

                return {
                    name: moduleInfo.name,
                    path: modulePath,
                    createdAt: new Date(),
                    purpose: moduleInfo.purpose,
                    methods
                };
            }
        } catch (error) {
            console.error(`Error loading module info from ${modulePath}:`, error);
        }
        return null;
    }

    async initialize(): Promise<void> {
        // Create modules directory if it doesn't exist
        if (!fs.existsSync(this.modulesDir)) {
            fs.mkdirSync(this.modulesDir, { recursive: true });
        }

        // Read all .ts files from modules directory
        const files = fs.readdirSync(this.modulesDir)
            .filter(file => file.endsWith('.ts'));

        // Store module info for each file
        for (const file of files) {
            const modulePath = path.join(this.modulesDir, file);
            const moduleInfo = await this.loadModuleInfo(modulePath);
            
            if (moduleInfo) {
                this.storeModule(moduleInfo);
            }
        }
    }

    storeModule(moduleInfo: ModuleInfo): void {
        this.data.set(`module:${moduleInfo.name}`, moduleInfo);
    }

    getModule(moduleName: string): ModuleInfo | null {
        return this.data.get(`module:${moduleName}`) || null;
    }

    getAllModules(): ModuleInfo[] {
        return Array.from(this.data.values());
    }

    get moduleDirectory(): string {
        return this.modulesDir;
    }
} 