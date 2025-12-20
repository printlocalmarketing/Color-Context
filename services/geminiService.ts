export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Using the 2.5 Flash model which is the active free tier for late 2025
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a high-contrast visual assistant for the colorblind. 
  Scan this ${mode} image and find 4 key points of interest. 

  CRITICAL SAFETY RULE: Never tell the user food is "safe to eat" or "perfectly cooked" based only on color. 
  Instead, describe visual signs (e.g., "The edge has turned opaque white"). 
  Specifically for eggs, warn that translucency or pink/salmon tints are red flags for bacteria (Pseudomonas) or spoilage. 
  Most people would toss this out to stay safe.
  
  Return ONLY this JSON structure:
  {
    "signals": [
      {
        "id": "1",
        "type": "info",
        "x": 50,
        "y": 50,
        "label": "Brief Visual Sign (e.g. Pink Tint)",
        "description": "What it means (e.g. Warning: Bacteria/Spoilage)"
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
    throw new Error(`Google Error: ${data.error.message}`);
  }

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    // Clean up any markdown code blocks the AI might include
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleanJson);
    
    // Safety check to ensure data fits the Drawer UI requirements
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
