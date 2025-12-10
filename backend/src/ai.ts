// src/lib/moderation.ts
import { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from "@google/generative-ai";

const client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function checkSafety(text: string) {
  const model = client.getGenerativeModel({
    model: "gemini-1.5-flash",
    // Set filters to BLOCK everything medium or high
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE },
    ],
  });

  try {
    // We ask it to simply print the text.
    // If the TEXT ITSELF is bad, Gemini will refuse to generate the response.
    const result = await model.generateContent(`Print this text: "${text}"`);

    // If we get a response, it's safe.
    return result.response.text() ? true : false;
  } catch (e: any) {
    // If it threw a block error, it's UNSAFE.
    if (e.message?.includes("SAFETY")) return false;
    return false; // Default to unsafe
  }
}
