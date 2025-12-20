import { GoogleGenerativeAI } from "@google/generative-ai";

// This creates the connection using your Vercel API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeImage(base64Image: string) {
  // We use the 'flash' model for the fastest results
  const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

  const prompt = "Identify the main colors in this image and describe them for someone who is colorblind.";

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: base64Image.split(',')[1],
        mimeType: "image/jpeg"
      }
    }
  ]);

  const response = await result.response;
  return response.text();
}
