
import { GoogleGenAI, Type } from "@google/genai";
import { UserPreferences, TripItinerary, ImageAnalysis } from "./types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const ITINERARY_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    trip_title: { type: Type.STRING },
    total_estimated_cost: { type: Type.STRING },
    weather_forecast: { type: Type.STRING },
    itinerary: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.NUMBER },
          location: { type: Type.STRING },
          activities: { type: Type.ARRAY, items: { type: Type.STRING } },
          food_recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          rating: { type: Type.NUMBER },
          review_count: { type: Type.NUMBER },
          opening_hours: { type: Type.STRING },
          travel_time_from_prev: { type: Type.STRING },
          distance_from_prev: { type: Type.STRING },
          image_description: { type: Type.STRING },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER },
              lng: { type: Type.NUMBER }
            }
          }
        },
        required: ["day", "location", "activities", "food_recommendations", "coordinates", "rating", "review_count", "opening_hours", "image_description"]
      }
    },
    travel_tips: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["trip_title", "total_estimated_cost", "weather_forecast", "itinerary", "travel_tips"]
};

/**
 * GENERATE ITINERARY (Search Grounding)
 * Uses gemini-3-flash-preview with googleSearch tool.
 */
export const generateTripItinerary = async (prefs: UserPreferences): Promise<TripItinerary> => {
  const ai = getAI();
  const prompt = `Generate a detailed travel itinerary for Maharashtra, India.
  Starting City: ${prefs.startingCity}
  Duration: ${prefs.duration} days
  Budget: ${prefs.budget}
  Vibe: ${prefs.vibe}
  Month: ${prefs.month}
  
  Use Google Search to find current weather conditions, seasonal festivals, and updated entry fees for landmarks. 
  Ensure all data is accurate for ${prefs.month} 2024/2025.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction: "You are the 'ExploreMH' travel engineer. You synthesize data from Google Search to create perfect plans. Always provide valid JSON.",
      responseMimeType: "application/json",
      responseSchema: ITINERARY_SCHEMA as any,
      tools: [{ googleSearch: {} }]
    },
  });

  const result = JSON.parse(response.text || '{}');
  
  // Extract website URLs from groundingMetadata as mandated
  if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
    result.grounding_sources = response.candidates[0].groundingMetadata.groundingChunks;
  }
  
  return result;
};

/**
 * COMPLEX ASSISTANT (Thinking Mode)
 * Uses gemini-3-pro-preview with max thinking budget.
 */
export const askComplexQuestion = async (query: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: query,
    config: {
      systemInstruction: "You are a senior historian and geography expert for Maharashtra. Provide deep, reasoned insights. Think through the cultural and historical layers before answering.",
      thinkingConfig: { thinkingBudget: 32768 }
    },
  });
  return response.text || "No insights found.";
};

/**
 * LOW LATENCY TIPS (Fast Responses)
 * Uses gemini-2.5-flash-lite-latest.
 */
export const getQuickFact = async (location: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite-latest",
    contents: `Give me one super quick unique travel fact about ${location} in Maharashtra. Keep it under 20 words.`,
  });
  return response.text || "";
};

/**
 * IMAGE GENERATION (Nano Banana Pro)
 * Uses gemini-3-pro-image-preview with size selection.
 */
export const generateMaharashtraImage = async (prompt: string, size: "1K" | "2K" | "4K"): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: `A professional travel postcard of ${prompt} in Maharashtra, India. High fidelity, cinematic lighting, 8k, tourism style.` }],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
        imageSize: size
      }
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to generate image.");
};

/**
 * IMAGE ANALYSIS
 */
export const analyzePlaceImage = async (base64Image: string): Promise<ImageAnalysis> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { mimeType: "image/jpeg", data: base64Image } },
        { text: "Identify this place. If it's in Maharashtra, suggest 3 similar Maharashtra sites." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          location_guess: { type: Type.STRING },
          description: { type: Type.STRING },
          similar_places_in_mh: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      } as any,
    },
  });

  return JSON.parse(response.text || '{}');
};
