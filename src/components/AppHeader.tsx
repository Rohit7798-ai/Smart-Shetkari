import React from 'react';
import { Language, NavTab } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { Globe, RotateCcw, HelpCircle, Sprout, RefreshCw, Mic, Sparkles } from 'lucide-react';

interface AppHeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  lang: Language;
  onToggleLang: () => void;
  onOpenResetModal: () => void;
  onOpenPriceHelp: () => void;
  onOpenAssistant: () => void;
  isSyncing?: boolean;
  onSyncPrices?: () => void;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onSelectTab,
  lang,
  onToggleLang,
  onOpenResetModal,
  onOpenPriceHelp,
  onOpenAssistant,
  isSyncing = false,
  onSyncPrices,
}) => {
  return (
    <header className="bg-white border-b border-[#E2E5DC] sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-6">
          
          {/* Zone 1: Brand Logo & Title */}
          <button
            type="button"
            onClick={() => onSelectTab('prices')}
            className="flex items-center gap-2.5 shrink-0 text-left cursor-pointer group"
            title={getTranslation(lang, 'navMarketPrices')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#244638] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:bg-[#18352B] transition-colors">
              <Sprout className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-base sm:text-lg md:text-xl font-bold tracking-tight text-[#1F3D2F] leading-tight">
                {getTranslation(lang, 'appName')}
              </span>
              <span className="text-[11px] text-[#667168] hidden sm:block leading-none mt-0.5">
                {lang === 'mr' ? 'कृषी बाजार भाव व तुलना प्रणाली' : 'Agricultural Mandi Price System'}
              </span>
            </div>
          </button>

          {/* Zone 2: Desktop Navigation Bar (Centered & Clean) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#F8F5EC] p-1 rounded-xl border border-[#E2E5DC]">
            <button
              onClick={() => onSelectTab('prices')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'prices'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'text-[#202821] hover:text-[#244638] hover:bg-white/60'
              }`}
            >
              {getTranslation(lang, 'navMarketPrices')}
            </button>
            <button
              onClick={() => onSelectTab('compare')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'compare'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'text-[#202821] hover:text-[#244638] hover:bg-white/60'
              }`}
            >
              {getTranslation(lang, 'navCompareMarkets')}
            </button>
            <button
              onClick={() => onSelectTab('trends')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'trends'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'text-[#202821] hover:text-[#244638] hover:bg-white/60'
              }`}
            >
              {getTranslation(lang, 'navPriceTrends')}
            </button>
            <button
              onClick={() => onSelectTab('sources')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'sources'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'text-[#202821] hover:text-[#244638] hover:bg-white/60'
              }`}
            >
              {getTranslation(lang, 'navDataSources')}
            </button>
          </nav>

          {/* Zone 3: Actions (Compact, Harmonious & Uncluttered) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Sync Action */}
            {onSyncPrices && (
              <button
                onClick={onSyncPrices}
                disabled={isSyncing}
                className="px-2.5 sm:px-3 py-2 text-xs font-semibold bg-[#244638] hover:bg-[#18352B] disabled:opacity-60 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                title={getTranslation(lang, 'btnSyncNow')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? (lang === 'mr' ? 'सिंक...' : 'Syncing...') : (lang === 'mr' ? 'ताजे भाव' : 'Sync')}
                </span>
              </button>
            )}

            {/* Featured Voice AI Button */}
            <button
              onClick={onOpenAssistant}
              className="px-2.5 sm:px-3 py-2 text-xs font-bold text-[#1F4E39] bg-emerald-50 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              title={lang === 'mr' ? 'व्हॉइस मदतनीस (बोलून ९०%+ ॲप चालवा)' : 'Voice Assistant (Speak to control app)'}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span>{lang === 'mr' ? 'व्हॉइस AI' : 'Voice AI'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline" />
            </button>

            {/* Price Help Guide (Icon Tooltip) */}
            <button
              onClick={onOpenPriceHelp}
              className="p-2 text-slate-600 hover:text-[#244638] hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              title={getTranslation(lang, 'priceHelp')}
              aria-label={getTranslation(lang, 'priceHelp')}
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Reset Official Data (Icon Tooltip) */}
            <button
              onClick={onOpenResetModal}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer hidden md:flex"
              title={getTranslation(lang, 'resetSample')}
              aria-label={getTranslation(lang, 'resetSample')}
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Language Toggle Badge */}
            <button
              onClick={onToggleLang}
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
              title={lang === 'en' ? 'मराठीत बदला' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>{lang === 'en' ? 'मराठी' : 'EN'}</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation Bar (Clean row below brand on screens < lg) */}
        <div className="lg:hidden flex items-center gap-1 pb-2 pt-1 overflow-x-auto no-scrollbar border-t border-[#E2E5DC] -mx-3 px-3">
          <button
            onClick={() => onSelectTab('prices')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'prices'
                ? 'bg-[#244638] text-white'
                : 'text-slate-700 bg-[#F8F5EC] hover:bg-slate-200'
            }`}
          >
            {getTranslation(lang, 'navMarketPrices')}
          </button>
          <button
            onClick={() => onSelectTab('compare')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'compare'
                ? 'bg-[#244638] text-white'
                : 'text-slate-700 bg-[#F8F5EC] hover:bg-slate-200'
            }`}
          >
            {getTranslation(lang, 'navCompareMarkets')}
          </button>
          <button
            onClick={() => onSelectTab('trends')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'trends'
                ? 'bg-[#244638] text-white'
                : 'text-slate-700 bg-[#F8F5EC] hover:bg-slate-200'
            }`}
          >
            {getTranslation(lang, 'navPriceTrends')}
          </button>
          <button
            onClick={() => onSelectTab('sources')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors shrink-0 ${
              activeTab === 'sources'
                ? 'bg-[#244638] text-white'
                : 'text-slate-700 bg-[#F8F5EC] hover:bg-slate-200'
            }`}
          >
            {getTranslation(lang, 'navDataSources')}
          </button>
        </div>

      </div>
    </header>
  );
};
