export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // We are using the exact model ID that works in the v1beta spot
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Identify the main colors in this image and describe them simply for someone who is colorblind. Mention the brightness and contrast." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1]
            }
          }
        ]
      }],
      // This tells the AI to be as helpful as possible
      generationConfig: {
        temperature: 0.4,
        topP: 1,
        topK: 32,
        maxOutputTokens: 2048,
      }
    })
  });

  const data = await response.json();

  if (data.error) {
    // This will tell us if your API key itself has an issue
    throw new Error(`${data.error.message}`);
  }

  if (!data.candidates || data.candidates.length === 0) {
    throw new Error("The AI didn't return a description. Please try again.");
  }

  return data.candidates[0].content.parts[0].text;
}
