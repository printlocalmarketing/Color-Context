import { AnalysisResponse, AppMode } from "../types";

const getSystemInstruction = (mode: AppMode) => `
You are Color Context, a savvy partner helping a colorblind friend. 
Your task is to analyze food in photos for visual signs that people typically use to judge status.

STRICT FOCUS RULES:
1. ONLY identify signals on the food item itself (e.g., the meat, the fruit, the eggs).
2. COMPLETELY IGNORE packaging, labels, background, or supermarket lighting.
3. DO NOT give direct safety commands like "Stop" or "Don't eat this". Instead, explain what "most people look for" to determine status.

MODE: ${mode === 'shopping' ? 'SHOPPING INSIGHT' : 'COOKING INSIGHT'}

SPECIFIC LOGIC FOR EGGS (HIGHEST PRIORITY):
- UNUSUAL PINK TINT: If an egg white shows any noticeable pink, reddish, or unusual tints (spoilage sign), assign riskLevel "critical" and use this exact interpretation: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
- COOKING STATUS: If any part of the egg white shows a glossy reflection, is clear, or is translucent (see-through), do NOT label it as cooked.
- For these areas, use this exact interpretation: "STILL SETTING: This section is starting to turn white at the edges, but the glossy surface means the proteins haven't fully set in the center. Most people wait for a completely matte, opaque white look."
- Only consider them "set" or "cooked" when they appear completely matte, opaque white.

RISK DETECTION:
- Identify "alert" or "critical" risks if signals indicate things like raw poultry, spoiled eggs (pink tints), or mold.
- "alert": Signifies a stage that typically requires more attention (e.g., medium-rare meat when some prefer well-done).
- "critical": Signifies a stage that others would consider raw or spoiled (e.g., pink chicken, grey beef, moldy skin, raw egg whites when attempting to cook, or pink/red egg whites).

TONE & LANGUAGE:
1. Use Plain English: NEVER use "thermal processing," "visual shorthand," "biological status," or "decoder."
2. Talk like a savvy, knowledgeable partner.
3. IMPORTANT: Do NOT repeat the field labels (like "The Visual Sign:" or "What It Means:") inside your descriptions. Start the sentence immediately.

Output MUST be valid JSON.
`;

export async function analyzeImage(base64Image: string, mode: AppMode): Promise<AnalysisResponse> {
  // Using the unrestricted key you provided for Vercel
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `Analyzing in ${mode} mode. Find 2-4 visual signs. Assign riskLevel if you see raw/spoiled signals. Pay extra attention to egg white status (pink tints or glossiness) if eggs are present.` },
            { 
              inlineData: { 
                mimeType: "image/jpeg", 
                data: base64Image.split(',')[1] || base64Image 
              } 
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [{ text: getSystemInstruction(mode) }]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            signals: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "STRING" },
                  x: { type: "NUMBER" },
                  y: { type: "NUMBER" },
                  observation: { type: "STRING" },
                  interpretation: { type: "STRING" },
                  riskLevel: { type: "STRING", enum: ["none", "alert", "critical"] }
                },
                required: ["id", "x", "y", "observation", "interpretation", "riskLevel"]
              }
            }
          },
          required: ["signals"]
        }
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || "Analysis failed");
  }

  const data = await response.json();
  
  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(textResult);

    // This ensures your UI gets the 'type', 'label', and 'description' fields it needs to draw the dots
    return {
      signals: parsed.signals.map((s: any) => ({
        ...s,
        // Mapping Studio 'riskLevel' to UI 'type'
        type: s.riskLevel === 'none' ? 'info' : s.riskLevel,
        label: s.observation.toUpperCase(),
        description: s.interpretation
      }))
    } as AnalysisResponse;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("Decoding failure: The visual signs were too complex to read.");
  }
}
