import axios from "axios";
import { config } from "../config";
import { Logger } from "./Logger";

export const sendToModel = async (prompt: string): Promise<string> => {
    try {
        Logger.prompt.info(prompt);
        const request = {
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            temperature: 0,
        };

        const response = await axios.post(config.OPENAI_API, request, {
            headers: {
                'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const responseContent = response.data.choices[0].message.content;
        Logger.prompt.info(responseContent);
        
        return responseContent;
    } catch (error: any) {
        Logger.prompt.error(`Error: ${error.message}`);
        throw new Error(`AI model interaction failed: ${error.message}`);
    }
}
