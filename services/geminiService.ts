export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Using the 2.5-flash model which has the highest spatial accuracy for your key
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `Perform a high-precision chromatic and spatial scan. 
  Identify 3-4 markers using [0, 100] coordinates.

  DETECTION RULES:
  1. PINK/SALMON HUE: Scan the translucent protein area. If a pink or salmon-colored tint is present, place a marker exactly on the most saturated part of that tint.
     - Label: "CHROMATIC VARIATION"
     - Description: "This specific pink/salmon hue is a known indicator of organic change/spoilage. Discarding is recommended for safety."
  
  2. YELLOW CIRCLES: Identify the yellow yolks. Place a marker in the absolute geometric center of each yellow circle.
     - Label: "YELLOW YOLK"
     - Description: "Standard yellow color detected. Monitor for desired doneness."

  Return ONLY a JSON object:
  {
    "signals": [
      {
        "id": "1",
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
  if (data.error) throw new Error(`API Error: ${data.error.message}`);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // THE CRITICAL FIX: Mapping and Type Correction
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => {
      // Determine type based on the label we forced the AI to use
      const isAnomaly = s.label.includes("CHROMATIC") || s.description.includes("pink");
      
      return {
        id: s.id || String(index),
        type: isAnomaly ? 'critical' : 'info', // Force yolks to info, pink to critical
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        label: String(s.label).toUpperCase(),
        description: String(s.description)
      };
    });
    
    return parsed;
  } catch (e) {
    console.error("Parse Error:", e);
    throw new Error("The AI is currently filtering this view. Try a different angle.");
  }
}
