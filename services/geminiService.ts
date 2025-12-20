export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  // This prompt forces the AI to find MULTIPLE points of interest
  const prompt = `You are a high-contrast visual assistant for the colorblind. 
  Scan this ${mode} image and identify 3 to 5 distinct points of interest (like different food items, textures, or color changes).
  
  For each point, provide:
  1. Coordinates (x and y from 10 to 90).
  2. A clear label.
  3. A description focusing on color, contrast, and safety.

  Return ONLY a JSON object:
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

  if (data.error) throw new Error(data.error.message);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    // Clean up any extra characters the AI might add
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // Ensure every signal has a 'type' so the Drawer doesn't crash
    parsed.signals = parsed.signals.map((s: any) => ({
      ...s,
      type: s.type || 'info'
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The AI response was messy. Please try again.");
  }
}
