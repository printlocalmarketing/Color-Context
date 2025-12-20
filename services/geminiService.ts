export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a precision visual analyst. Detect 3 distinct points.
  
  STRICT SPATIAL RULES:
  1. PINK TINT: Locate the pink/salmon hue in the egg white. Place the marker directly on the center of that pink area.
     - Label: "PINK BACTERIA SIGN"
     - Description: "This pink hue is a classic indicator of Pseudomonas spoilage. Do not consume."
     - Type: "critical"

  2. YOLKS: Locate the yellow yolks. Place one marker in the dead center of the left yolk and one in the dead center of the right yolk.
     - Label: "YELLOW YOLK"
     - Description: "Standard yellow appearance. Monitor for desired doneness."
     - Type: "info"

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
    
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => {
      // Logic fix: Ensure the label matches the visual type
      const isPink = s.label.toLowerCase().includes('pink') || s.description.toLowerCase().includes('bacteria');
      
      return {
        id: s.id || String(index),
        // If it's a yolk, force it to 'info' regardless of what the AI says
        type: isPink ? 'critical' : 'info',
        x: Number(s.x) || 50,
        y: Number(s.y) || 50,
        label: String(s.label).toUpperCase(),
        description: String(s.description)
      };
    });
    
    return parsed;
  } catch (e) {
    throw new Error("Analysis alignment failed. Try again.");
  }
}
