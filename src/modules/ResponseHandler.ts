import { Agent } from "../core/Agent";
import { sendToModel } from "../utils/SendToModel";

export const moduleInfo = {
    name: 'ResponseHandler',
    purpose: 'Handle user interaction and display formatted responses',
    methods: [
        {
            name: 'displayResult',
            description: 'Displays a result to the user',
            parameters: [
                { name: 'result', type: 'any', description: 'The result to display' },
                { name: 'context', type: 'string', description: 'Optional context for the result' }
            ],
            returnType: 'void',
            returnDescription: 'No return value',
            example: 'responseHandler.displayResult(42, "The answer is")'
        },
        {
            name: 'askUser',
            description: 'Asks the user a question and returns their response. You should ALWAYS use the CreatePlan module following your use of this method so that you can adjust your plan as needed after getting more input.',
            parameters: [{ name: 'question', type: 'string', description: 'The question to ask' }],
            returnType: 'string',
            returnDescription: 'The user\'s response',
            example: 'responseHandler.askUser("What is your name?")'
        },
        {
            name: 'askExpertOpinion',
            description: 'Asks an LLM for an opinion. May help you to further examine your plan. You should ALWAYS use the CreatePlan module following your use of this method so that you can adjust your plan as needed after getting more input.',
            parameters: [{ name: 'prompt', type: 'string', description: 'The prompt to ask' }],
            returnType: 'string',
            returnDescription: 'The expert\'s opinion',
            example: 'responseHandler.askExpertOpinion("What is the best way to accomplish this task?")'
        },
        {
            name: 'displayError',
            description: 'Displays an error message to the user',
            parameters: [{ name: 'error', type: 'string', description: 'The error message to display' }],
            returnType: 'void',
            returnDescription: 'No return value',
            example: 'responseHandler.displayError("Something went wrong")'
        }
    ]
};

export class ResponseHandler {
    private agent: Agent;

    constructor(agent: Agent) {
        this.agent = agent;
    }

    /**
     * Displays a result to the user
     */
    public displayResult(result: any, context?: string): void {
        if (context) {
            console.log(`\n🤖 ${context} ${result}`);
        } else {
            console.log(`\n🤖 Result ${result}`);
        }
    }

    /**
     * Formats and displays an error message
     */
    public displayError(error: string): void {
        console.error(`\n❌ Error: ${error}`);
    }

    /**
     * Asks the user a question and returns their response
     */
    public async askUser(question: string): Promise<string> {
        return await this.agent.cli.askQuestion(question);
    }

    /**
     * Asks an LLM for an opinion, Helps the LLM to ruminate on the plan and provide an "expert" opinion
     */
    public async askExpertOpinion(prompt: string): Promise<string> {
        const adaptedPrompt = `You are an expert in this matter. Here is the subject matter: \`\`\`${prompt}\`\`\` \n\n Provide an expert opinion on the subject matter in a concise manner.`;
        const response = await sendToModel(adaptedPrompt);
        return response;
    }
} 