import { MoodEntry, Message, PersonaType } from "../types";

const KEYS = {
  MOOD_HISTORY: 'emoti_mood_history',
  CHAT_HISTORY: 'emoti_chat_history',
  LAST_PERSONA: 'emoti_last_persona'
};

export const saveMoodEntry = (entry: MoodEntry) => {
  const history = getMoodHistory();
  const updated = [...history, entry];
  localStorage.setItem(KEYS.MOOD_HISTORY, JSON.stringify(updated));
  return updated;
};

export const getMoodHistory = (): MoodEntry[] => {
  const data = localStorage.getItem(KEYS.MOOD_HISTORY);
  return data ? JSON.parse(data) : [];
};

export const saveChatHistory = (messages: Message[]) => {
  localStorage.setItem(KEYS.CHAT_HISTORY, JSON.stringify(messages));
};

export const getChatHistory = (): Message[] => {
  const data = localStorage.getItem(KEYS.CHAT_HISTORY);
  return data ? JSON.parse(data) : [];
};

export const saveLastPersona = (persona: PersonaType) => {
  localStorage.setItem(KEYS.LAST_PERSONA, persona);
};

export const getLastPersona = (): PersonaType => {
  return (localStorage.getItem(KEYS.LAST_PERSONA) as PersonaType) || PersonaType.FRIEND;
};

export const clearData = () => {
  localStorage.clear();
};