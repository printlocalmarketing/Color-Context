export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual technician. 
  Task: Identify 4 markers in this image based on chromatic shifts.
  
  RULES:
  1. If the EGG WHITE has a pink, salmon, or red tint, place a marker EXACTLY on the pink tint (not the yolk). 
     Label: "UNUSUAL COLOR GRADIENT"
     Description: "Visual anomaly detected: Pink/Salmon hue in the protein area. This is a high-risk indicator of organic spoilage. Discard recommended."
  
  2. For the YOLK, only mark it if it is a standard yellow.
     Label: "STANDARD TEXTURE"
     Description: "Center appears as expected for a standard yolk."

  3. Identify the EDGES. 
     Label: "EDGE ANALYSIS"
     Description: "The perimeter shows [describe color]. Verify if this matches your target cook level."

  Return JSON ONLY:
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
      }],
      // This tells the AI to be less restrictive with its filters
      safetySettings: [
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
      ]
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    parsed.signals = parsed.signals.map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.type || 'info',
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.label || "Visual Sign").toUpperCase(),
      description: String(s.description || "No description available.")
    }));
    
    return parsed;
  } catch (e) {
    throw new Error("The AI response was filtered or messy. Try again.");
  }
}
