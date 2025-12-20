export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Task: Object detection and chromatic analysis.
  Return 3 distinct markers in [0, 1000] coordinates.
  
  1. YOLK_L: Center of the left-most yellow circle.
  2. YOLK_R: Center of the right-most yellow circle.
  3. TINT_ZONE: If a pink/salmon hue is present in the white protein area, mark its center. If not, mark a standard white area.

  Assign "critical" ONLY to TINT_ZONE if a pink hue is found. All others are "info".

  Return JSON ONLY:
  {
    "signals": [
      {
        "id": "1",
        "type": "info" | "critical",
        "x": number,
        "y": number,
        "label": "short label",
        "description": "one clear sentence"
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
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
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
    
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type === 'critical' ? 'critical' : 'info',
      // Convert 1000-point precision back to the 100-point UI scale
      x: (Number(s.x) / 10) || 50,
      y: (Number(s.y) / 10) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("Coordinate grounding failed. Please try again.");
  }
}
