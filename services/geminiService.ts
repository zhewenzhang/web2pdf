import { GoogleGenAI, Type } from "@google/genai";

export interface OptimizationResult {
  title: string;
  htmlBody: string;
}

export const optimizeHtmlForPdf = async (htmlContent: string): Promise<OptimizationResult> => {
  const apiKey = process.env.API_KEY;
  
  // Graceful handling for missing API Key to prevent app crashes
  if (!apiKey) {
    throw new Error("API Key is missing. Please add 'API_KEY' to your environment variables in your deployment settings (e.g., Vercel, Netlify).");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const modelId = "gemini-2.5-flash"; // Excellent speed/cost ratio for large text processing

    // Truncate extremely large files to avoid hard limits if necessary, 
    // though flash has a massive context window.
    // For safety, we limit input if it's absurdly large (e.g. > 2MB text).
    const maxLength = 2000000; 
    const inputContent = htmlContent.length > maxLength 
      ? htmlContent.substring(0, maxLength) + "...[Truncated]" 
      : htmlContent;

    const prompt = `
      You are an expert document formatter and web developer. 
      Your task is to take the provided raw HTML content (which might be a messy export from Word or a PPT slide deck) and rewrite it into a clean, professional, single-page HTML document suitable for converting to PDF.

      Rules:
      1. Extract the core content (text, tables, important images).
      2. Remove navigation bars, ads, tracking scripts, buttons, and sidebars.
      3. Use Tailwind CSS classes for styling. 
      4. Style it like a professional whitepaper or academic paper (Serif headings, Sans-serif body, clean spacing).
      5. Ensure high contrast (black text on white background) for printing.
      6. Return ONLY the HTML that goes INSIDE the <body> tag. Do not include <html>, <head>, or <body> tags themselves.
      7. If images are present (base64 or absolute URLs), preserve them. If they are relative paths that would break, try to keep the <img> tag but add an alt text warning.
      8. Format tables with Tailwind 'min-w-full divide-y divide-gray-300 border' styles.
    `;

    const response = await ai.models.generateContent({
      model: modelId,
      contents: [
        { role: 'user', parts: [{ text: prompt }] },
        { role: 'user', parts: [{ text: `RAW HTML INPUT:\n${inputContent}` }] }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A suitable title for the document derived from the content",
            },
            htmlBody: {
              type: Type.STRING,
              description: "The cleaned, Tailwind-styled HTML content (inner body only).",
            },
          },
          required: ["title", "htmlBody"],
        },
      },
    });

    const result = JSON.parse(response.text || "{}");
    
    if (!result.htmlBody) {
      throw new Error("Failed to generate optimized HTML");
    }

    return result as OptimizationResult;

  } catch (error) {
    console.error("Gemini optimization failed:", error);
    throw error;
  }
};