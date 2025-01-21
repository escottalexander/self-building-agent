import dotenv from 'dotenv';
dotenv.config();

export const config = {
    AGENT_API: process.env.AGENT_API || "http://192.168.1.195:11434/api/chat",
    MODEL: process.env.MODEL || "dolphin3",
    OPENAI_API: process.env.OPENAI_API || "https://api.openai.com/v1/chat/completions",
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
}; 