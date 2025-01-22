import { Memory } from './Memory';
import { FileManager } from '../modules/FileManager';
import { CLI } from './CLI';
import { TaskManager, Task } from './TaskManager';
import * as path from 'path';
import { Logger } from '../utils/Logger';
import { CreatePlan, PlanStep } from '../modules/CreatePlan';

export class Agent {
    private name: string;
    private stepResults: Map<string, any> = new Map();
    public memory: Memory;
    public cli: CLI;
    public taskManager: TaskManager;
    public createPlanModule: CreatePlan;

    constructor(name: string) {
        Logger.clearLogs();
        Logger.agent.status('Initializing...');
        this.name = name;
        this.memory = new Memory();
        this.cli = new CLI();
        this.taskManager = new TaskManager();
        this.createPlanModule = new CreatePlan(this);
        
        this.setupEventListeners();
        Logger.agent.info(`Agent ${name} initialized`);
        Logger.agent.status('Waiting for instructions...');
        this.cli.on('close', () => {
            this.cleanup();
        });
    }

    private setupEventListeners(): void {
        this.taskManager.on('taskCreated', (task: Task) => {
            Logger.task.created(task.id, task.description);
        });

        this.taskManager.on('taskStarted', (task: Task) => {
            Logger.task.started(task.id);
        });

        this.taskManager.on('taskProgress', (task: Task) => {
            Logger.task.progress(task.id, task.progress || 0);
        });

        this.taskManager.on('taskCompleted', (task: Task) => {
            Logger.task.completed(task.id);
        });

        this.taskManager.on('taskFailed', (task: Task) => {
            Logger.task.failed(task.id, task.error || 'Unknown error');
        });

        this.taskManager.on('taskCancelled', (task: Task) => {
            Logger.task.failed(task.id, `Task cancelled: ${task.description}`);
        });
    }

    async initialize(): Promise<void> {
        await this.memory.initialize();
        Logger.agent.info('Agent initialized');
    }

    async processInstructions(instructions: string): Promise<void> {
        Logger.agent.status('Processing instructions...');
        const task = this.taskManager.createTask(
            'system_task',
            `Processing instructions: ${instructions}`
        );

        try {
            this.taskManager.startTask(task.id);
            
            // First, create a plan using the CreatePlan module
            const plan = await this.createPlanModule.createPlan(instructions, this.memory.getAllModules());
            Logger.plan.created(plan.goal);
            plan.steps.forEach((step, index) => {
                Logger.plan.step(index + 1, step.description);
                if (step.action) {
                    Logger.plan.step(index + 1, `  Action: ${step.action.moduleName}.${step.action.methodName}(${step.action.parameters.join(', ')})`);
                }
            });
            Logger.plan.completed();

            // Execute each step
            for (let i = 0; i < plan.steps.length; i++) {
                const step = plan.steps[i];
                Logger.plan.step(i + 1, `Executing step ${i + 1}: ${step.description}`);
                this.taskManager.updateTaskProgress(task.id, (i / plan.steps.length) * 100);
                
                try {
                    if (step.action) {
                        Logger.plan.step(i + 1, `Attempting to use modules: ${step.action.moduleName}.${step.action.methodName}(${step.action.parameters.join(', ')})`);
                        await this.executeWithModules(step);
                    }  
                    Logger.plan.step(i + 1, `Completed step ${i + 1}`);
                } catch (error: any) {
                    Logger.plan.step(i + 1, `Error in step ${i + 1}: ${error.message}`);
                    throw error;
                }
            }

            this.taskManager.completeTask(task.id);
            Logger.agent.status('Waiting for instructions...');
            this.cli.displaySuccess("Task completed successfully!");
        } catch (error: any) {
            Logger.agent.status('ERROR');
            this.taskManager.failTask(task.id, error.message);
            this.cli.displayError(`Failed to process instructions: ${error.message}`);
        }
    }

    private async executeWithModules(step: PlanStep): Promise<any> {
        try {
            const moduleName = step.action.moduleName;
            const importedFile = await import(path.join(this.memory.moduleDirectory, `${moduleName}.ts`));
            const module = new importedFile[moduleName](this);
            const methodName = step.action.methodName;
            
            // Replace any $stepX parameters with actual results
            const parameters = step.action.parameters.map(param => {
                if (typeof param === 'string' && param.startsWith('$step')) {
                    const stepNum = param.substring(5); // Remove '$step'
                    return this.stepResults.get(stepNum);
                }
                return param;
            });

            // Call the method with the parameters
            const result = await module[methodName](...parameters);
            Logger.module.executed(moduleName, methodName, result);
            
            // Store the result with the current step number
            const currentStep = step.action.stepNumber?.toString();
            if (currentStep) {
                this.stepResults.set(currentStep, result);
                Logger.plan.step(Number(currentStep), `Stored result of step ${currentStep}${result? `: ${result}`: '' }`);
            }

            Logger.module.executed(moduleName, methodName, result);
            return result;
        } catch (error: any) {
            Logger.module.error(step.action.moduleName, error.message);
            throw error;
        }
    }

    async start(): Promise<void> {
        try {
            while (true) {  // Continue running until explicitly stopped
                const instructions = await this.cli.askQuestion(
                    "\nWhat would you like me to do? (Type 'exit' to quit)"
                );
                
                if (instructions.toLowerCase() === 'exit') {
                    this.cleanup();
                    break;
                }
                
                await this.processInstructions(instructions);
            }
        } catch (error: any) {
            Logger.agent.error(`Error in main loop: ${error.message}`);
            this.cleanup();
        }
    }

    private cleanup(): void {
        Logger.agent.status('SHUT_DOWN');
        Logger.agent.info('Agent shutdown cleanup complete');
        process.exit(0);
    }
} 