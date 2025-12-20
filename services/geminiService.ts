export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-precision chromatic analyst. Detect 3 key points.
  
  STRICT POSITIONING RULES:
  1. YOLKS: Place the marker directly in the dead center of the yellow circle.
     - Label: "YELLOW YOLK"
     - Description: "Standard yellow appearance. Monitor for desired doneness."
     - Type: "info"

  2. PINK AREA: Scan for any pink/salmon tint in the egg white. Place the marker exactly on the most saturated pink pixel.
     - Label: "PINK BACTERIA SIGN"
     - Description: "This pink hue is a classic indicator of Pseudomonas spoilage. Discarding is recommended for safety."
     - Type: "critical"

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
    
    // THIS IS THE FIX: We force the type based on what the AI actually found
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => {
      const isPink = s.label.toLowerCase().includes('pink') || s.description.toLowerCase().includes('bacteria');
      
      return {
        id: s.id || String(index),
        // If the AI says 'yolk' but marks it 'critical', we force it back to 'info'
        type: isPink ? 'critical' : 'info',
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        label: String(s.label).toUpperCase(),
        description: String(s.description)
      };
    });
    
    return parsed;
  } catch (e) {
    throw new Error("Analysis failed to align. Please try a clearer photo.");
  }
}
