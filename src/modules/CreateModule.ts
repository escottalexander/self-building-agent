import * as fs from 'fs';
import { MethodInfo } from '../core/Memory';
import path from 'path';
import { Agent } from '../core/Agent';
import { parseCodeResponse } from '../utils/Misc';
import { sendToModel } from '../utils/SendToModel';

export const moduleInfo = {
    name: 'CreateModule',
    purpose: 'Create a new module that you can use in a later step',
    methods: [
      {
        name: 'create',
        description: 'Create a new module with the desired name, purpose, and methods',
        parameters: [{ name: 'name', type: 'string', description: 'The name of the module' }, { name: 'purpose', type: 'string', description: 'The purpose of the module' }, { name: 'methods', type: 'MethodInfo[]', description: 'The methods of the module' }],
        returnType: 'void',
        returnDescription: 'No return value',
        example: 'createModule("MyModule", "This is a module that does something", [method1, method2])'
      }
    ]
};

export class CreateModule {
    private modulesDir: string;
    private agent: Agent;
    
    constructor(agent: Agent) {
        this.agent = agent;
        this.modulesDir = agent.memory.moduleDirectory;
    }

    async create(name: string, purpose: string, methods: MethodInfo[]): Promise<void> {
        const modulePath = path.join(this.modulesDir, `${name}.ts`);
        // Define a template to be sent to the ai
        const template = `
        Create a new module with the following name, purpose, and methods:
        Name: ${name}
        Purpose: ${purpose}
        Methods: ${methods.length > 0 ? `${methods.map(method => `${method.name}: ${method.description}`).join(', ')}` : 'You can create whatever methods you think are necessary to accomplich the purpose of the module.'}
        
        Return the code for the module, do not include any other text or comments. You should fill out each method with complete code.
        It should be a valid typescript file with this format:
        \`\`\`typescript
        import { Agent } from '../core/Agent';

        export class ${name} {
            private agent: Agent;
            constructor(agent: Agent) {
                this.agent = agent;
            }
            // ADD METHODS TO ACCOMPLISH PURPOSE
        }
        
        export const moduleInfo = {
            name: '${name}',
            purpose: '${purpose}',
            methods: // ADD METHODS HERE IN THIS FORMAT: [{name: string, description: string, parameters: [{name: string, type: string, description: string}], returnType: string, returnDescription: string, example: string}]
        };
        \`\`\`
        `;

        const response = await sendToModel(template);

        const moduleContent = parseCodeResponse(response);

        if (!moduleContent) {
            throw new Error('Failed to parse module content from response');
        }

        fs.writeFileSync(modulePath, moduleContent);
        console.log(`Module ${name} created successfully at ${modulePath}`);
    }
}
