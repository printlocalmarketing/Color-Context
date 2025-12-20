export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual assistant for the colorblind. 
  Scan this image. Locate the EXACT coordinates (x, y) where any unusual colors appear.

  CRITICAL SAFETY RULES:
  1. If you see pink, salmon, or red in the EGG WHITE, place the marker directly on that pink area of the white, NOT on the yellow yolk.
  2. Differentiate between a "Bright Yellow Yolk" (which is healthy/normal) and "Pink/Translucent Whites" (which is a sign of Pseudomonas bacteria).
  3. Only use the "Critical" label for actual dangers like the pink bacteria. Do not call a normal yolk "Critical."
  4. Never say food is "safe." Only describe visual facts like "The white is turning opaque" or "Noticeable pink tint detected."

  Return ONLY this JSON structure:
  {
    "signals": [
      {
        "id": "1",
        "type": "info",
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

  if (data.error) {
    throw new Error(`Google Error: ${data.error.message}`);
  }

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // Safety check to ensure data fits the AI Studio-style Side Panel
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type || 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label || "Visual Sign").toUpperCase(),
      description: String(s.description || "No description available.")
    }));
    
    return parsed;
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("The AI response was incompatible. Try again.");
  }
}
