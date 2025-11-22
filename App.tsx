import React, { useState, useEffect } from 'react';
import { Message, PersonaType, MoodEntry } from './types';
import { sendMessageToGemini } from './services/geminiService';
import { saveMoodEntry, getMoodHistory, getChatHistory, saveChatHistory, getLastPersona, saveLastPersona, clearData } from './services/storageService';
import { PersonaSelector } from './components/PersonaSelector';
import { ChatInterface } from './components/ChatInterface';
import { MoodChart } from './components/MoodChart';
import { 
  Sparkles, 
  Activity, 
  Menu, 
  X, 
  Plus, 
  LayoutDashboard, 
  Trash2, 
  PanelLeftOpen, 
  PanelLeftClose 
} from 'lucide-react';

const App: React.FC = () => {
  const [currentPersona, setCurrentPersona] = useState<PersonaType>(PersonaType.FRIEND);
  const [messages, setMessages] = useState<Message[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Desktop default
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [manualMood, setManualMood] = useState<string>('5');

  // Initialize state
  useEffect(() => {
    setMoodHistory(getMoodHistory());
    setMessages(getChatHistory());
    setCurrentPersona(getLastPersona());

    // Auto-collapse sidebar on mobile
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, []);

  const handlePersonaChange = (persona: PersonaType) => {
    setCurrentPersona(persona);
    saveLastPersona(persona);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    setIsLoading(true);

    const responseText = await sendMessageToGemini(text, currentPersona);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    const finalMessages = [...updatedMessages, aiMsg];
    setMessages(finalMessages);
    saveChatHistory(finalMessages);
    setIsLoading(false);
  };

  const handleLogMood = () => {
    const val = parseInt(manualMood);
    const entry: MoodEntry = {
      id: Date.now().toString(),
      value: val,
      note: "Manual Log",
      timestamp: Date.now()
    };
    const updated = saveMoodEntry(entry);
    setMoodHistory(updated);
  };

  const handleNewChat = () => {
    setMessages([]);
    saveChatHistory([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all history? This cannot be undone.")) {
      clearData();
      setMessages([]);
      setMoodHistory([]);
      location.reload();
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:relative z-30 h-full w-[280px] bg-[#f9f9f9] flex flex-col border-r border-gray-200 transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0 md:w-0 md:border-none'
        }`}
      >
        <div className="p-4 flex items-center justify-between md:justify-start gap-2 mb-4">
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <Sparkles className="text-indigo-600 fill-indigo-100" size={24} />
            <span>EmotiCompanion</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <div className="px-4 mb-4">
          <button 
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-full shadow-sm transition-all text-sm font-medium"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Personas
            </h3>
            <PersonaSelector 
              currentPersona={currentPersona} 
              onSelect={handlePersonaChange} 
            />
          </div>
          
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
              Tools
            </h3>
            <button 
              onClick={() => setShowMoodModal(true)}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-200/50 transition-colors"
            >
              <Activity size={18} />
              <span className="text-sm font-medium">Mood Tracker</span>
            </button>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleClearAllData}
            className="flex items-center gap-3 w-full px-2 py-2 text-gray-500 hover:text-red-600 text-xs transition-colors"
          >
            <Trash2 size={14} />
            <span>Clear all data</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 sticky top-0 z-10 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
            >
              {isSidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
            </button>
            <span className="font-semibold text-gray-700 opacity-0 md:opacity-100 transition-opacity">
              {/* Title or Current Persona can go here */}
            </span>
          </div>
          <div className="flex items-center gap-2">
             <button 
               onClick={() => setShowMoodModal(true)}
               className="md:hidden p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
             >
               <Activity size={20} />
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
           <ChatInterface 
              messages={messages} 
              currentPersona={currentPersona} 
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
        </div>

      </main>

      {/* Mood Analytics Modal */}
      {showMoodModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <LayoutDashboard size={18} className="text-indigo-600" />
                Emotional Analytics
              </h3>
              <button onClick={() => setShowMoodModal(false)} className="p-1 hover:bg-gray-200 rounded-full text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="md:col-span-3 bg-indigo-50/50 rounded-xl p-6 border border-indigo-100">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">How are you feeling right now?</h4>
                  <div className="flex items-center gap-4">
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={manualMood} 
                      onChange={(e) => setManualMood(e.target.value)}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <span className="text-2xl font-bold text-indigo-600 w-12 text-center">{manualMood}</span>
                    <button 
                      onClick={handleLogMood}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Log
                    </button>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 font-medium mt-2 px-1">
                     <span>Terrible</span>
                     <span>Neutral</span>
                     <span>Amazing</span>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                 <h4 className="text-sm font-semibold text-gray-700 mb-3">History Trend</h4>
                 <MoodChart data={moodHistory} />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default App;