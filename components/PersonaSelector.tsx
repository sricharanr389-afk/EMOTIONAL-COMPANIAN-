import React from 'react';
import { PersonaType } from '../types';
import { PERSONAS } from '../constants';
import { Coffee, Heart, Briefcase, LucideIcon, CheckCircle2 } from 'lucide-react';

interface PersonaSelectorProps {
  currentPersona: PersonaType;
  onSelect: (persona: PersonaType) => void;
}

const IconMap: Record<string, LucideIcon> = {
  'Coffee': Coffee,
  'Heart': Heart,
  'Briefcase': Briefcase
};

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ currentPersona, onSelect }) => {
  return (
    <div className="flex flex-col space-y-2">
      {Object.values(PERSONAS).map((persona) => {
        const Icon = IconMap[persona.icon];
        const isSelected = currentPersona === persona.id;
        
        return (
          <button
            key={persona.id}
            onClick={() => onSelect(persona.id)}
            className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-200 w-full text-left ${
              isSelected 
                ? 'bg-gray-200/50 text-gray-900' 
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <div className={`flex-shrink-0 p-2 rounded-md ${isSelected ? 'bg-white shadow-sm' : 'bg-gray-100 group-hover:bg-white'}`}>
              <Icon size={18} className={isSelected ? `text-${persona.color.split('-')[1]}-500` : 'text-gray-500'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm truncate">{persona.name}</span>
                {isSelected && <CheckCircle2 size={14} className="text-gray-400" />}
              </div>
              <p className="text-xs text-gray-400 truncate">{persona.id.toLowerCase()}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
};