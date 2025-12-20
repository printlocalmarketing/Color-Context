export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Analyze this ${mode} image. Find 2-4 key visual signs.

  SPECIFIC LOGIC FOR EGGS (HIGHEST PRIORITY):
  - UNUSUAL PINK TINT: If an egg white shows a pink/salmon tint, assign riskLevel "critical". 
    Interpretation: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
  - COOKING STATUS: If egg white is glossy or translucent, assign riskLevel "alert".
    Interpretation: "STILL SETTING: The glossy surface means proteins haven't fully set. Most wait for a matte, opaque white look."
  
  SPATIAL RULE: Place markers (x, y) directly in the GEOMETRIC CENTER of the feature.`;

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
                  observation: { type: "STRING" },
                  interpretation: { type: "STRING" },
                  riskLevel: { type: "STRING", enum: ["none", "alert", "critical"] }
                },
                required: ["id", "x", "y", "observation", "interpretation", "riskLevel"]
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
    
    // Map the Studio schema to your Drawer UI
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.riskLevel === 'none' ? 'info' : s.riskLevel,
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.observation).toUpperCase(),
      description: String(s.interpretation)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The visual signs were too complex to read. Try again.");
  }
}
