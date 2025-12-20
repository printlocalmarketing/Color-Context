export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual assistant. Provide 3-4 markers.
  
  CRITICAL ACCURACY RULES:
  1. YOLK MARKERS: Place the dot EXACTLY in the center of each yellow yolk. 
     - Label: "BRIGHT YELLOW YOLK"
     - Description: "This yolk appears intact and round. If it is runny, that is a standard soft-cook style."
     - Type: "info"

  2. PINK TINT MARKER: If you see a pink/salmon hue in the egg white (the albumen), place the marker directly on that pink tint.
     - Label: "PINK/SALMON TINT DETECTED"
     - Description: "WARNING: This unusual pink color is a strong indicator of bacterial growth (Pseudomonas). Discarding is highly recommended for safety."
     - Type: "critical"

  3. MAP COORDINATES: Use 0-100 scale for x and y.

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
      type: s.type === 'critical' ? 'critical' : 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("Visual analysis failed. Please try again.");
  }
}
