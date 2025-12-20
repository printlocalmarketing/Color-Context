import { AnalysisResponse, AppMode } from "../types";

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Using 2.5 Flash as requested for the best accuracy
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Analyze this ${mode} image. Detect 2-4 key visual signs on the food.

  STRICT FOCUS: Ignore packaging/labels. Focus ONLY on the food.

  EGG LOGIC:
  - PINK TINT: If an egg white is pink/red, use riskLevel "critical". 
    Interpretation: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
  - GLOSSY/CLEAR WHITE: If the white is translucent/glossy, use riskLevel "alert".
    Interpretation: "STILL SETTING: This section is starting to turn white at the edges, but the glossy surface means the proteins haven't fully set in the center. Most people wait for a completely matte, opaque white look."
  - NORMAL YOLKS: Use riskLevel "none".
    Interpretation: "Standard yellow appearance."

  Return ONLY JSON in this format:
  {
    "signals": [
      {
        "id": "1",
        "x": number (0-100),
        "y": number (0-100),
        "observation": "Physical sign seen",
        "interpretation": "Savvy description",
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
    
    // THE BRIDGE: This maps the AI's "riskLevel" to the "type" your UI needs to draw dots
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
    console.error("Parse Error:", e);
    throw new Error("The AI is having trouble focusing. Try a clearer shot.");
  }
}
