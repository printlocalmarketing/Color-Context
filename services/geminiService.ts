export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Analyze this ${mode} image for visual signs people use to judge status.

  SPECIFIC LOGIC FOR EGGS:
  - UNUSUAL PINK TINT: If an egg white shows pink/salmon tints, assign "critical" and interpret as: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
  - COOKING STATUS: If egg white is glossy or translucent, mark as "alert" and interpret as: "STILL SETTING: The glossy surface means proteins haven't fully set. Most wait for a completely matte, opaque white look."
  - YOLKS: Mark "none" risk for standard yellow yolks.

  ACCURACY RULE: Use [0, 100] coordinates. Place markers in the GEOMETRIC CENTER of the feature (the center of the yolk or the center of the pink zone).`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: prompt },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }],
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
                  label: { type: "STRING" },
                  description: { type: "STRING" },
                  type: { type: "STRING", enum: ["none", "alert", "critical"] }
                },
                required: ["id", "x", "y", "label", "description", "type"]
              }
            }
          }
        }
      }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(textResult);
    
    // Final mapping to ensure Drawer UI works perfectly
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type === 'none' ? 'info' : s.type, // Map 'none' to 'info' for your UI
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    console.error("Studio Logic Parse Error:", e);
    throw new Error("The visual signs were too complex to read. Try again.");
  }
}
