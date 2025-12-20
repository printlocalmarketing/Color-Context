import { AnalysisResponse, AppMode } from "../types";

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Using 2.5 Flash for the highest precision with your egg logic
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
  - Only consider them "set" or "cooked" when they appear completely matte, opaque white.

  RISK DETECTION:
  - "alert": Signifies a stage that typically requires more attention (e.g., medium-rare meat when some prefer well-done).
  - "critical": Signifies a stage that others would consider raw or spoiled (e.g., pink chicken, grey beef, moldy skin, raw egg whites when attempting to cook, or pink/red egg whites).

  TONE & LANGUAGE:
  1. Use Plain English: NEVER use "thermal processing," "visual shorthand," "biological status," or "decoder."
  2. Talk like a savvy, knowledgeable partner.
  3. IMPORTANT: Start the sentence immediately. Do NOT repeat labels like "The Visual Sign:".

  Return ONLY JSON in this format:
  {
    "signals": [
      {
        "id": "unique_string",
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

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // THIS IS THE BRIDGE: Maps the AI's riskLevel back to the 'type' your dots need
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
    throw new Error("Decoding failure: The visual signs were too complex to read.");
  }
}
