import React, { useState, useRef, useEffect } from 'react';
import { Message, PersonaType } from '../types';
import { Send, Mic, MicOff, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { PERSONAS } from '../constants';

interface ChatInterfaceProps {
  messages: Message[];
  currentPersona: PersonaType;
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  currentPersona, 
  onSendMessage, 
  isLoading 
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const activePersona = PERSONAS[currentPersona];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(prev => prev + (prev ? ' ' : '') + transcript);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col h-full w-full bg-white relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide w-full">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-8">
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center min-h-[60vh] animate-in fade-in duration-500">
              <div className={`p-6 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 mb-6 shadow-sm`}>
                <Sparkles size={32} className={`text-${activePersona.color.split('-')[1]}-500`} />
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                Hello, I'm {activePersona.name}
              </h2>
              <p className="text-gray-500 max-w-md">
                {activePersona.description}
              </p>
            </div>
          )}
          
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-4 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${activePersona.color}`}>
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                
                <div 
                  className={`max-w-[85%] leading-7 prose ${
                    isUser 
                      ? 'bg-[#f3f4f6] text-gray-800 px-5 py-3 rounded-3xl rounded-tr-sm' 
                      : 'text-gray-800 pt-1 pl-1'
                  }`}
                >
                  {msg.text}
                </div>

                {isUser && (
                   <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 mt-1">
                     <User size={16} className="text-white" />
                   </div>
                )}
              </div>
            );
          })}
          
          {isLoading && (
            <div className="flex gap-4">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activePersona.color}`}>
                  <Bot size={16} className="text-white" />
               </div>
               <div className="flex items-center gap-2 pt-2 pl-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
               </div>
            </div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* Input Area - Sticky Bottom */}
      <div className="p-4 bg-white">
        <div className="max-w-3xl mx-auto relative">
          <div className="relative flex items-end gap-2 bg-[#f0f4f9] p-2 rounded-[32px] border border-transparent focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-md transition-all duration-200">
            
            <button
              onClick={toggleListening}
              className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            <textarea
              ref={inputRef as any}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={`Ask ${activePersona.name} anything...`}
              rows={1}
              className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 px-2 max-h-32 text-gray-800 placeholder-gray-500 overflow-y-auto scrollbar-hide"
              disabled={isLoading}
              style={{ minHeight: '48px' }}
            />
            
            <button
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className={`p-3 rounded-full flex-shrink-0 transition-all duration-200 ${
                !inputText.trim() || isLoading 
                  ? 'text-gray-400' 
                  : 'bg-gray-900 text-white shadow-sm hover:bg-black'
              }`}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            EmotiCompanion can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
};