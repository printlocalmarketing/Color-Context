export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // This is the DIRECT URL to the v1beta spot, bypassing the broken 'v1' library
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Identify the main colors in this image and describe them simply for someone who is colorblind." },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image.split(',')[1]
            }
          }
        ]
      }]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(data.error.message);
  }

  return data.candidates[0].content.parts[0].text;
}
