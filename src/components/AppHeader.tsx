import React from 'react';
import { Language } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { Globe, RotateCcw, HelpCircle, Sprout, MessageSquare } from 'lucide-react';

export type NavTab = 'prices' | 'compare' | 'trends' | 'sources' | 'csv';

interface AppHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenResetModal: () => void;
  onOpenPriceHelp: () => void;
  onOpenAssistant: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  onOpenResetModal,
  onOpenPriceHelp,
  onOpenAssistant,
}) => {
  return (
    <header className="bg-white border-b border-[#E2E5DC] sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-1.5 sm:gap-4 md:gap-8">
          {/* Zone 1: Brand wordmark (single line, responsive sizing) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1 sm:flex-initial">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[#244638] text-white flex items-center justify-center shrink-0">
              <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-[#F8F5EC]" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-sm sm:text-lg md:text-xl font-bold tracking-tight text-[#244638] truncate block">
                {getTranslation(lang, 'appName')}
              </span>
              <span className="text-[11px] text-[#667168] hidden sm:inline whitespace-nowrap">
                {getTranslation(lang, 'appSubtitle')}
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onSelectTab('prices')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                activeTab === 'prices'
                  ? 'bg-[#244638] text-white'
                  : 'text-[#202821] hover:bg-[#F8F5EC]'
              }`}
            >
              {getTranslation(lang, 'navMarketPrices')}
            </button>
            <button
              onClick={() => onSelectTab('compare')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                activeTab === 'compare'
                  ? 'bg-[#244638] text-white'
                  : 'text-[#202821] hover:bg-[#F8F5EC]'
              }`}
            >
              {getTranslation(lang, 'navCompareMarkets')}
            </button>
            <button
              onClick={() => onSelectTab('trends')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                activeTab === 'trends'
                  ? 'bg-[#244638] text-white'
                  : 'text-[#202821] hover:bg-[#F8F5EC]'
              }`}
            >
              {getTranslation(lang, 'navPriceTrends')}
            </button>
            <button
              onClick={() => onSelectTab('sources')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                activeTab === 'sources'
                  ? 'bg-[#244638] text-white'
                  : 'text-[#202821] hover:bg-[#F8F5EC]'
              }`}
            >
              {getTranslation(lang, 'navDataSources')}
            </button>
            <button
              onClick={() => onSelectTab('csv')}
              className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap min-h-[44px] ${
                activeTab === 'csv'
                  ? 'bg-[#244638] text-white'
                  : 'text-[#202821] hover:bg-[#F8F5EC]'
              }`}
            >
              {getTranslation(lang, 'navCsvImport')}
            </button>
          </nav>

          {/* Zone 3: Actions (Responsive, no wrap collision) */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={onOpenAssistant}
              className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-[#244638] bg-[#F8F5EC] border border-[#E2E5DC] rounded-lg hover:bg-white transition-colors flex items-center gap-1 min-h-[38px] sm:min-h-[44px]"
              title={lang === 'mr' ? 'मदतनीस' : 'Chatbot'}
            >
              <MessageSquare className="w-4 h-4 text-[#244638] shrink-0" />
              <span className="hidden sm:inline">
                {lang === 'mr' ? 'मदतनीस' : 'Chatbot'}
              </span>
            </button>

            <button
              onClick={onOpenPriceHelp}
              className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-[#244638] bg-[#F8F5EC] border border-[#E2E5DC] rounded-lg hover:bg-white transition-colors flex items-center gap-1 min-h-[38px] sm:min-h-[44px]"
              title={getTranslation(lang, 'priceHelp')}
            >
              <HelpCircle className="w-4 h-4 shrink-0 text-[#244638]" />
              <span className="hidden sm:inline">{getTranslation(lang, 'priceHelp')}</span>
            </button>

            <button
              onClick={onOpenResetModal}
              className="hidden md:flex p-2 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 border border-[#E2E5DC] rounded-lg hover:bg-[#F8F5EC] transition-colors items-center gap-1.5 min-h-[44px]"
              title={getTranslation(lang, 'resetSample')}
            >
              <RotateCcw className="w-4 h-4 shrink-0" />
              <span>{getTranslation(lang, 'resetSample')}</span>
            </button>

            <button
              onClick={onToggleLang}
              className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-[#244638] text-white rounded-lg hover:bg-[#18352B] transition-colors flex items-center gap-1 min-h-[38px] sm:min-h-[44px] shrink-0"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>{lang === 'en' ? 'मराठी' : 'English'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar (Edge-to-edge smooth scroll, no clipping) */}
        <div className="lg:hidden flex items-center gap-1.5 pt-2 pb-0.5 overflow-x-auto scrollbar-none border-t border-[#E2E5DC] mt-2 -mx-3 px-3">
          <button
            onClick={() => onSelectTab('prices')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'prices'
                ? 'bg-[#244638] text-white'
                : 'text-[#202821] bg-[#F8F5EC]'
            }`}
          >
            {getTranslation(lang, 'navMarketPrices')}
          </button>
          <button
            onClick={() => onSelectTab('compare')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'compare'
                ? 'bg-[#244638] text-white'
                : 'text-[#202821] bg-[#F8F5EC]'
            }`}
          >
            {getTranslation(lang, 'navCompareMarkets')}
          </button>
          <button
            onClick={() => onSelectTab('trends')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'trends'
                ? 'bg-[#244638] text-white'
                : 'text-[#202821] bg-[#F8F5EC]'
            }`}
          >
            {getTranslation(lang, 'navPriceTrends')}
          </button>
          <button
            onClick={() => onSelectTab('sources')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'sources'
                ? 'bg-[#244638] text-white'
                : 'text-[#202821] bg-[#F8F5EC]'
            }`}
          >
            {getTranslation(lang, 'navDataSources')}
          </button>
          <button
            onClick={() => onSelectTab('csv')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 min-h-[40px] ${
              activeTab === 'csv'
                ? 'bg-[#244638] text-white'
                : 'text-[#202821] bg-[#F8F5EC]'
            }`}
          >
            {getTranslation(lang, 'navCsvImport')}
          </button>
        </div>
      </div>
    </header>
  );
};
