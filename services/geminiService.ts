export async function analyzeImage(base64Image: string, mode: 'shopping' | 'cooking') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `You are a colorblind assistant. Analyze this ${mode} image. 
  Return ONLY a JSON object with this exact structure:
  {
    "signals": [
      {
        "id": "1",
        "type": "info",
        "x": 50, 
        "y": 50,
        "label": "Color Analysis",
        "description": "Describe the main colors here for a colorblind person."
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

  // This part cleans the AI's answer so the App can read it without crashing
  try {
    const textResult = data.candidates[0].content.parts[0].text;
    const cleanJson = textResult.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    throw new Error("The AI response was formatted incorrectly. Please try again.");
  }
}
