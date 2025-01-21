export interface Message {
    type: 'log' | 'status';
    payload: LogPayload | StatusPayload;
}

export interface LogPayload {
    message: string;
    namespace: string;
    timestamp?: string;
}

export interface StatusPayload {
    task: {
        id: string;
        type: 'module_creation' | 'module_execution' | 'system_task';
        description: string;
        status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
        progress?: number;
        startTime: Date;
    } | null;
} 