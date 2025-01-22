# Self Building Agent

*This is not really an "Agent" in its current state but with time and effort it may get there*

High level idea: What if you could tell an agent to accomplish some large task and it would build out the tools necessary to accomplish that and then execute the plan step-by-step? That is what this project wants to be.

Once running you can tell the agent what you want it to do and it will create an execution plan using it's pre-loaded modules (think of these like tools). It will then attempt to fulfill the plan.

## Features

- 🤖 Modular AI Agent architecture
- 📝 Dynamic instruction processing and plan creation
- 🧩 Extensible module system
- 📊 Real-time task monitoring and logging
- 💾 File management system
- 🧠 Memory management (Haha not yet really. Cursor likes to get ahead of itself. RIght now Memory.ts just loads and saves the module info)

## Getting Started

### Prerequisites

- Node.js (v20 or higher)
- npm

You also need to add your preferred model and api key to the .env file. You can also run this with ollama pretty easily.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-agent-framework
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Build the project:
```bash
npm run build
```

### Running the Agent

Start the agent:
```bash
npm run start
```

The agent will prompt you for instructions. Type your instructions and press Enter. The agent will:
1. Create a plan based on your instructions
2. Execute each step of the plan using appropriate modules
3. Display progress and results in real-time

To exit the agent, type 'exit' at the instruction prompt.

### Running the Monitor

Start the monitoring interface:
```bash
npm run monitor
```

The monitor provides a real-time view of:
- Agent status
- Task execution
- Plan creation and progress
- Module execution
- System logs

## Project Structure
```
src/
├── core/
│ ├── Agent.ts # Main agent implementation
│ ├── CLI.ts # Command-line interface
│ ├── FileManager.ts # File operations handler
│ ├── Memory.ts # Memory management
│ └── TaskManager.ts # Task scheduling and tracking
├── modules/
│ ├── Calculator.ts # Basic calculations
│ ├── CreateModule.ts # Module creation
│ ├── CreatePlan.ts # Plan generation
│ └── ResponseHandler.ts # Response processing
└── utils/
└── Logger.ts # Logging utility
```

## Extending the Framework

### Creating New Modules

1. Create a new module file in `src/modules/`:
```typescript
export class Calculator {
    // The constructor must accept the agent as its only parameter. This will allow you to access agent state from your module
    constructor(private agent: Agent) {}

    async add(param1: number, param2: number): Promise<number> {
    // Implementation
    }
}

// You must also export a `moduleInfo` object so that the module can be imported automatically
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
```

2. The agent will automatically discover and use the new module when creating plans

You can also just ask the agent to create a module that performs your desired action(s) and it has an included module (CreateModule) that will help it accomplish that task.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.