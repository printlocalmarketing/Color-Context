export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Back to the version that actually worked for you
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual technician. 
  Identify 4 markers in this image based on chromatic shifts.
  
  RULES:
  1. If you see a pink, salmon, or red tint in the egg white, place the marker EXACTLY on that pink spot (NOT on the yellow yolk).
  2. Label: "CHROMATIC ANOMALY"
  3. Description: "Visual Sign: Unusual pink/salmon tint detected in the protein area. This is a red flag for spoilage or organic growth. Most users discard for safety."
  
  4. For the yolks, only mark them if they are standard yellow. Label: "YELLOW GRADIENT".
  5. Never say "safe to eat." Only describe the colors you see.

  Return ONLY JSON:
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
    throw new Error(`Model Error: ${data.error.message}`);
  }

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // Formatting for your AI Studio-style Side Panel
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The AI is currently filtering this image. Try a different angle.");
  }
}
