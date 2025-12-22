import { GoogleGenerativeAI } from "@google/generative-ai";
import { Signal, AppMode } from "../types";

// Replace with your actual API Key
const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");

export const analyzeImage = async (image: string, mode: AppMode): Promise<{ signals: Signal[] }> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Convert base64 to parts
  const imageData = image.split(',')[1];
  const imagePart = {
    inlineData: {
      data: imageData,
      mimeType: "image/jpeg"
    }
  };

  const prompt = `
    You are a professional food scientist. Analyze this photo in "${mode}" mode.
    
    STEP 1: Identify the protein (Beef, Fish, Poultry, or Pork).
    
    STEP 2: Detect visual signals based on the type:
    - BEEF (Shopping): Look for 'Cherry Red' (fresh) vs 'Deep Purple' (vacuum-fresh) vs 'Brown/Gray' (oxidizing).
    - BEEF (Cooking): Look for pink/red center (rare) vs gray/brown (well-done).
    - FISH (Shopping): Look for 'Glassy/Translucent' vs 'Milky/Opaque'. Check for 'Gaping' (flesh separating).
    - FISH (Cooking): Look for 'Opaque/Flaky' (done) vs 'Translucent/Raw' (undercooked).
    - POULTRY: Look for 'Glossy White' vs 'Dull Gray'. Identify 'Pink juices' or 'Pink flesh' in cooking.

    STEP 3: Return a JSON object ONLY:
    {
      "signals": [
        {
          "id": "unique-id",
          "label": "Short label (e.g. 'Beef: Graying Edge')",
          "description": "Clear explanation of why this matters for safety or quality.",
          "riskLevel": "normal" | "critical",
          "x": 0-100,
          "y": 0-100
        }
      ]
    }

    Note: Place markers (x,y) exactly on the visual evidence.
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to translate the scene.");
  }
};
