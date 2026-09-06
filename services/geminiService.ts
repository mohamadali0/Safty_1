
import { GoogleGenAI, Type } from "@google/genai";
import { Category, Severity } from "../types";

/**
 * Analyzes a violation image and description using Gemini AI.
 * Follows the latest @google/genai guidelines.
 */
export async function analyzeViolation(imageUri: string, description: string) {
  // Create a new GoogleGenAI instance right before making an API call to ensure it uses the current environment key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const base64Data = imageUri.split(',')[1];
  
  const prompt = `بصفتك خبير سلامة وصحة مهنية، قم بتحليل هذه الصورة والوصف: "${description}". 
  حدد مستوى الخطورة والتصنيف المناسب للمخالفة من الخيارات المتاحة (منخفضة، متوسطة، عالية، حرجة).
  أعطِ نصيحة قصيرة باللغة العربية لتجنب تكرار هذه المخالفة.`;

  try {
    // Upgrade: Using gemini-3-pro-preview for advanced multimodal reasoning required for safety analysis.
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: "image/jpeg" } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedSeverity: { 
              type: Type.STRING, 
              description: "مستوى الخطورة المقترح (منخفضة، متوسطة، عالية، حرجة)"
            },
            suggestedCategory: { 
              type: Type.STRING, 
              description: "تصنيف المخالفة المقترح من قائمة التصنيفات المتاحة"
            },
            expertAdvice: { 
              type: Type.STRING,
              description: "نصيحة الخبير باللغة العربية"
            }
          },
          required: ["suggestedSeverity", "suggestedCategory", "expertAdvice"]
        }
      }
    });

    // Directly access the text property as a string. Use a fallback for JSON parsing safety.
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return null;
  }
}
