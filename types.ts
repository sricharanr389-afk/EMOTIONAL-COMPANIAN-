export enum PersonaType {
  FRIEND = 'FRIEND',
  THERAPIST = 'THERAPIST',
  ADVISOR = 'ADVISOR'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface MoodEntry {
  id: string;
  value: number; // 1-10
  note: string;
  timestamp: number;
}

export interface PersonaConfig {
  id: PersonaType;
  name: string;
  description: string;
  systemInstruction: string;
  color: string;
  icon: string;
}

export interface UserState {
  currentPersona: PersonaType;
  hasCompletedOnboarding: boolean;
}