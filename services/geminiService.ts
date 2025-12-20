export async function analyzeImage(base64Image: string) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  
  // We are using the precise version 'gemini-1.5-flash-latest' 
  // which is the official way to reach the free model in v1beta
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: "Identify the main colors in this image and describe them simply for someone who is colorblind. Focus on contrast and brightness." },
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
    throw new Error(`${data.error.message}`);
  }

  // This ensures we get the text out of the complicated Google response
  if (data.candidates && data.candidates[0].content) {
    return data.candidates[0].content.parts[0].text;
  }
  
  throw new Error("The AI is busy. Please try again in a moment.");
}
