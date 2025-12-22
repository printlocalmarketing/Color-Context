import { GoogleGenerativeAI } from "@google/generative-ai";
import { Signal, AppMode } from "../types";

const genAI = new GoogleGenerativeAI("YOUR_API_KEY_HERE");

export const analyzeImage = async (image: string, mode: AppMode): Promise<{ signals: Signal[] }> => {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const imageData = image.split(',')[1];
  const imagePart = {
    inlineData: {
      data: imageData,
      mimeType: "image/jpeg"
    }
  };

  const prompt = `
    You are a professional food scientist. Analyze this photo for color context in "${mode}" mode.
    
    STEP 1: Identify the protein (Beef, Fish, Poultry, or Pork).
    
    STEP 2: Detect visual signals:
    - BEEF: Look for 'Cherry Red' (fresh), 'Deep Purple' (vacuum), or 'Brown/Gray' (oxidizing).
    - FISH: Look for 'Glassy/Translucent' vs 'Milky/Opaque'. Check for 'Gaping' (flesh separating).
    - POULTRY: Look for 'Glossy Pink/White' (raw) vs 'Opaque White' (cooked). Identify any 'Pink Juices'.
    - PORK: Look for 'Pinkish-Red' (fresh) vs 'Pale/Grey' (old). Check for white/tan color when cooked.

    STEP 3: Return a JSON object ONLY. Do not add any extra text or commentary.
    {
      "signals": [
        {
          "id": "unique-id",
          "label": "Short label (e.g. 'Poultry: Pink Center')",
          "description": "Explanation of what this specific color signal indicates.",
          "riskLevel": "normal" | "critical",
          "x": 0-100,
          "y": 0-100
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text();
    
    // Robust JSON parsing to prevent app crashes
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Invalid Response Format");
    
    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to translate the scene. Please ensure the food is clearly visible.");
  }
};
