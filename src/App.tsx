/**
 * Smart Shetkari — Agricultural Market Price Information & Comparison Prototype
 * Enhanced with Gemini AI Voice Assistant for Marathi & English hands-free app control.
 */

import React, { useState, useEffect } from 'react';
import { FilterState, Language, MarketPriceRecord, NavTab } from './types/marketPrice';
import { AppAction } from './types/assistant';
import { storageService } from './services/storageService';
import { AppHeader } from './components/AppHeader';
import { DataStatusBanner } from './components/DataStatusBanner';
import { MarketPricesView } from './components/MarketPricesView';
import { CompareMarketsView } from './components/CompareMarketsView';
import { PriceTrendsView } from './components/PriceTrendsView';
import { DataSourcesView } from './components/DataSourcesView';
import { ResetConfirmModal } from './components/ResetConfirmModal';
import { PriceMeasureModal } from './components/PriceMeasureModal';
import { VoiceAssistantLauncher } from './components/VoiceAssistantLauncher';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { getTranslation } from './utils/translations';
import { mandiSyncService } from './services/mandiSyncService';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('prices');
  const [lang, setLang] = useState<Language>('mr'); // Default to Marathi or English
  const [records, setRecords] = useState<MarketPriceRecord[]>(() =>
    storageService.loadRecords()
  );
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() =>
    mandiSyncService.getLastSyncTimestamp()
  );
  const [syncToastMessage, setSyncToastMessage] = useState<string | null>(null);

  // Cross-view navigation state
  const [targetCrop, setTargetCrop] = useState<string>('Onion');
  const [targetMarket, setTargetMarket] = useState<string>('Lasalgaon APMC');
  const [compareMarkets, setCompareMarkets] = useState<string[]>([]);
  const [trendTimeRange, setTrendTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [dashboardFilters, setDashboardFilters] = useState<Partial<FilterState>>({
    searchQuery: '',
    selectedCrop: 'Onion',
    selectedDistrict: '',
    selectedMarket: '',
    selectedDivision: 'all',
    sortBy: 'price_desc',
  });

  // Modals state
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [isPriceHelpOpen, setIsPriceHelpOpen] = useState<boolean>(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isAddSourceOpen, setIsAddSourceOpen] = useState<boolean>(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);

  const handleTriggerAssistantPrompt = (prompt: string) => {
    setPendingPrompt(prompt);
    setIsAssistantOpen(true);
  };

  // Synchronize records on mount
  useEffect(() => {
    const loaded = storageService.loadRecords();
    setRecords(loaded);
  }, []);

  const handleSyncPrices = async () => {
    setIsSyncing(true);
    try {
      const res = await mandiSyncService.syncLivePrices(records);
      if (res.success) {
        setRecords(res.records);
        setLastSyncedAt(res.syncedAt);
        setSyncToastMessage(
          lang === 'mr'
            ? '✅ आजचे ताजे बाजार भाव यशस्वीरीत्या अपडेट झाले (अ‍ॅगमार्कनेट अधिकृत)!'
            : "✅ Today's live APMC rates updated successfully (Agmarknet Verified)!"
        );
        setTimeout(() => setSyncToastMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to sync live prices:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleToggleLang = () => {
    setLang(prev => (prev === 'en' ? 'mr' : 'en'));
  };

  const handleNavigateToTrend = (cropName: string, marketName: string) => {
    setTargetCrop(cropName);
    setTargetMarket(marketName);
    setActiveTab('trends');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToCompare = (cropName: string, marketName: string) => {
    setTargetCrop(cropName);
    setTargetMarket(marketName);
    setActiveTab('compare');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * Powerful handler executing actions received from the Gemini AI Voice Assistant!
   * Gives the voice bot control over ~90% of app features.
   */
  const handleExecuteAction = (action: AppAction) => {
    switch (action.type) {
      case 'switch_tab':
        if (action.tab) {
          setActiveTab(action.tab);
        }
        break;

      case 'filter_prices':
        setActiveTab('prices');
        setDashboardFilters(prev => ({
          ...prev,
          selectedCrop: action.crop !== undefined ? action.crop : (prev.selectedCrop || ''),
          selectedDistrict: action.district !== undefined ? action.district : (prev.selectedDistrict || ''),
          selectedMarket: action.market !== undefined ? action.market : (prev.selectedMarket || ''),
          selectedDivision: action.division !== undefined ? action.division : (prev.selectedDivision || 'all'),
          searchQuery: action.search !== undefined ? action.search : (prev.searchQuery || ''),
          sortBy: action.sortBy !== undefined ? action.sortBy : (prev.sortBy || 'price_desc'),
        }));
        break;

      case 'clear_filters':
        setActiveTab('prices');
        setDashboardFilters({
          selectedCrop: '',
          selectedDistrict: '',
          selectedMarket: '',
          selectedDivision: 'all',
          searchQuery: '',
          sortBy: 'price_desc',
        });
        break;

      case 'sort_prices':
        setActiveTab('prices');
        if (action.sortBy) {
          setDashboardFilters(prev => ({
            ...prev,
            sortBy: action.sortBy,
          }));
        }
        break;

      case 'compare_markets':
        setActiveTab('compare');
        if (action.crop) {
          setTargetCrop(action.crop);
        }
        if (action.markets && action.markets.length > 0) {
          setCompareMarkets(action.markets);
        }
        break;

      case 'view_trend':
        setActiveTab('trends');
        if (action.crop) setTargetCrop(action.crop);
        if (action.market) setTargetMarket(action.market);
        if (action.timeRange) setTrendTimeRange(action.timeRange);
        break;

      case 'set_time_range':
        if (action.timeRange) {
          setTrendTimeRange(action.timeRange);
          setActiveTab('trends');
        }
        break;

      case 'open_add_source':
        setActiveTab('sources');
        setIsAddSourceOpen(true);
        break;

      case 'toggle_language':
        if (action.lang) {
          setLang(action.lang);
        } else {
          handleToggleLang();
        }
        break;

      case 'open_price_help':
        setIsPriceHelpOpen(true);
        break;

      case 'trigger_sample_reset':
        setIsResetModalOpen(true);
        break;

      case 'sync_live_prices':
        handleSyncPrices();
        break;

      case 'guide_step':
        if (action.step === 1) setActiveTab('prices');
        else if (action.step === 2) setActiveTab('compare');
        else if (action.step === 3) setActiveTab('trends');
        else if (action.step === 4) setActiveTab('sources');
        break;

      default:
        console.log('Unhandled assistant action:', action);
    }
  };

  const handleResetConfirmed = () => {
    const defaultData = storageService.resetToOfficialData();
    setRecords(defaultData);
    setTargetCrop('Onion');
    setTargetMarket('Lasalgaon APMC');
    setDashboardFilters({});
  };

  return (
    <div className="min-h-screen bg-[#F8F5EC] text-[#202821] flex flex-col font-sans selection:bg-[#244638] selection:text-white pb-20 relative">
      {/* Live Sync Toast Notification */}
      {syncToastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#244638] text-white px-4 py-2.5 rounded-xl shadow-lg border border-emerald-600/40 text-xs sm:text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
          <span>{syncToastMessage}</span>
        </div>
      )}

      {/* 1. Top Header (3-zone contract with Voice AI button & Live Sync) */}
      <AppHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        lang={lang}
        onToggleLang={handleToggleLang}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenPriceHelp={() => setIsPriceHelpOpen(true)}
        onOpenAssistant={() => setIsAssistantOpen(true)}
        isSyncing={isSyncing}
        onSyncPrices={handleSyncPrices}
      />

      {/* 2. Persistent Live Mandi Data & Freshness Banner */}
      <DataStatusBanner
        records={records}
        lang={lang}
        isSyncing={isSyncing}
        onSyncPrices={handleSyncPrices}
        lastSyncedAt={lastSyncedAt}
      />

      {/* 3. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 md:py-8">
        {activeTab === 'prices' && (
          <MarketPricesView
            records={records}
            lang={lang}
            externalFilters={dashboardFilters}
            onNavigateToTrend={handleNavigateToTrend}
            onNavigateToCompare={handleNavigateToCompare}
            onTriggerAssistantPrompt={handleTriggerAssistantPrompt}
          />
        )}

        {activeTab === 'compare' && (
          <CompareMarketsView
            records={records}
            lang={lang}
            initialCrop={targetCrop}
            initialMarket={targetMarket}
            initialMarkets={compareMarkets}
            onNavigateToTrend={handleNavigateToTrend}
            onTriggerAssistantPrompt={handleTriggerAssistantPrompt}
          />
        )}

        {activeTab === 'trends' && (
          <PriceTrendsView
            records={records}
            lang={lang}
            initialCrop={targetCrop}
            initialMarket={targetMarket}
            initialTimeRange={trendTimeRange}
            onTriggerAssistantPrompt={handleTriggerAssistantPrompt}
          />
        )}

        {activeTab === 'sources' && (
          <DataSourcesView
            records={records}
            lang={lang}
            externalOpenAddModal={isAddSourceOpen}
            onCloseAddModal={() => setIsAddSourceOpen(false)}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="bg-white border-t border-[#E2E5DC] py-6 px-4 sm:px-6 text-xs text-[#667168]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-semibold text-[#244638]">
              {getTranslation(lang, 'appName')}
            </span>{' '}
            — {getTranslation(lang, 'appSubtitle')}
          </div>
          <div className="text-[11px] text-[#667168]">
            {lang === 'mr'
              ? 'स्थानिक ब्राउझर सँडबॉक्स · व्हॉइस असिस्टंट द्वारे चालणारे ॲप'
              : 'Local browser sandbox · Voice assistant powered agricultural guide'}
          </div>
        </div>
      </footer>

      {/* 5. Modals */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirm={handleResetConfirmed}
        lang={lang}
      />

      <PriceMeasureModal
        isOpen={isPriceHelpOpen}
        onClose={() => setIsPriceHelpOpen(false)}
        lang={lang}
      />

      {/* 6. Context-Aware Gemini Voice Assistant Floating Launcher & SaaS Side Panel */}
      <VoiceAssistantLauncher
        isOpen={isAssistantOpen}
        onToggle={() => setIsAssistantOpen(!isAssistantOpen)}
        lang={lang}
        activeTab={activeTab}
      />

      <VoiceAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        lang={lang}
        activeTab={activeTab}
        records={records}
        onExecuteAction={handleExecuteAction}
        currentCrop={targetCrop}
        currentMarket={targetMarket}
        compareMarkets={compareMarkets}
        trendTimeRange={trendTimeRange}
        pendingPrompt={pendingPrompt}
        onClearPendingPrompt={() => setPendingPrompt(null)}
      />
    </div>
  );
}
