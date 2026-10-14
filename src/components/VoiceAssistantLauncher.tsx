import React from 'react';
import { MessageSquare, Mic, Sparkles } from 'lucide-react';
import { Language, NavTab } from '../types/marketPrice';

interface VoiceAssistantLauncherProps {
  isOpen: boolean;
  onToggle: () => void;
  lang: Language;
  activeTab: NavTab;
}

export const VoiceAssistantLauncher: React.FC<VoiceAssistantLauncherProps> = ({
  isOpen,
  onToggle,
  lang,
  activeTab,
}) => {
  const getTabLabel = (tab: NavTab) => {
    switch (tab) {
      case 'prices':
        return lang === 'mr' ? 'बाजार भाव' : 'Prices';
      case 'compare':
        return lang === 'mr' ? 'बाजार तुलना' : 'Compare';
      case 'trends':
        return lang === 'mr' ? 'भाव कल' : 'Trends';
      case 'csv':
        return lang === 'mr' ? 'CSV आयात' : 'CSV Import';
      case 'sources':
        return lang === 'mr' ? 'डेटा स्रोत' : 'Sources';
      default:
        return '';
    }
  };

  return (
    <aside
      aria-label={lang === 'mr' ? 'शेतकरी AI मदतनीस' : 'Farmer AI Assistant Launcher'}
      className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2"
    >
      <button
        onClick={onToggle}
        className={`group flex items-center gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full shadow-lg hover:shadow-xl transition-all font-semibold text-xs sm:text-sm min-h-[44px] cursor-pointer ${
          isOpen
            ? 'bg-[#18352B] text-white ring-2 ring-[#2D7652]'
            : 'bg-[#244638] hover:bg-[#18352B] text-white'
        }`}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
      >
        <div className="relative flex items-center justify-center">
          <MessageSquare className="w-4 h-4 shrink-0" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="flex flex-col items-start text-left leading-tight">
          <span className="font-bold flex items-center gap-1">
            {lang === 'mr' ? 'AI मदतनीस' : 'AI Assistant'}
          </span>
          <span className="text-[10px] text-emerald-200 font-normal hidden sm:inline">
            {lang === 'mr' ? `संदर्भ: ${getTabLabel(activeTab)}` : `Context: ${getTabLabel(activeTab)}`}
          </span>
        </div>

        <div className="p-1 rounded-full bg-white/15 text-white ml-0.5 sm:ml-1">
          <Mic className="w-3.5 h-3.5" />
        </div>
      </button>
    </aside>
  );
};
