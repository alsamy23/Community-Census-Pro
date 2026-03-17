import { GoogleGenAI, Type } from "@google/genai";
import { Stats } from "../types.ts";

export async function getCommunityInsights(stats: Stats) {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI insights will not be generated.");
      return "Unable to generate insights: API key missing.";
    }
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following community census data and provide 3 key insights or recommendations for community development:
      Total Population: ${stats.totalPopulation}
      Village Distribution: ${JSON.stringify(stats.villageCounts)}
      Gender Distribution: ${JSON.stringify(stats.genderStats)}
      Age Distribution: ${JSON.stringify(stats.ageStats)}`,
      config: {
        systemInstruction: "You are a community development expert. Provide concise, actionable insights based on census data.",
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insight Error:", error);
    return "Unable to generate insights at this time.";
  }
}
