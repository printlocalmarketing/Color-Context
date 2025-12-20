export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  // Use the standard v1beta URL that successfully generated dots earlier
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual assistant for the colorblind. 
  Scan this image and identify 4 points of interest.
  
  Instructions:
  1. Look for any pink or salmon-colored areas in the egg whites. If found, place a marker EXACTLY on that pink spot.
  2. Label pink areas as "UNUSUAL COLOR GRADIENT" and describe it as an indicator of organic change.
  3. Mark the yolks as "YELLOW AREA".
  4. Describe the edges of the eggs.

  Return ONLY a JSON object:
  {
    "signals": [
      {
        "id": "1",
        "type": "info",
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

  if (data.error) {
    throw new Error(data.error.message);
  }

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // Formatting for your AI Studio side panel
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
    throw new Error("The AI response was filtered. Try a different photo angle.");
  }
}
