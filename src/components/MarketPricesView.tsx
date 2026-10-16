import React, { useState, useMemo } from 'react';
import { FilterState, Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { storageService } from '../services/storageService';
import {
  Search,
  Filter,
  X,
  TrendingUp,
  Clock,
  ArrowUpDown,
  Building2,
  Calendar,
  AlertTriangle,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { InlineAiSuggestions } from './InlineAiSuggestions';
import { getCropMarathiShort } from '../utils/cropNames';
import {
  getDistrictDisplayName,
  getDistrictMarathi,
  getDistrictDivision,
  DIVISIONS,
} from '../utils/districtNames';

interface MarketPricesViewProps {
  records: MarketPriceRecord[];
  lang: Language;
  externalFilters?: Partial<FilterState>;
  onNavigateToTrend: (cropName: string, marketName: string) => void;
  onNavigateToCompare: (cropName: string, marketName: string) => void;
  onTriggerAssistantPrompt?: (prompt: string) => void;
}

export const MarketPricesView: React.FC<MarketPricesViewProps> = ({
  records,
  lang,
  externalFilters,
  onNavigateToTrend,
  onNavigateToCompare,
  onTriggerAssistantPrompt,
}) => {
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedCrop: 'Onion', // Pre-select Onion as default
    selectedState: '',
    selectedDistrict: '',
    selectedMarket: '',
    sortBy: 'price_desc',
  });

  const [selectedDivision, setSelectedDivision] = useState<string>('all');

  React.useEffect(() => {
    if (externalFilters) {
      setFilters(prev => ({
        ...prev,
        ...Object.fromEntries(
          Object.entries(externalFilters).filter(([_, v]) => v !== undefined)
        ),
        searchQuery:
          externalFilters.searchQuery !== undefined
            ? externalFilters.searchQuery
            : prev.searchQuery || '',
      }));
      if (externalFilters.selectedDivision !== undefined) {
        setSelectedDivision(externalFilters.selectedDivision || 'all');
      }
    }
  }, [externalFilters]);

  const uniqueCrops = useMemo(() => storageService.getUniqueCrops(records), [records]);

  const uniqueDistricts = useMemo(() => {
    let list = storageService.getUniqueDistricts(records, filters.selectedCrop || undefined);
    if (selectedDivision !== 'all') {
      list = list.filter(d => getDistrictDivision(d)?.en === selectedDivision);
    }
    return list;
  }, [records, filters.selectedCrop, selectedDivision]);

  const uniqueMarkets = useMemo(
    () =>
      storageService.getUniqueMarkets(
        records,
        filters.selectedCrop || undefined,
        filters.selectedDistrict || undefined
      ),
    [records, filters.selectedCrop, filters.selectedDistrict]
  );

  // Filtered and sorted records
  const filteredRecords = useMemo(() => {
    return records
      .filter(record => {
        // Exclude any dummy / demo records
        if (record.dataStatus === 'demo' || record.recordId.toLowerCase().includes('dummy')) {
          return false;
        }

        // Crop match
        if (filters.selectedCrop && record.cropName !== filters.selectedCrop) {
          return false;
        }

        // Division match
        if (selectedDivision !== 'all') {
          const div = getDistrictDivision(record.district);
          if (div?.en !== selectedDivision) {
            return false;
          }
        }

        // Search query (matches crop name or market name or district in EN or MR)
        const searchQuery = (filters.searchQuery || '').trim();
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesCrop =
            (record.cropName && record.cropName.toLowerCase().includes(q)) ||
            (record.cropNameMr && record.cropNameMr.toLowerCase().includes(q));
          const matchesMarket =
            (record.marketName && record.marketName.toLowerCase().includes(q)) ||
            (record.marketNameMr && record.marketNameMr.toLowerCase().includes(q));
          const matchesDistrict = Boolean(record.district && record.district.toLowerCase().includes(q));
          const distMr = getDistrictMarathi(record.district);
          const matchesDistrictMr = Boolean(distMr && distMr.toLowerCase().includes(q));
          if (!matchesCrop && !matchesMarket && !matchesDistrict && !matchesDistrictMr) {
            return false;
          }
        }

        // District filter
        if (filters.selectedDistrict && record.district !== filters.selectedDistrict) {
          return false;
        }

        // Market filter
        if (filters.selectedMarket && record.marketName !== filters.selectedMarket) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_desc') {
          return b.modalPrice - a.modalPrice;
        }
        if (filters.sortBy === 'price_asc') {
          return a.modalPrice - b.modalPrice;
        }
        if (filters.sortBy === 'date_desc') {
          return b.observationDate.localeCompare(a.observationDate);
        }
        if (filters.sortBy === 'market_asc') {
          return a.marketName.localeCompare(b.marketName);
        }
        return 0;
      });
  }, [records, filters, selectedDivision]);

  // Deduplicate to show the latest observation per market for the dashboard view
  const latestMarketRecords = useMemo(() => {
    const marketMap = new Map<string, MarketPriceRecord>();
    filteredRecords.forEach(rec => {
      const existing = marketMap.get(rec.marketName);
      if (!existing || rec.observationDate > existing.observationDate) {
        marketMap.set(rec.marketName, rec);
      }
    });
    return Array.from(marketMap.values()).sort((a, b) => {
      if (filters.sortBy === 'price_desc') return b.modalPrice - a.modalPrice;
      if (filters.sortBy === 'price_asc') return a.modalPrice - b.modalPrice;
      if (filters.sortBy === 'date_desc') return b.observationDate.localeCompare(a.observationDate);
      return a.marketName.localeCompare(b.marketName);
    });
  }, [filteredRecords, filters.sortBy]);

  const latestObsDate = useMemo(
    () => storageService.getLatestDate(latestMarketRecords),
    [latestMarketRecords]
  );

  const resetFilters = () => {
    setSelectedDivision('all');
    setFilters({
      searchQuery: '',
      selectedCrop: '',
      selectedState: '',
      selectedDistrict: '',
      selectedMarket: '',
      sortBy: 'price_desc',
    });
  };

  const hasActiveFilters = Boolean(
    filters.searchQuery ||
    filters.selectedCrop ||
    filters.selectedDistrict ||
    filters.selectedMarket ||
    selectedDivision !== 'all'
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Crop Quick Selectors */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
              {lang === 'mr' ? 'कृषी बाजार भाव' : 'Agricultural Market Prices'}
            </h1>
            <p className="text-sm text-[#667168] mt-0.5">
              {lang === 'mr'
                ? 'निवडलेल्या पिकाचे विविध बाजार समित्यांमधील नोंदवलेले भाव'
                : 'Browse reported market prices for commodities across regional APMCs.'}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.searchQuery || ''}
              onChange={e => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder={getTranslation(lang, 'searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2.5 text-sm bg-[#F8F5EC] border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] focus:bg-white transition-colors"
            />
            {Boolean(filters.searchQuery) && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Crop Selector Buttons */}
        <div>
          <label className="block text-xs font-semibold text-[#667168] uppercase tracking-wider mb-2">
            {lang === 'mr' ? 'प्रमुख पिके निवडा' : 'Select Crop'}
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
            <button
              onClick={() => setFilters(prev => ({ ...prev, selectedCrop: '' }))}
              className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors min-h-[42px] sm:min-h-[44px] ${
                !filters.selectedCrop
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200'
              }`}
            >
              {getTranslation(lang, 'allCrops')}
            </button>
            {uniqueCrops.map(crop => {
              const isSelected = filters.selectedCrop === crop;
              return (
                <button
                  key={crop}
                  onClick={() => setFilters(prev => ({ ...prev, selectedCrop: crop }))}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors min-h-[42px] sm:min-h-[44px] flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#244638] text-white shadow-xs'
                      : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200'
                  }`}
                >
                  <span>{crop}</span>
                  {lang === 'mr' && getCropMarathiShort(crop) && (
                    <span className="opacity-80">
                      ({getCropMarathiShort(crop)})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Region / Division Quick Selector */}
        <div className="pt-2 border-t border-[#E2E5DC]">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#667168] uppercase tracking-wider">
              {lang === 'mr' ? 'विभाग निवडा (Region)' : 'Select Region / Division'}
            </label>
            <span className="text-xs text-[#667168]">
              {uniqueDistricts.length} {lang === 'mr' ? 'जिल्हे' : 'districts'} · {uniqueMarkets.length} {lang === 'mr' ? 'बाजारपेठा' : 'markets'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
            {DIVISIONS.map(div => {
              const isSelected = selectedDivision === div.id;
              return (
                <button
                  key={div.id}
                  onClick={() => {
                    setSelectedDivision(div.id);
                    setFilters(prev => ({
                      ...prev,
                      selectedDistrict: '',
                      selectedMarket: '',
                    }));
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors min-h-[36px] ${
                    isSelected
                      ? 'bg-[#244638] text-white shadow-xs'
                      : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200 border border-[#E2E5DC]'
                  }`}
                >
                  {lang === 'mr' ? div.mr : div.en}
                </button>
              );
            })}
          </div>
        </div>

        {/* Cascading Location Filters & Sort */}
        <div className="pt-2 border-t border-[#E2E5DC] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* District filter */}
          <div>
            <label className="block text-xs font-medium text-[#667168] mb-1">
              {getTranslation(lang, 'districtLabel')}
            </label>
            <select
              value={filters.selectedDistrict}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  selectedDistrict: e.target.value,
                  selectedMarket: '',
                }))
              }
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] min-h-[42px] sm:min-h-[44px]"
            >
              <option value="">{getTranslation(lang, 'allDistricts')}</option>
              {uniqueDistricts.map(dist => (
                <option key={dist} value={dist}>
                  {getDistrictDisplayName(dist, lang)}
                </option>
              ))}
            </select>
          </div>

          {/* Market filter */}
          <div>
            <label className="block text-xs font-medium text-[#667168] mb-1">
              {getTranslation(lang, 'marketLabel')}
            </label>
            <select
              value={filters.selectedMarket}
              onChange={e => setFilters(prev => ({ ...prev, selectedMarket: e.target.value }))}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] min-h-[42px] sm:min-h-[44px]"
            >
              <option value="">{getTranslation(lang, 'allMarkets')}</option>
              {uniqueMarkets.map(mkt => {
                const rec = records.find(r => r.marketName === mkt);
                const label = lang === 'mr' && rec?.marketNameMr ? `${rec.marketNameMr} (${mkt})` : mkt;
                return (
                  <option key={mkt} value={mkt}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs font-medium text-[#667168] mb-1">
              {getTranslation(lang, 'sortByLabel')}
            </label>
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={e =>
                  setFilters(prev => ({ ...prev, sortBy: e.target.value as FilterState['sortBy'] }))
                }
                className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] min-h-[42px] sm:min-h-[44px]"
              >
                <option value="price_desc">{getTranslation(lang, 'sortPriceHigh')}</option>
                <option value="price_asc">{getTranslation(lang, 'sortPriceLow')}</option>
                <option value="date_desc">{getTranslation(lang, 'sortDateRecent')}</option>
                <option value="market_asc">{getTranslation(lang, 'sortMarketAlpha')}</option>
              </select>
            </div>
          </div>

          {/* Reset Filters */}
          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={resetFilters}
                className="w-full px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-[#F8F5EC] hover:bg-slate-200 border border-[#E2E5DC] rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[42px] sm:min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5 shrink-0" />
                <span>{getTranslation(lang, 'clearFilters')}</span>
              </button>
            ) : (
              <div className="hidden lg:block min-h-[44px]" />
            )}
          </div>
        </div>
      </div>

      {/* 2. Inline Contextual AI Assistant Suggestions */}
      {onTriggerAssistantPrompt && (
        <InlineAiSuggestions
          lang={lang}
          title={lang === 'mr' ? 'AI मदतनीस थेट प्रश्न' : 'Quick AI Market Queries'}
          suggestions={
            lang === 'mr'
              ? [
                  'आजचे ताजे भाव सिंक करा',
                  filters.selectedCrop
                    ? `${filters.selectedCrop} चे आजचे कमाल भाव दाखवा`
                    : 'आजचे कमाल भाव दाखवा',
                  'लासलगाव कांदा भाव काय आहे?',
                  'सर्वोत्तम भाव देणारा बाजार शोधा',
                ]
              : [
                  "Sync today's fresh live rates",
                  filters.selectedCrop
                    ? `Show highest price for ${filters.selectedCrop}`
                    : 'Show highest price today',
                  'What is Lasalgaon onion price?',
                  'Find highest paying market',
                ]
          }
          onSelectSuggestion={onTriggerAssistantPrompt}
        />
      )}

      {/* 3. Results Summary Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-2 px-1 text-xs sm:text-sm text-[#667168]">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span>
            {lang === 'mr' ? 'आढळलेले बाजार: ' : 'Markets found: '}
            <strong className="text-[#202821] font-mono tabular-nums">
              {latestMarketRecords.length}
            </strong>
          </span>
          {filters.selectedCrop && (
            <span className="text-slate-500">
              · {lang === 'mr' ? 'पीक: ' : 'Crop: '}
              <strong className="text-[#244638]">
                {filters.selectedCrop}
                {lang === 'mr' && (filters.selectedCrop === 'Onion' ? ' (कांदा)' : '')}
              </strong>
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Calendar className="w-4 h-4 text-[#244638] shrink-0" />
          <span>
            {getTranslation(lang, 'summaryLatestDate')}:{' '}
            <strong className="text-[#202821] font-mono tabular-nums">{latestObsDate}</strong>
          </span>
        </div>
      </div>

      {/* 3. Empty State */}
      {latestMarketRecords.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-[#E2E5DC] space-y-4">
          <div className="w-12 h-12 rounded-full bg-[#F8F5EC] text-[#244638] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-[#202821]">
              {getTranslation(lang, 'noRecordsFound')}
            </h3>
            <p className="text-xs sm:text-sm text-[#667168]">
              {getTranslation(lang, 'tryClearing')}
            </p>
          </div>
          <button
            onClick={resetFilters}
            className="px-5 py-2.5 min-h-[44px] bg-[#244638] text-white text-sm font-medium rounded-lg hover:bg-[#18352B] transition-colors"
          >
            {getTranslation(lang, 'clearFilters')}
          </button>
        </div>
      ) : (
        <>
          {/* 4. Desktop High-Density Table */}
          <div className="hidden md:block bg-white rounded-xl border border-[#E2E5DC] overflow-hidden shadow-xs">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#F8F5EC] border-b border-[#E2E5DC] text-xs font-semibold text-[#244638]">
                  <th className="py-3 px-4">{getTranslation(lang, 'colMarket')}</th>
                  <th className="py-3 px-4">{getTranslation(lang, 'colDistrict')}</th>
                  <th className="py-3 px-4 text-right">{getTranslation(lang, 'colModalPrice')}</th>
                  <th className="py-3 px-4 text-right">{getTranslation(lang, 'colMinMaxRange')}</th>
                  <th className="py-3 px-4">{getTranslation(lang, 'colDate')}</th>
                  <th className="py-3 px-4">{getTranslation(lang, 'colSourceStatus')}</th>
                  <th className="py-3 px-4 text-center">{getTranslation(lang, 'colAction')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E5DC]">
                {latestMarketRecords.map(record => {
                  const isStale = storageService.isStale(record.observationDate);
                  return (
                    <tr
                      key={record.recordId}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      {/* Market Name */}
                      <td className="py-3 px-4 font-medium text-[#202821]">
                        <div>{lang === 'mr' ? record.marketNameMr : record.marketName}</div>
                        <div className="text-xs text-[#667168]">{record.cropName}</div>
                      </td>

                      {/* District */}
                      <td className="py-3 px-4 text-[#667168]">
                        <div className="font-medium text-[#202821]">
                          {lang === 'mr' ? getDistrictMarathi(record.district) : record.district}
                        </div>
                        {lang === 'mr' && (
                          <div className="text-[11px] text-[#667168]">{record.district}</div>
                        )}
                      </td>

                      {/* Modal Price */}
                      <td className="py-3 px-4 text-right">
                        <div className="font-bold text-[#244638] text-base font-mono tabular-nums">
                          ₹{record.modalPrice.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[11px] text-[#667168]">{record.priceUnit}</div>
                      </td>

                      {/* Min - Max Range */}
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-xs text-[#202821]">
                        {record.minPrice && record.maxPrice ? (
                          <div>
                            ₹{record.minPrice.toLocaleString('en-IN')} – ₹{record.maxPrice.toLocaleString('en-IN')}
                          </div>
                        ) : (
                          <span className="text-[#667168]">
                            {getTranslation(lang, 'notReported')}
                          </span>
                        )}
                      </td>

                      {/* Date & Stale warning */}
                      <td className="py-3 px-4">
                        <div className="font-mono tabular-nums text-xs text-[#202821]">
                          {record.observationDate}
                        </div>
                        {isStale && (
                          <div className="inline-flex items-center gap-1 text-[11px] text-[#96641E] bg-[#FFF0D9] px-1.5 py-0.5 rounded mt-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>{getTranslation(lang, 'staleWarning')}</span>
                          </div>
                        )}
                      </td>

                      {/* Source & Status */}
                      <td className="py-3 px-4 text-xs text-[#667168]">
                        <div className="truncate max-w-[140px] font-medium text-[#202821]" title={record.sourceName}>
                          {record.sourceName}
                        </div>
                        <div className="text-[11px] mt-0.5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            {getTranslation(lang, 'statusVerified')}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onNavigateToTrend(record.cropName, record.marketName)}
                            className="px-2.5 py-1.5 text-xs font-medium text-[#244638] bg-[#F8F5EC] hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1 min-h-[36px]"
                            title={getTranslation(lang, 'viewTrend')}
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                            <span>{getTranslation(lang, 'viewTrend')}</span>
                          </button>
                          <button
                            onClick={() => onNavigateToCompare(record.cropName, record.marketName)}
                            className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-white border border-[#E2E5DC] hover:bg-slate-100 rounded-md transition-colors min-h-[36px]"
                            title={getTranslation(lang, 'compareAction')}
                          >
                            {getTranslation(lang, 'compareAction')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* 5. Mobile Cards View */}
          <div className="md:hidden space-y-3">
            {latestMarketRecords.map(record => {
              const isStale = storageService.isStale(record.observationDate);
              return (
                <div
                  key={record.recordId}
                  className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E2E5DC] shadow-xs space-y-2.5 sm:space-y-3"
                >
                  {/* Market & Price Header */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-base text-[#202821] break-words leading-snug">
                        {lang === 'mr' ? record.marketNameMr : record.marketName}
                      </h3>
                      <div className="text-xs text-[#667168] mt-0.5 break-words">
                        {lang === 'mr'
                          ? `${getDistrictMarathi(record.district)} (${record.district})`
                          : record.district}{' '}
                        · {record.cropName}
                        {lang === 'mr' && ` (${record.cropNameMr || getCropMarathiShort(record.cropName)})`}
                      </div>
                    </div>

                    <div className="shrink-0 text-right pl-1">
                      <div className="text-lg sm:text-xl font-bold text-[#244638] font-mono tabular-nums leading-tight">
                        ₹{record.modalPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-[#667168]">{record.priceUnit}</div>
                    </div>
                  </div>

                  {/* Min / Max Range - wrap safe */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between text-xs py-2 px-3 bg-[#F8F5EC] rounded-lg text-[#202821] gap-1.5">
                    <span className="text-[#667168] whitespace-nowrap">{getTranslation(lang, 'colMinMaxRange')}:</span>
                    <span className="font-mono tabular-nums font-medium text-right">
                      {record.minPrice && record.maxPrice
                        ? `₹${record.minPrice.toLocaleString('en-IN')} – ₹${record.maxPrice.toLocaleString('en-IN')}`
                        : getTranslation(lang, 'notReported')}
                    </span>
                  </div>

                  {/* Observation Date & Stale warning */}
                  <div className="flex flex-col gap-1 text-xs text-[#667168]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1.5 shrink-0">
                        <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{getTranslation(lang, 'colDate')}:</span>
                      </span>
                      <span className="font-mono tabular-nums text-[#202821] font-semibold shrink-0">
                        {record.observationDate}
                      </span>
                    </div>

                    {isStale && (
                      <div className="flex items-start gap-1.5 text-[11px] text-[#96641E] bg-[#FFF0D9] p-2 rounded mt-0.5 leading-snug break-words">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="break-words">{getTranslation(lang, 'staleWarning')}</span>
                      </div>
                    )}
                  </div>

                  {/* Source & Status info (stacked cleanly on mobile to prevent overlapping) */}
                  <div className="pt-2 border-t border-[#E2E5DC] flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-[#667168]">
                    <div className="flex items-center gap-1 min-w-0">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span className="truncate break-words text-[11px]" title={record.sourceName}>
                        {record.sourceName}
                      </span>
                    </div>
                    <div className="shrink-0 text-[11px]">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                        {getTranslation(lang, 'statusVerified')}
                      </span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => onNavigateToTrend(record.cropName, record.marketName)}
                      className="px-2.5 py-2 text-xs font-semibold text-[#244638] bg-[#F8F5EC] hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1 min-h-[42px]"
                    >
                      <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{getTranslation(lang, 'viewTrend')}</span>
                    </button>
                    <button
                      onClick={() => onNavigateToCompare(record.cropName, record.marketName)}
                      className="px-2.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-[#E2E5DC] hover:bg-slate-50 rounded-lg transition-colors flex items-center justify-center gap-1 min-h-[42px]"
                    >
                      <span className="truncate">{getTranslation(lang, 'compareAction')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* 6. Honest Disclaimers Note */}
      <div className="p-4 bg-white rounded-xl border border-[#E2E5DC] text-xs text-[#667168] leading-relaxed">
        <p>
          <strong className="text-[#202821]">
            {lang === 'mr' ? 'महत्त्वाची नोंद: ' : 'Data Provenance Note: '}
          </strong>
          {lang === 'mr'
            ? 'प्रदर्शित केलेले भाव हे संबंधित बाजार समित्यांनी नोंदवलेले अधिकृत निरीक्षण भाव आहेत. प्रत्यक्षात माल बाजारात पोहोचल्यावर प्रतवारी, वजन, वाहतूक खर्च आणि आडत यामुळे हातात येणारी रक्कम बदलू शकते.'
            : 'Reported prices represent observed transactions at registered APMC mandis. Actual net revenue depends on individual produce grade, tare weight, transit freight, and authorized market deductions.'}
        </p>
      </div>
    </div>
  );
};
