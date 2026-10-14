import React, { useState, useMemo, useEffect } from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { storageService } from '../services/storageService';
import {
  AlertTriangle,
  Calendar,
  Check,
  Info,
  Scale,
  Award,
  TrendingUp,
} from 'lucide-react';
import { InlineAiSuggestions } from './InlineAiSuggestions';

interface CompareMarketsViewProps {
  records: MarketPriceRecord[];
  lang: Language;
  initialCrop?: string;
  initialMarket?: string;
  initialMarkets?: string[];
  onNavigateToTrend: (cropName: string, marketName: string) => void;
  onTriggerAssistantPrompt?: (prompt: string) => void;
}

export const CompareMarketsView: React.FC<CompareMarketsViewProps> = ({
  records,
  lang,
  initialCrop,
  initialMarket,
  initialMarkets,
  onNavigateToTrend,
  onTriggerAssistantPrompt,
}) => {
  const uniqueCrops = useMemo(() => storageService.getUniqueCrops(records), [records]);
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop || 'Onion');

  useEffect(() => {
    if (initialCrop) {
      setSelectedCrop(initialCrop);
    }
  }, [initialCrop]);

  // Markets available for this selected crop
  const availableMarketsForCrop = useMemo(() => {
    return storageService.getUniqueMarkets(records, selectedCrop);
  }, [records, selectedCrop]);

  // Selected markets for comparison (up to 4)
  const [selectedMarkets, setSelectedMarkets] = useState<string[]>(() => {
    if (initialMarkets && initialMarkets.length > 0) {
      return initialMarkets.slice(0, 4);
    }
    if (initialMarket && availableMarketsForCrop.includes(initialMarket)) {
      const rest = availableMarketsForCrop.filter(m => m !== initialMarket).slice(0, 2);
      return [initialMarket, ...rest];
    }
    return availableMarketsForCrop.slice(0, 3);
  });

  useEffect(() => {
    if (initialMarkets && initialMarkets.length > 0) {
      setSelectedMarkets(initialMarkets.slice(0, 4));
    }
  }, [initialMarkets]);

  // When crop changes, update selected markets to first 3 available
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    const newAvailable = storageService.getUniqueMarkets(records, crop);
    setSelectedMarkets(newAvailable.slice(0, 3));
  };

  const toggleMarket = (market: string) => {
    if (selectedMarkets.includes(market)) {
      if (selectedMarkets.length > 1) {
        setSelectedMarkets(prev => prev.filter(m => m !== market));
      }
    } else {
      if (selectedMarkets.length < 4) {
        setSelectedMarkets(prev => [...prev, market]);
      }
    }
  };

  // Get the latest record for each selected market for the selected crop
  const comparedRecords = useMemo(() => {
    return selectedMarkets
      .map(marketName => {
        const matches = records.filter(
          r => r.cropName === selectedCrop && r.marketName === marketName
        );
        if (matches.length === 0) return null;
        // latest record for this market
        return matches.reduce((latest, current) =>
          current.observationDate > latest.observationDate ? current : latest
        );
      })
      .filter((r): r is MarketPriceRecord => r !== null);
  }, [records, selectedCrop, selectedMarkets]);

  // Determine if dates are different across compared records
  const uniqueObservationDates = useMemo(() => {
    return Array.from(new Set(comparedRecords.map(r => r.observationDate)));
  }, [comparedRecords]);
  const hasDateMismatch = uniqueObservationDates.length > 1;

  // Identify highest listed modal price
  const highestModalPrice = useMemo(() => {
    if (comparedRecords.length === 0) return 0;
    return Math.max(...comparedRecords.map(r => r.modalPrice));
  }, [comparedRecords]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Crop Selector */}
      <div className="bg-white rounded-xl p-3.5 sm:p-5 border border-[#E2E5DC] shadow-xs space-y-3.5 sm:space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
            {getTranslation(lang, 'compareTitle')}
          </h1>
          <p className="text-sm text-[#667168] mt-0.5">
            {getTranslation(lang, 'compareSubtitle')}
          </p>
        </div>

        {/* Crop Selector */}
        <div>
          <label className="block text-xs font-semibold text-[#667168] uppercase tracking-wider mb-2">
            {getTranslation(lang, 'selectCropPrompt')}
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-none -mx-1 px-1">
            {uniqueCrops.map(crop => {
              const isSelected = selectedCrop === crop;
              return (
                <button
                  key={crop}
                  onClick={() => handleCropChange(crop)}
                  className={`px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-lg whitespace-nowrap shrink-0 transition-colors min-h-[42px] sm:min-h-[44px] ${
                    isSelected
                      ? 'bg-[#244638] text-white shadow-xs'
                      : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200'
                  }`}
                >
                  {crop}
                  {lang === 'mr' && (crop === 'Onion' ? ' (कांदा)' : crop === 'Soybean' ? ' (सोयाबीन)' : crop === 'Cotton' ? ' (कापूस)' : crop === 'Tomato' ? ' (टोमॅटो)' : '')}
                </button>
              );
            })}
          </div>
        </div>

        {/* Market Multi-Selector Chips */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-[#667168] uppercase tracking-wider">
              {getTranslation(lang, 'selectMarketsPrompt')}
            </label>
            <span className="text-xs text-[#667168]">
              {selectedMarkets.length} / 4 {lang === 'mr' ? 'निवडले' : 'selected'}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {availableMarketsForCrop.map(market => {
              const isSelected = selectedMarkets.includes(market);
              return (
                <button
                  key={market}
                  onClick={() => toggleMarket(market)}
                  className={`px-3 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px] sm:min-h-[44px] ${
                    isSelected
                      ? 'bg-[#244638] text-white shadow-xs'
                      : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200 border border-[#E2E5DC]'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 text-white" />}
                  <span>{market}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inline AI Comparison Suggestions */}
      {onTriggerAssistantPrompt && (
        <InlineAiSuggestions
          lang={lang}
          title={lang === 'mr' ? 'AI तुलना विश्लेषण' : 'AI Comparison Insights'}
          suggestions={
            lang === 'mr'
              ? [
                  `निवडलेल्या बाजारांमधील ${selectedCrop} भावाचा फरक स्पष्ट करा`,
                  `${selectedCrop} विक्रीसाठी कोणता बाजार सर्वात फायदेशीर ठरेल?`,
                  'भावात फरक का आहे याचे कारण सांगा',
                ]
              : [
                  `Analyze price difference for ${selectedCrop} across selected markets`,
                  `Which market is most profitable for selling ${selectedCrop}?`,
                  'Why do these markets have price gaps?',
                ]
          }
          onSelectSuggestion={onTriggerAssistantPrompt}
        />
      )}

      {/* 2. Date Mismatch Warning */}
      {hasDateMismatch && (
        <div className="p-4 bg-[#FFF0D9] rounded-xl border border-[#F0D5B5] flex items-start gap-3 text-xs sm:text-sm text-[#96641E]">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#96641E] mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-slate-900">
              {lang === 'mr' ? 'तारखांमधील फरक: ' : 'Observation Dates Differ: '}
            </span>
            <p className="leading-relaxed">
              {getTranslation(lang, 'dateMismatchWarning')}
            </p>
          </div>
        </div>
      )}

      {/* 3. Side-by-Side Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {comparedRecords.map(record => {
          const isHighest = record.modalPrice === highestModalPrice && comparedRecords.length > 1;
          const isStale = storageService.isStale(record.observationDate);

          return (
            <div
              key={record.recordId}
              className={`bg-white rounded-xl p-5 border transition-all flex flex-col justify-between ${
                isHighest
                  ? 'border-[#244638] ring-2 ring-[#244638]/15 shadow-sm'
                  : 'border-[#E2E5DC] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Highest Price neutral indicator */}
                {isHighest ? (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-[#244638] bg-[#F8F5EC] px-2.5 py-1 rounded-md">
                    <Award className="w-4 h-4 text-[#2D7652]" />
                    <span>{getTranslation(lang, 'highestPriceLabel')}</span>
                  </div>
                ) : (
                  <div className="text-xs text-[#667168] py-1 font-medium">
                    {lang === 'mr' ? 'बाजार समिती' : 'APMC Market'}
                  </div>
                )}

                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#202821] tracking-tight break-words">
                    {lang === 'mr' ? record.marketNameMr : record.marketName}
                  </h3>
                  <p className="text-xs text-[#667168] mt-0.5 break-words">
                    {record.district} · {record.cropName}
                  </p>
                </div>

                {/* Modal Price Highlight */}
                <div className="py-2 px-3 bg-[#F8F5EC] rounded-lg">
                  <span className="text-xs text-[#667168] block">
                    {getTranslation(lang, 'colModalPrice')}:
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-[#244638] font-mono tabular-nums">
                    ₹{record.modalPrice.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[11px] text-[#667168]">{record.priceUnit}</span>
                </div>

                {/* Min / Max Range */}
                <div className="space-y-1.5 text-xs text-[#202821] pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#667168] shrink-0">
                      {lang === 'mr' ? 'किमान भाव: ' : 'Min Price: '}
                    </span>
                    <span className="font-mono tabular-nums font-medium shrink-0">
                      {record.minPrice ? `₹${record.minPrice.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#667168] shrink-0">
                      {lang === 'mr' ? 'कमाल भाव: ' : 'Max Price: '}
                    </span>
                    <span className="font-mono tabular-nums font-medium shrink-0">
                      {record.maxPrice ? `₹${record.maxPrice.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Date & Provenance */}
                <div className="pt-2 border-t border-[#E2E5DC] text-xs text-[#667168] space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{getTranslation(lang, 'colDate')}:</span>
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#202821] shrink-0">
                      {record.observationDate}
                    </span>
                  </div>

                  {isStale && (
                    <div className="flex items-start gap-1.5 text-[11px] text-[#96641E] bg-[#FFF0D9] p-2 rounded break-words leading-snug">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="break-words">{getTranslation(lang, 'staleWarning')}</span>
                    </div>
                  )}

                  <div className="truncate text-[11px] text-[#667168]" title={record.sourceName}>
                    {record.sourceName}
                  </div>
                </div>
              </div>

              {/* View Trend Button */}
              <div className="pt-4 mt-2">
                <button
                  onClick={() => onNavigateToTrend(record.cropName, record.marketName)}
                  className="w-full py-2 px-3 text-xs font-semibold text-[#244638] bg-[#F8F5EC] hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{getTranslation(lang, 'viewTrend')}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Comparative Bar Chart Visual */}
      {comparedRecords.length > 1 && (
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-[#E2E5DC] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="font-bold text-base text-[#202821]">
              {getTranslation(lang, 'chartComparisonTitle')}
            </h3>
            <span className="text-xs text-[#667168]">
              {lang === 'mr' ? 'समान युनिट: ₹/क्विंटल' : 'Standardized Unit: ₹/quintal'}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {comparedRecords.map(rec => {
              const pct = highestModalPrice > 0 ? (rec.modalPrice / highestModalPrice) * 100 : 0;
              const isHighest = rec.modalPrice === highestModalPrice;

              return (
                <div key={rec.recordId} className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-[#202821] truncate block">
                        {lang === 'mr' ? rec.marketNameMr : rec.marketName}
                      </span>
                      <span className="text-[11px] text-[#667168] block">({rec.observationDate})</span>
                    </div>
                    <span className="shrink-0 font-mono tabular-nums font-bold text-[#244638] text-sm sm:text-base">
                      ₹{rec.modalPrice.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="w-full h-3.5 sm:h-4 bg-[#F8F5EC] rounded-full overflow-hidden border border-[#E2E5DC]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isHighest ? 'bg-[#244638]' : 'bg-[#667168]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Farmer Net Earnings Educational Callout */}
      <div className="p-5 bg-white rounded-xl border border-[#E2E5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-[#244638] font-bold text-base">
          <Scale className="w-5 h-5 shrink-0 text-[#244638]" />
          <h2>{getTranslation(lang, 'netEarningsTitle')}</h2>
        </div>
        <p className="text-xs sm:text-sm text-[#202821] leading-relaxed">
          {getTranslation(lang, 'netEarningsExplanation')}
        </p>
        <div className="pt-3 border-t border-[#E2E5DC] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs text-[#667168]">
          <div className="p-3 bg-[#F8F5EC] rounded-lg">
            <strong className="block text-[#202821] mb-0.5">
              {lang === 'mr' ? '१. वाहतूक खर्च' : '1. Transport Costs'}
            </strong>
            {lang === 'mr'
              ? 'दूरच्या बाजारात जाण्यासाठी इंधन व वाहनाचे भाडे जास्त लागते.'
              : 'Distant mandis incur higher diesel, freight, and return toll charges.'}
          </div>
          <div className="p-3 bg-[#F8F5EC] rounded-lg">
            <strong className="block text-[#202821] mb-0.5">
              {lang === 'mr' ? '२. बाजार शुल्क व आडत' : '2. Mandi Fees & Commission'}
            </strong>
            {lang === 'mr'
              ? 'काही बाजारांमध्ये अधिकृत हमाली आणि तोलाई दर वेगळे असतात.'
              : 'Cess, labor handling (hamali), and weighment fees differ across APMCs.'}
          </div>
          <div className="p-3 bg-[#F8F5EC] rounded-lg">
            <strong className="block text-[#202821] mb-0.5">
              {lang === 'mr' ? '३. प्रतवारी (Grading)' : '3. Quality Grading'}
            </strong>
            {lang === 'mr'
              ? 'सर्वोच्च भाव केवळ उत्तम दर्जाच्या पहिल्या प्रतीच्या मालाला मिळतो.'
              : 'Maximum rates apply only to top-grade, uniform moisture lots.'}
          </div>
          <div className="p-3 bg-[#F8F5EC] rounded-lg">
            <strong className="block text-[#202821] mb-0.5">
              {lang === 'mr' ? '४. घसरण व घट' : '4. Transit Shrinkage'}
            </strong>
            {lang === 'mr'
              ? 'लांबच्या प्रवासात कांदा, टोमॅटो यांसारख्या मालाचे वजन घटू शकते.'
              : 'Perishables like tomato or onion lose moisture weight during transit.'}
          </div>
        </div>
      </div>
    </div>
  );
};
