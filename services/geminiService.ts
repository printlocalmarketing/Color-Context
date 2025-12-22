import { AnalysisResponse, AppMode } from "../types";

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Your task is to analyze food in photos for visual signs that people typically use to judge status.

  STRICT FOCUS RULES:
  1. ONLY identify signals on the food item itself (e.g., the meat, the fruit, the eggs).
  2. COMPLETELY IGNORE packaging, labels, background, or supermarket lighting.
  3. DO NOT give direct safety commands like "Stop" or "Don't eat this". Instead, explain what "most people look for" to determine status.

  MODE: ${mode === 'shopping' ? 'SHOPPING INSIGHT' : 'COOKING INSIGHT'}

  SPECIFIC LOGIC FOR EGGS (HIGHEST PRIORITY):
  - UNUSUAL PINK TINT: If an egg white shows any noticeable pink, reddish, or unusual tints (spoilage sign), assign riskLevel "critical" and use this exact interpretation: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
  - COOKING STATUS: If any part of the egg white shows a glossy reflection, is clear, or is translucent (see-through), do NOT label it as cooked. Use riskLevel "alert" and this exact interpretation: "STILL SETTING: This section is starting to turn white at the edges, but the glossy surface means the proteins haven't fully set in the center. Most people wait for a completely matte, opaque white look."

  Return ONLY JSON in this format:
  {
    "signals": [
      {
        "id": "1",
        "x": number (0-100),
        "y": number (0-100),
        "observation": "Physical description",
        "interpretation": "Savvy explanation",
        "riskLevel": "none" | "alert" | "critical"
      }
    ]
  }`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
        ]
      }]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
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
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      signals: (parsed.signals || []).map((s: any, index: number) => ({
        id: s.id || String(index),
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        type: s.riskLevel === 'none' ? 'info' : s.riskLevel,
        label: String(s.observation).toUpperCase(),
        description: String(s.interpretation)
      }))
    };
  } catch (e) {
    throw new Error("Analysis failed. Please try a clearer photo.");
    const result = await model.generateContent([prompt, imagePart]);
    const response = await result.response;
    const text = response.text().replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    throw new Error("Failed to translate the scene.");
}
}
};
