export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual assistant for the colorblind. 
  Scan this ${mode} image and find 4 key points. 
  For each point, provide a JSON object. 
  
  CRITICAL: The "description" must be a simple string under 100 characters.
  
  Return ONLY this JSON structure:
  {
    "signals": [
      {
        "id": "1",
        "type": "info",
        "x": 50,
        "y": 50,
        "label": "Name of object",
        "description": "Color and safety info"
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
    
    // SAFETY CHECK: This prevents the black screen crash
    // It makes sure every dot has a valid label and description string.
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type || 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label || "Visual Point").toUpperCase(),
      description: String(s.description || "No description available.")
    }));
    
    return parsed;
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("The AI response was incompatible. Try again.");
  }
}
