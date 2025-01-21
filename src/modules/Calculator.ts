import { Agent } from "../core/Agent";

export const moduleInfo = {
    name: 'Calculator',
    purpose: 'Perform basic arithmetic operations',
    methods: [
        {
            name: 'add',
            description: 'Adds two numbers together',
            parameters: [
                { name: 'a', type: 'number', description: 'First number' },
                { name: 'b', type: 'number', description: 'Second number' }
            ],
            returnType: 'number',
            returnDescription: 'The sum of the two numbers',
            example: 'Calculator.add(4, 4) // returns 8'
        }
    ]
};

export class Calculator {
    private agent: Agent;

    constructor(agent: Agent) {
        this.agent = agent;
    }
    
    public add(a: number, b: number): number {
        return a + b;
    }
}
        