
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import type { RelatedWord } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
  // Allow the app to load and show an error message in the UI instead of throwing here.
}

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const createPrompt = (targetWord: string): string => `
You are an advanced Word2Vec model simulator.
Your task is to take a target word and generate a list of 50 semantically related words.
You must also include the target word itself in the list.
For each word (the target word and the 50 related words), provide 2D coordinates (x, y).
The target word '${targetWord}' should ideally be positioned at or near the origin (0,0), for example, { "word": "${targetWord}", "x": 0, "y": 0 }.
Related words should be positioned such that their distance and direction from the target word (and from each other) reflect their semantic relationships, similar to how Word2Vec embeddings would project into 2D space.
The x and y coordinate values should range approximately from -50 to 50.

Output ONLY a valid JSON array of objects. Each object in the array must have the following three keys:
- "word": string (the word itself)
- "x": number (the x-coordinate)
- "y": number (the y-coordinate)

Do not include any explanatory text, greetings, or any other content outside of the JSON array.
The JSON array should contain exactly 51 items: the target word and 50 related words.

Example for target word 'technology' (this example shows fewer words for brevity, but you should generate 51):
[
  { "word": "technology", "x": 0, "y": 0 },
  { "word": "innovation", "x": 10, "y": 5 },
  { "word": "computer", "x": -8, "y": 12 },
  { "word": "software", "x": -15, "y": -3 },
  { "word": "science", "x": 20, "y": -8 }
]

Now, generate this for the target word: '${targetWord}'
`;

export const fetchRelatedWords = async (targetWord: string): Promise<RelatedWord[]> => {
  if (!ai) {
    throw new Error("Gemini API client is not initialized. API_KEY might be missing.");
  }
  
  const prompt = createPrompt(targetWord);

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-04-17",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.3, // Lower temperature for more predictable, less "creative" coordinates
      },
    });

    let jsonStr = response.text.trim();
    
    // Remove markdown fences if present
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }

    const parsedData = JSON.parse(jsonStr);

    if (!Array.isArray(parsedData) || !parsedData.every(item => 
        typeof item.word === 'string' && 
        typeof item.x === 'number' && 
        typeof item.y === 'number'
    )) {
      throw new Error('API 응답이 예상된 JSON 형식이 아닙니다. (Invalid JSON structure)');
    }
    
    // Validate if we got approximately the expected number of words.
    // The model might not always return the exact count, so a small tolerance might be needed if strictness causes issues.
    // For now, we'll trust the model's adherence to the prompt.
    if (parsedData.length < 40) { // Heuristic: if significantly less than 51, something might be wrong.
        console.warn(`Expected around 51 words, but received ${parsedData.length}. The model might not have fully adhered to the count request.`);
    }

    return parsedData as RelatedWord[];

  } catch (error) {
    console.error("Error fetching related words:", error);
    if (error instanceof Error) {
        // Check for common Gemini API error messages if possible, or re-throw generic
        if (error.message.includes('API key not valid')) {
             throw new Error('제공된 API 키가 유효하지 않습니다. 확인 후 다시 시도해주세요.');
        }
         throw new Error(`Gemini API 요청 중 오류 발생: ${error.message}`);
    }
    throw new Error('Gemini API 요청 중 알 수 없는 오류가 발생했습니다.');
  }
};
