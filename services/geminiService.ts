export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Describe the colors in this image for a colorblind person. Be brief." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Google Error: ${data.error.message}`);
  }

  // KEY CHANGE: Get the text, then let the system know we're done
  const resultText = data.candidates[0].content.parts[0].text;
  
  // This helps prevent the 'black screen' crash by making sure we 
  // only send back the tiny text, not the huge image data again.
  return resultText.trim();
}
