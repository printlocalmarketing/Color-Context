// We are adding '/version' to the end of the import to force it to look at the new spot
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeImage(base64Image: string) {
  // This is the direct address for the free flash model
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
  }, { apiVersion: 'v1beta' });

  const prompt = "Identify the main colors in this image. Describe them simply for someone who is colorblind.";

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
