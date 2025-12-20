export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-precision spatial assistant. 
  Task: Identify exactly 3-4 markers. Use [0, 1000] normalized coordinates.

  ACCURACY RULES:
  1. For YOLKS: Place the marker directly in the GEOMETRIC CENTER of the yellow circle.
  2. For PINK TINTS: Place the marker in the densest part of the pink/salmon hue in the white.
  3. Label the left yolk "LEFT YOLK" and the right yolk "RIGHT YOLK" for clarity.

  CRITICAL VS INFO RULES:
  - ONLY use "critical" if you see the pink/salmon bacteria tint.
  - Use "info" for yolks, edges, or normal textures. Do NOT mark healthy yolks as critical.

  Return ONLY JSON:
  {
    "signals": [
      {
        "id": "1",
        "type": "info" | "critical",
        "x": number,
        "y": number,
        "label": "string",
        "description": "string"
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
      // Only allow 'critical' if the AI explicitly chose it for a danger
      type: s.type === 'critical' ? 'critical' : 'info',
      // We divide by 10 because the UI expects 0-100, but 0-1000 is more accurate for the AI
      x: (Number(s.x) / 10) || 50,
      y: (Number(s.y) / 10) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The AI report was formatted incorrectly. Try again.");
  }
}
