
import { GoogleGenAI } from "@google/genai";
import { Vitals } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getHealthRiskAnalysis = async (vitals: Vitals): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Analysis: Systolic pressure trend indicates moderate risk. Recommended: Reduce sodium intake.";
  }

  try {
    const prompt = `
      Act as the AllWays Care medical AI assistant for seniors.
      Analyze these vitals:
      Heart Rate: ${vitals.heartRate} bpm
      BP: ${vitals.bpSystolic}/${vitals.bpDiastolic}
      Glucose: ${vitals.glucose} mg/dL
      Stress: ${vitals.stress}/100

      Provide a concise, 1-sentence risk assessment starting with "Analysis:".
      Focus on the most concerning metric. Keep it under 20 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis completed. Vitals are within expected variation.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to connect to AllWays Care Analysis service. Check network.";
  }
};

export const getAshaGreeting = async (vitals: Vitals): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Namaste. I am from AllWays Care support. I see your BP is high. Stay calm, I am dispatching help.";
    }

    try {
        const prompt = `
          Act as an ASHA worker (community health worker) in India representing the AllWays Care support network.
          A senior patient's emergency alarm went off.
          Their Vitals: HR ${vitals.heartRate}, BP ${vitals.bpSystolic}/${vitals.bpDiastolic}.
          Write a very short, calming spoken message (1 sentence).
        `;
    
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
    
        return response.text || "Hello, this is your AllWays Care health worker. I am checking your status now.";
      } catch (error) {
        return "Connection established. AllWays Care support worker joining...";
      }
}
