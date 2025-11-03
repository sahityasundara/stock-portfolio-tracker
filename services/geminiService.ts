import { GoogleGenAI } from '@google/genai';

export const getStockAnalysis = async (symbol: string, name: string): Promise<string> => {
    const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    
    if (!geminiApiKey) {
        throw new Error('VITE_GEMINI_API_KEY is not set. Please set it in your .env file.');
    }

    try {
        const ai = new GoogleGenAI({ apiKey: geminiApiKey });
        
        const prompt = `
            Provide a concise investment analysis for the stock with symbol ${symbol} (${name}). 
            The analysis should be easy for an intermediate investor to understand.
            Format the response in Markdown.

            Include the following sections:
            - **Company Overview**: Briefly describe what the company does.
            - **Key Strengths**: 2-3 bullet points on the company's main advantages (e.g., market position, technology, brand).
            - **Potential Risks**: 2-3 bullet points on potential challenges or risks (e.g., competition, market trends, regulatory issues).
            - **Outlook**: A brief, balanced summary of the potential future performance.

            Do not include any financial advice or price targets.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
        });
        
        return response.text;
    } catch (error) {
        console.error("Error fetching Gemini analysis:", error);
        if (error instanceof Error) {
            return Promise.reject(new Error(`Failed to generate AI analysis: ${error.message}`));
        }
        return Promise.reject(new Error('An unknown error occurred while fetching AI analysis.'));
    }
};