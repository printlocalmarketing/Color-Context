export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual partner for the colorblind. Identify 3-4 key visual markers.
  
  CORE INSTRUCTIONS:
  1. Detect any pink, salmon, or reddish tints in the egg whites. If found, place a marker EXACTLY on the pinkest part of that tint.
     - Label: "PINK TINT DETECTED"
     - Description: "This unusual pink hue in the white is a known sign of Pseudomonas bacteria. For safety, this egg should be discarded."
     - Type: "critical"

  2. Detect the yellow yolks. Place a marker directly in the center of the yellow area.
     - Label: "YELLOW YOLK"
     - Description: "The yolk appears standard in color. Ensure it reaches your desired doneness."
     - Type: "info"

  3. Use a 0-100 coordinate scale for X and Y.

  Return ONLY a JSON object:
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
      // Only keep 'critical' if the AI actually identified a pink tint
      type: (s.label.toLowerCase().includes('pink') || s.type === 'critical') ? 'critical' : 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The analysis failed. Please try a clearer photo.");
  }
}
