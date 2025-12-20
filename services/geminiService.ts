export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // As of late 2025, gemini-2.5-flash is the stable free tier model
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Identify the main colors in this image for someone who is colorblind." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }]
    })
  });

  const data = await response.json();

  if (data.error) {
    // This will catch if your API key itself is blocked or invalid
    throw new Error(`Google Error: ${data.error.message}`);
  }

  return data.candidates[0].content.parts[0].text;
}
