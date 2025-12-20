export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-precision spatial grounding assistant. 
  Analyze this image. Identify only the MOST relevant points (minimum 2, maximum 5).

  PRECISION RULES:
  1. Use a [0, 1000] coordinate system where (0,0) is top-left and (1000,1000) is bottom-right.
  2. For the MEAT: Place the marker directly in the center of the pinkest/reddest part.
  3. For EGG WHITES: If you see pink/salmon tints, place a marker EXACTLY on the tint.
  4. Only use the "Critical" type for ACTUAL safety risks (like the pink bacteria or raw center). Use "Info" for everything else.
  5. Do NOT mark backgrounds, cutting boards, or irrelevant props.

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
    
    // Convert the AI's 0-1000 coordinates to the 0-100 percentage your UI needs
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type === 'critical' ? 'critical' : 'info',
      x: (Number(s.x) / 10) || 50, // 750 becomes 75%
      y: (Number(s.y) / 10) || 50,
      label: String(s.label).toUpperCase(),
      description: String(s.description)
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The AI report was blocked or formatted incorrectly. Try again.");
  }
}
