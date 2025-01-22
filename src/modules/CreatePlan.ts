import { Agent } from '../core/Agent';
import { ModuleInfo } from '../core/Memory';
import { sendToModel } from '../utils/SendToModel';
import { extractJsonFromResponse } from '../utils/Misc';

export interface PlanStep {
    description: string;
    action: {
        moduleName: string;
        methodName: string;
        parameters: Array<string | number | boolean | null | undefined | object>;
        stepNumber?: number;
    }
}

export interface Plan {
    goal: string;
    steps: PlanStep[];
}

export class CreatePlan {
    private agent: Agent;

    constructor(agent: Agent) {
        this.agent = agent;
    }

    public async createPlan(instructions: string, modules: ModuleInfo[]): Promise<Plan> {
        const prompt = `As an AI agent with the following capabilities:

${capabilitiesDescription(modules)}

I need to create a plan to handle these instructions:
"${instructions}"

Create a plan that uses existing modules. You can reference results from previous steps using $stepX where X is the step number.

For example:
{
    "goal": "Add two numbers and show the result",
    "steps": [
        {
            "description": "Calculate 2 + 2",
            "action": {
                "moduleName": "Calculator",
                "methodName": "add",
                "parameters": [2, 2],
                "stepNumber": 1
            }
        },
        {
            "description": "Show the calculation result",
            "action": {
                "moduleName": "ResponseHandler",
                "methodName": "displayResult",
                "parameters": ["$step1", "The sum is"],
                "stepNumber": 2
            }
        }
    ]
}`;

        const response = await sendToModel(prompt);
        try {
            const jsonStr = extractJsonFromResponse(response);
            const plan = JSON.parse(jsonStr);
            return plan;
        } catch (error) {
            throw new Error('Failed to create execution plan');
        }
    }
}

// Helper function to generate a description of the capabilities
const capabilitiesDescription = (modules: ModuleInfo[]): string => {
    if (modules.length === 0) {
        return "I currently have no additional capabilities installed.";
    }

    return `${modules.map(md => `
- ${md.name}: ${md.purpose}
Methods: ${md.methods.map(method => `\n${method.name} - ${method.description}. Example usage: ${method.example}\n`).join(', ')}`).join('\n')}`;
}

export const moduleInfo = {
    name: 'CreatePlan',
    purpose: 'Create a plan to handle new instructions such as new input from the user or from an expert',
    methods: [
        {
            name: 'createPlan',
            description: 'Create a plan to handle instructions',
            parameters: [
                { name: 'instructions', type: 'string', description: 'The instructions to handle along with all the context. Form a good prompt that will help the LLM understand what is being asked, including a return format. Any previous step\'s result can be added as a parameter in this form: $stepX where X is the step number. For example a short prompt would be: "The user wants to know the weather in Tokyo, we asked them for a date and they said: $step1".' },
                { name: 'modules', type: 'object', description: 'All the potential modules (tools) you have access to' }
            ],
            returnType: 'Plan',
            returnDescription: 'The plan to handle the instructions',
            example: 'CreatePlan.createPlan("Add two numbers and show the result", [Calculator, ResponseHandler]) // returns a plan'
        }
    ]
};