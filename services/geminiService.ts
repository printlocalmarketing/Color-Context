export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are Color Context, a savvy partner helping a colorblind friend. 
  Analyze this ${mode} image. Find 2-4 key visual signs on the food.

  EGG LOGIC:
  - If white is pink/salmon: riskLevel "critical", interpretation: "This unusual pink tint is a red flag for bacteria/spoilage. Most people would likely toss this out to stay safe."
  - If white is glossy/translucent: riskLevel "alert", interpretation: "STILL SETTING: The glossy surface means proteins haven't fully set."
  - For normal yolks: riskLevel "none", interpretation: "Standard yellow appearance."

  Return ONLY JSON in this format:
  {
    "signals": [
      {
        "id": "1",
        "x": number (0-100),
        "y": number (0-100),
        "observation": "Short Label",
        "interpretation": "Savvy description",
        "riskLevel": "none" | "alert" | "critical"
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
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  const data = await response.json();
  if (data.error) throw new Error(data.error.message);

  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(textResult);
    
    // Map Studio logic to your Drawer UI dots
    parsed.signals = (parsed.signals || []).map((s: any, index: number) => ({
      id: s.id || String(index),
      type: s.riskLevel === 'none' ? 'info' : s.riskLevel,
      x: Number(s.x) || 50,
      y: Number(s.y) || 50,
      label: String(s.observation).toUpperCase(),
      description: String(s.interpretation)
    }));
    
    return parsed;
  } catch (e) {
    console.error("Studio Parse Error:", e);
    throw new Error("The AI is having trouble focusing. Try a clearer shot.");
  }
}
