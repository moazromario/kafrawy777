import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateIslamicUIImages() {
  const prompts = [
    "A premium mobile app UI design for an Islamic application home screen. Clean modern design, emerald green and white color palette, Arabic typography (RTL), featuring cards for Prayer Times, Quran, and Azkar. High resolution, 4k, minimalist aesthetic.",
    "A premium mobile app UI design for a Holy Quran reader screen. Elegant Arabic calligraphy, clean white background with subtle emerald accents, readable typography, verse navigation, and audio player controls. High resolution, 4k, minimalist aesthetic.",
    "A premium mobile app UI design for an Islamic Azkar (Supplications) screen. Featuring a morning/evening toggle, large readable Arabic text cards, and a digital tasbih counter. Emerald green and white theme, high resolution, 4k.",
    "A premium mobile app UI design for a Prayer Times screen. Showing a beautiful gradient header with the next prayer, a list of daily prayer times with notification icons, and a location pin. Modern, clean, emerald green theme.",
    "A premium mobile app UI design for a Qibla compass screen. A sleek, modern compass dial with an emerald green needle pointing to the Kaaba icon. Minimalist background, high resolution, 4k."
  ];

  const results = [];
  for (const prompt of prompts) {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "9:16",
        },
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        results.push(`data:image/png;base64,${part.inlineData.data}`);
      }
    }
  }
  return results;
}
