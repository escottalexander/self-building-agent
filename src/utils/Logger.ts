import debug from 'debug';
import fs from 'fs';

// Enable all debug namespaces for our agent
debug.enable('agent*');

// Create namespace loggers
const logAgent = debug('agent');
const logPrompt = debug('prompt');
const logTask = debug('agent:task');
const logModule = debug('agent:module');
const logPlan = debug('agent:plan');
const logStatus = debug('agent:status');

// Enable file logging
const LOG_FILE = 'agent.log';

export class Logger {

    // Custom log function that writes to both file and console
    static writeLog(namespace: string, message: string): void {
        const timestamp = new Date().toISOString();
        const logMessage = `[${timestamp}] [${namespace}] ${message}\n`;
        
        // Write to file
        fs.appendFileSync(LOG_FILE, logMessage);
        
        // Also write to console via debug
        // debug(namespace)(message);
    }

    static agent = {
        status: (message?: string) => Logger.writeLog('agent:status', message || ''),
        info: (message: string) => Logger.writeLog('agent', message),
        error: (message: string) => Logger.writeLog('agent', message),
    };

    static prompt = {
        info: (msg: string) => Logger.writeLog('prompt', `📝 ${msg}`),
        error: (msg: string) => Logger.writeLog('prompt', `📝❌ ${msg}`),
        warn: (msg: string) => Logger.writeLog('prompt', `📝⚠️ ${msg}`),
    };

    static task = {
        created: (id: string, description: string) => 
            Logger.writeLog('task', `Created: ${id} - ${description}`),
        started: (id: string) => 
            Logger.writeLog('task', `Started: ${id}`),
        progress: (id: string, progress: number) => 
            Logger.writeLog('task', `Progress: ${id} - ${progress}%`),
        completed: (id: string) => 
            Logger.writeLog('task', `Completed: ${id}`),
        failed: (id: string, error: string) => 
            Logger.writeLog('task', `Failed: ${id} - ${error}`),
    };

    static module = {
        loaded: (name: string) => Logger.writeLog('module', `📦 Module loaded: ${name}`),
        executed: (name: string, method: string, result: any) => 
            Logger.writeLog('module', `🔄 ${name}.${method}() => ${JSON.stringify(result)}`),
        error: (name: string, error: string) => Logger.writeLog('module', `❌ Module error [${name}]: ${error}`),
    };

    static plan = {
        created: (goal: string) => Logger.writeLog('plan', `🎯 Plan created: ${goal}`),
        step: (num: number, desc: string) => Logger.writeLog('plan', `📝 Step ${num}: ${desc}`),
        completed: () => Logger.writeLog('plan', '✅ Plan completed'),
        failed: (error: string) => Logger.writeLog('plan', `❌ Plan failed: ${error}`),
    };

    static status = {
        update: (status: any) => Logger.writeLog('status', `📊 Status: ${JSON.stringify(status)}`),
    };

    static clearLogs: () => void = () => {
        fs.writeFileSync(LOG_FILE, '');
    };
} 