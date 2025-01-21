export const parseCodeResponse = (response: string) => {
    const codeBlockRegex = /```typescript\s*([\s\S]*?)\s*```/;
    const match = response.match(codeBlockRegex);
    return match ? match[1] : null;
};

export const extractJsonFromResponse = (response: string) => {
    // If response contains code blocks with JSON
    if (response.includes('```')) {
        const matches = response.match(/```(?:json)?\n([\s\S]*?)\n```/);
        if (matches && matches[1]) {
            return matches[1].trim();
        }
    } else if (response.includes('{')) {
        // Regex won't work here, so use code to parse
        const firstBraceIndex = response.indexOf('{');
        const lastBraceIndex = response.lastIndexOf('}');
        return response.slice(firstBraceIndex, lastBraceIndex + 1).trim();
    }
    return response.trim();
};