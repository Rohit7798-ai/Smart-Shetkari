import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Language } from '../types/marketPrice';

interface InlineAiSuggestionsProps {
  suggestions: string[];
  onSelectSuggestion: (prompt: string) => void;
  lang: Language;
  title?: string;
}

export const InlineAiSuggestions: React.FC<InlineAiSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  lang,
  title,
}) => {
  if (!suggestions || suggestions.length === 0) return null;

  const defaultTitle = lang === 'mr' ? 'AI मदतनीस त्वरित सूचना' : 'AI Assistant Suggestions';

  return (
    <div className="bg-[#F8F5EC] border border-[#E2E5DC] rounded-xl p-3 sm:p-3.5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 shrink-0 text-xs font-semibold text-[#244638]">
          <Sparkles className="w-4 h-4 text-[#2D7652] shrink-0" />
          <span>{title || defaultTitle}</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {suggestions.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectSuggestion(prompt)}
              className="group text-xs px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#244638] text-[#244638] hover:text-white border border-[#D5DCD0] shadow-xs hover:shadow transition-all flex items-center gap-1.5 text-left cursor-pointer active:scale-95"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 text-[#667168] group-hover:text-white transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
