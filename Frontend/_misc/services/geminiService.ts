
import { GoogleGenAI, Type } from "@google/genai";
import { Task } from "../types";

// Always use the recommended initialization with named parameter
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateTasksWithAI = async (topic: string): Promise<Partial<Task>[]> => {
  // Using gemini-3-pro-preview for complex text generation tasks and consistency with the admin UI
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Generate 5 high-paying reward app task offers about ${topic}. Return as JSON array. Include title, points (100-5000), percentage (70-90), and a matching emoji icon.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            reward_points: { type: Type.NUMBER },
            reward_percentage: { type: Type.NUMBER },
            icon: { type: Type.STRING },
            type: { type: Type.STRING, description: "Must be one of VIDEO_AD, GAME_INSTALL, OFFERWALL" }
          },
          required: ["title", "reward_points", "reward_percentage", "icon", "type"]
        }
      }
    }
  });

  try {
    // Accessing text output property directly from GenerateContentResponse
    const text = response.text?.trim() || "[]";
    return JSON.parse(text);
  } catch (e) {
    console.error("AI Generation failed", e);
    return [];
  }
};
