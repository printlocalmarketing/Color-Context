export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual technician. 
  Identify 4 points of interest in this image. 
  
  Rule: If you see a pink/salmon tint in the egg white area, place a marker directly on that tint.
  Label it: "CHROMATIC ANOMALY".
  Description: "Noticeable pink tint detected. This is a red flag for spoilage. Most users discard for safety."

  Return ONLY JSON:
  {
    "signals": [
      {
        "id": "1",
        "x": 50,
        "y": 50,
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
    
    // THIS IS THE CRITICAL FIX: The "Parsed Map"
    // We force every 'x' and 'y' to be a real Number and provide defaults
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => {
      // Logic: If the AI sent a string, convert to Number. If it's missing, use 50.
      const safeX = isNaN(Number(s.x)) ? 50 : Number(s.x);
      const safeY = isNaN(Number(s.y)) ? 50 : Number(s.y);

      return {
        id: s.id || String(index),
        type: 'info',
        x: safeX,
        y: safeY,
        label: String(s.label || "VISUAL POINT").toUpperCase(),
        description: String(s.description || "No description available.")
      };
    });
    
    return parsed;
  } catch (e) {
    console.error("Coordinate Parse Error:", e);
    throw new Error("The AI report was blocked or formatted incorrectly. Try again.");
  }
}
