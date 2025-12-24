import { AnalysisResponse, AppMode } from "../types";

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Your task is to analyze food in photos for visual signs that people typically use to judge status.

  STRICT FOCUS RULES:
  1. ONLY identify signals on the food item itself (Beef, Fish, Poultry, Pork, or Eggs).
  2. COMPLETELY IGNORE packaging, labels, background, or supermarket lighting.
  3. DO NOT give direct safety commands. Instead, explain what "most people look for" to determine status.

  MODE: ${mode === 'shopping' ? 'SHOPPING INSIGHT' : 'COOKING INSIGHT'}

  SPECIFIC LOGIC:
  - BEEF: Look for 'Cherry Red' (fresh), 'Deep Purple' (vacuum-fresh), or 'Brown/Gray' (oxidizing).
  - FISH: Look for 'Glassy/Translucent' (fresh) vs 'Milky/Opaque' (older). Check for 'Gaping' (flesh separating).
  - POULTRY: Look for 'Glossy Pink/White' (raw) vs 'Opaque White' (cooked).
  - PORK: Look for 'Pinkish-Red' (fresh) vs 'Pale/Grey' (oxidizing).
  - EGGS: If egg whites show a pink/reddish tint, mark riskLevel "critical". If glossy/clear in cooking, mark riskLevel "alert".
  - PRODUCE: Look for 'Yellowing' in leafy greens (alert), 'Dark/Slimy Spots' on fruits or veg (critical), or 'Fuzzy Growth/Mold' (critical).
  - DAIRY: Look for surface 'Mold' on cheese (critical), 'Separation/Curdling' in liquids (alert), or 'Yellowing' in white cheeses (alert).
  - GRAINS: Look for 'Green/Black/White Fuzzy Spots' on bread or baked goods (critical).

  Return ONLY JSON in this format:
  {
    "signals": [
      {
        "id": "1",
        "x": number (0-100),
        "y": number (0-100),
        "observation": "Physical description (e.g., 'Beef: Graying Edge')",
        "interpretation": "Savvy explanation of what this color suggests.",
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
