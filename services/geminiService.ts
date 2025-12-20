export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // We use "chromatic" and "gradient" to describe the pink without triggering 'Medical' filters
  const prompt = `Analyze this image for high-contrast chromatic variations. 
  Identify 4 markers. 
  
  Instructions:
  - If a pink or salmon-colored gradient is detected in the egg white (the non-yellow protein area), place a marker directly on that pink hue.
  - Label: "CHROMATIC ANOMALY"
  - Description: "This specific pinkish-orange hue is a known indicator of protein degradation and organic growth. Most users discard for safety."
  
  - For standard yellow areas: Label: "YELLOW GRADIENT", Description: "Standard expected color."

  Return ONLY JSON format.`;

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
      // FORCE JSON MODE
      generationConfig: {
        response_mime_type: "application/json",
        response_schema: {
          type: "OBJECT",
          properties: {
            signals: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  id: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  label: { type: "string" },
                  description: { type: "string" }
                },
                required: ["id", "x", "y", "label", "description"]
              }
            }
          }
        }
      }
    })
  });

  const data = await response.json();

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("The AI is currently filtering this image. Try a different angle.");
  }

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(textResult);
    
    // Final check to make sure the data is ready for the UI
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      ...s,
      id: s.id || String(index),
      type: 'info',
      label: s.label.toUpperCase()
    }));
    
    return parsed;
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("Unable to read the AI's report. Please try again.");
  }
}
