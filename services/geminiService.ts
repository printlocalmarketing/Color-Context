import { GoogleGenerativeAI } from "@google/generative-ai";

// This pulls the secret key you saved in Vercel
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export async function analyzeImage(base64Image: string) {
  // This uses the "flash" model which is the fastest
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
