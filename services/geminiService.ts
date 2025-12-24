import { AnalysisResponse, AppMode } from "../types";

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Your task is to analyze food in photos for visual signs that people typically use to judge status.

  STRICT FOCUS RULES:
  1. ONLY identify signals on the food item itself (Beef, Fish, Poultry, Pork, Eggs, Produce, or Dairy).
  2. COMPLETELY IGNORE packaging, labels, background, or supermarket lighting.
  3. DO NOT give direct safety commands. Instead, explain what "most people look for" to determine status.

  MODE: ${mode === 'shopping' ? 'SHOPPING INSIGHT' : 'COOKING INSIGHT'}

  SPECIFIC LOGIC:
  - BEEF/PORK/POULTRY: Look for typical freshness colors (reds/pinks) vs oxidation (browns/grays).
  - FISH: Look for 'Glassy' (fresh) vs 'Milky/Opaque' (older).
  - EGGS: Check for unusual pink tints in whites or setting status during cooking.
  - PRODUCE: Look for yellowing in greens, dark soft spots on fruits, or fuzzy mold. 
  - DAIRY: Look for surface mold on cheese or separation/discoloration in liquids.

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
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    return {
      signals: (parsed.signals || []).map((s: any, index: number) => ({
        id: s.id || String(index),
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        // This mapping is what keeps your UI working
        type: s.riskLevel === 'none' ? 'info' : s.riskLevel,
        label: String(s.observation).toUpperCase(),
        description: String(s.interpretation)
      }))
    };
  } catch (e) {
    throw new Error("Analysis failed. Please try a clearer photo.");
  }
}
