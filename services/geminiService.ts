import { GoogleGenerativeAI } from "@google/generative-ai";

// This line must stay exactly like this
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeImage(base64Image: string) {
  // WE ARE FORCING V1BETA HERE - This is the "correct spot" for free accounts
  const model = genAI.getGenerativeModel(
    { model: "gemini-1.5-flash" },
    { apiVersion: "v1beta" }
  );

  const prompt = "Identify the main colors in this image. Describe them simply for someone who is colorblind, focusing on contrast and brightness.";

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
