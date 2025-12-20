export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // Using the stable Gemini 2.5 Flash for the current free tier
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Describe the colors in this image briefly for someone who is colorblind." },
          { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] } }
        ]
      }]
    })
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Google Error: ${data.error.message}`);
  }

  // MEMORY SAFETY: Extract the text and clear the variable
  if (data.candidates && data.candidates[0].content) {
    const result = data.candidates[0].content.parts[0].text;
    
    // We trim the text to keep it 'light' for the screen to render
    return result.trim();
  }
  
  throw new Error("Analysis finished but result was empty.");
}
