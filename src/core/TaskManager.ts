import EventEmitter from 'events';

export interface Task {
    id: string;
    type: 'module_creation' | 'module_execution' | 'system_task';
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    description: string;
    startTime: Date;
    endTime?: Date;
    progress?: number;
    error?: string;
    result?: any;
}

export class TaskManager extends EventEmitter {
    private tasks: Map<string, Task> = new Map();
    private activeTaskId: string | null = null;

    constructor() {
        super();
    }

    createTask(type: Task['type'], description: string): Task {
        const task: Task = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type,
            status: 'pending',
            description,
            startTime: new Date(),
        };
        this.tasks.set(task.id, task);
        this.emit('taskCreated', task);
        return task;
    }

    startTask(taskId: string): void {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'running';
            this.activeTaskId = taskId;
            this.emit('taskStarted', task);
        }
    }

    updateTaskProgress(taskId: string, progress: number): void {
        const task = this.tasks.get(taskId);
        if (task) {
            task.progress = progress;
            this.emit('taskProgress', task);
        }
    }

    completeTask(taskId: string, result?: any): void {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'completed';
            task.endTime = new Date();
            task.result = result;
            if (this.activeTaskId === taskId) {
                this.activeTaskId = null;
            }
            this.emit('taskCompleted', task);
        }
    }

    failTask(taskId: string, error: string): void {
        const task = this.tasks.get(taskId);
        if (task) {
            task.status = 'failed';
            task.endTime = new Date();
            task.error = error;
            if (this.activeTaskId === taskId) {
                this.activeTaskId = null;
            }
            this.emit('taskFailed', task);
        }
    }

    cancelTask(taskId: string): void {
        const task = this.tasks.get(taskId);
        if (task && task.status === 'running') {
            task.status = 'cancelled';
            task.endTime = new Date();
            if (this.activeTaskId === taskId) {
                this.activeTaskId = null;
            }
            this.emit('taskCancelled', task);
        }
    }

    getActiveTask(): Task | null {
        return this.activeTaskId ? this.tasks.get(this.activeTaskId) || null : null;
    }

    getAllTasks(): Task[] {
        return Array.from(this.tasks.values());
    }

    getTask(taskId: string): Task | null {
        return this.tasks.get(taskId) || null;
    }
} 