import { GoogleGenAI, Chat } from "@google/genai";
import { PersonaType, Message } from "../types";
import { PERSONAS } from "../constants";

let chatInstance: Chat | null = null;
let currentModelType: PersonaType | null = null;

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Initializes or resets the chat session based on the selected persona.
 */
export const getChatSession = (personaType: PersonaType, history: Message[] = []): Chat => {
  // If we already have a session for this persona and the history length matches (rudimentary check), return it
  // Ideally, we sync history strictly, but for this app, we recreate context if persona changes
  if (chatInstance && currentModelType === personaType) {
    return chatInstance;
  }

  const persona = PERSONAS[personaType];
  
  // Map internal message format to Gemini API format if needed, 
  // but for a fresh session we often rely on system instructions + new inputs.
  // Here we start fresh to apply the new System Instruction cleanly.
  
  chatInstance = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: persona.systemInstruction,
      temperature: 0.7, 
    },
  });

  currentModelType = personaType;
  return chatInstance;
};

/**
 * Sends a message to the Gemini model.
 */
export const sendMessageToGemini = async (text: string, personaType: PersonaType): Promise<string> => {
  try {
    const chat = getChatSession(personaType);
    
    // Using sendMessage for atomic request/response. 
    // For streaming, we would use sendMessageStream.
    const response = await chat.sendMessage({ 
      message: text 
    });

    return response.text || "I'm having trouble finding the right words right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm sorry, I seem to be having connection issues. Can we try again?";
  }
};

/**
 * Analyze mood from text (Background utility).
 * Uses a separate lighter call to avoid messing up the main chat context.
 */
export const analyzeMoodFromText = async (text: string): Promise<number | null> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the sentiment of the following text and return ONLY a number from 1 (extremely negative) to 10 (extremely positive). Text: "${text}"`,
    });
    
    const score = parseInt(response.text.trim());
    return isNaN(score) ? null : score;
  } catch (e) {
    console.error("Mood analysis failed", e);
    return null;
  }
};