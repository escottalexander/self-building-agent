import { Agent } from './core/Agent';
import { config } from './config';

async function main() {
    const agent = new Agent('ModularAI');
    await agent.initialize();
    await agent.start();
}

main().catch(console.error); 