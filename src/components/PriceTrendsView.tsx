import React, { useState, useMemo, useEffect } from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { storageService, REFERENCE_DATE } from '../services/storageService';
import {
  Calendar,
  TrendingUp,
  Info,
  Building2,
  Table as TableIcon,
} from 'lucide-react';
import { InlineAiSuggestions } from './InlineAiSuggestions';
import { getCropMarathiShort } from '../utils/cropNames';

interface PriceTrendsViewProps {
  records: MarketPriceRecord[];
  lang: Language;
  initialCrop?: string;
  initialMarket?: string;
  initialTimeRange?: '7d' | '30d' | '90d' | 'all';
  onTriggerAssistantPrompt?: (prompt: string) => void;
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

export const PriceTrendsView: React.FC<PriceTrendsViewProps> = ({
  records,
  lang,
  initialCrop,
  initialMarket,
  initialTimeRange,
  onTriggerAssistantPrompt,
}) => {
  const uniqueCrops = useMemo(() => storageService.getUniqueCrops(records), [records]);
  const [selectedCrop, setSelectedCrop] = useState<string>(initialCrop || 'Onion');

  const availableMarkets = useMemo(
    () => storageService.getUniqueMarkets(records, selectedCrop),
    [records, selectedCrop]
  );

  const [selectedMarket, setSelectedMarket] = useState<string>(() => {
    if (initialMarket && availableMarkets.includes(initialMarket)) {
      return initialMarket;
    }
    return availableMarkets[0] || '';
  });

  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange || '30d');

  useEffect(() => {
    if (initialCrop) setSelectedCrop(initialCrop);
    if (initialMarket) setSelectedMarket(initialMarket);
    if (initialTimeRange) setTimeRange(initialTimeRange);
  }, [initialCrop, initialMarket, initialTimeRange]);
  const [hoveredPoint, setHoveredPoint] = useState<{
    date: string;
    modalPrice: number;
    minPrice?: number;
    maxPrice?: number;
    x: number;
    y: number;
  } | null>(null);

  // When crop changes, ensure selected market is valid
  const handleCropChange = (crop: string) => {
    setSelectedCrop(crop);
    const newMarkets = storageService.getUniqueMarkets(records, crop);
    setSelectedMarket(newMarkets[0] || '');
  };

  // Filter historical records for the selected crop & market within the time range
  const filteredTrendRecords = useMemo(() => {
    const cropMarketRecords = records
      .filter(r => r.cropName === selectedCrop && r.marketName === selectedMarket)
      .sort((a, b) => a.observationDate.localeCompare(b.observationDate));

    if (timeRange === 'all') return cropMarketRecords;

    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const refTime = new Date(REFERENCE_DATE).getTime();
    const cutoffTime = refTime - days * 24 * 60 * 60 * 1000;

    return cropMarketRecords.filter(r => {
      const t = new Date(r.observationDate).getTime();
      return t >= cutoffTime;
    });
  }, [records, selectedCrop, selectedMarket, timeRange]);

  // Compute trend summary (rose, fell, flat)
  const trendSummary = useMemo(() => {
    if (filteredTrendRecords.length < 2) return null;
    const first = filteredTrendRecords[0];
    const last = filteredTrendRecords[filteredTrendRecords.length - 1];
    const diff = last.modalPrice - first.modalPrice;
    const pct = ((diff / first.modalPrice) * 100).toFixed(1);

    if (diff > 0) {
      return getTranslation(lang, 'trendSummaryRose', {
        start: `₹${first.modalPrice}`,
        end: `₹${last.modalPrice}`,
        pct,
      });
    } else if (diff < 0) {
      return getTranslation(lang, 'trendSummaryFell', {
        start: `₹${first.modalPrice}`,
        end: `₹${last.modalPrice}`,
        pct: Math.abs(Number(pct)).toFixed(1),
      });
    } else {
      return getTranslation(lang, 'trendSummaryFlat', {
        start: `₹${first.modalPrice}`,
      });
    }
  }, [filteredTrendRecords, lang]);

  // SVG Chart Geometry
  const chartData = useMemo(() => {
    if (filteredTrendRecords.length === 0) return null;

    const prices = filteredTrendRecords.map(r => r.modalPrice);
    const minP = Math.min(...prices);
    const maxP = Math.max(...prices);
    const padding = Math.max((maxP - minP) * 0.15, 100);
    const yMin = Math.max(0, Math.floor(minP - padding));
    const yMax = Math.ceil(maxP + padding);

    const width = 800;
    const height = 300;
    const margin = { top: 25, right: 30, bottom: 45, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const points = filteredTrendRecords.map((r, idx) => {
      const x =
        filteredTrendRecords.length === 1
          ? margin.left + innerWidth / 2
          : margin.left + (idx / (filteredTrendRecords.length - 1)) * innerWidth;
      const y =
        margin.top +
        innerHeight -
        ((r.modalPrice - yMin) / (yMax - yMin || 1)) * innerHeight;
      return {
        ...r,
        x,
        y,
      };
    });

    // Generate path.
    // If adjacent dates differ by more than 14 days, we can render disconnected line segments or gap indicator
    const pathD = points.reduce((acc, pt, i) => {
      return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
    }, '');

    // Area path for gradient background
    const areaD =
      points.length > 0
        ? `${pathD} L ${points[points.length - 1].x} ${margin.top + innerHeight} L ${points[0].x} ${margin.top + innerHeight} Z`
        : '';

    // Y-axis ticks (4 ticks)
    const yTicks = [
      yMin,
      Math.round(yMin + (yMax - yMin) * 0.33),
      Math.round(yMin + (yMax - yMin) * 0.66),
      yMax,
    ];

    return {
      width,
      height,
      margin,
      innerWidth,
      innerHeight,
      yMin,
      yMax,
      points,
      pathD,
      areaD,
      yTicks,
    };
  }, [filteredTrendRecords]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Controls */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
            {getTranslation(lang, 'trendsTitle')}
          </h1>
          <p className="text-sm text-[#667168] mt-0.5">
            {getTranslation(lang, 'trendsSubtitle')}
          </p>
        </div>

        {/* Selectors Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-[#E2E5DC]">
          {/* Crop Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#667168] uppercase tracking-wider mb-1">
              {lang === 'mr' ? 'पीक निवडा' : 'Select Crop'}
            </label>
            <select
              value={selectedCrop}
              onChange={e => handleCropChange(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] min-h-[44px]"
            >
              {uniqueCrops.map(crop => (
                <option key={crop} value={crop}>
                  {crop} {lang === 'mr' && getCropMarathiShort(crop) ? `(${getCropMarathiShort(crop)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Market Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#667168] uppercase tracking-wider mb-1">
              {getTranslation(lang, 'marketLabel')}
            </label>
            <select
              value={selectedMarket}
              onChange={e => setSelectedMarket(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638] min-h-[44px]"
            >
              {availableMarkets.map(mkt => {
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

          {/* Time Range Selector */}
          <div>
            <label className="block text-xs font-semibold text-[#667168] uppercase tracking-wider mb-1">
              {lang === 'mr' ? 'कालावधी' : 'Time Period'}
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[#F8F5EC] rounded-lg border border-[#E2E5DC]">
              <button
                onClick={() => setTimeRange('7d')}
                className={`py-1.5 px-0.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors min-h-[36px] text-center ${
                  timeRange === '7d' ? 'bg-[#244638] text-white shadow-xs' : 'text-[#202821] hover:bg-slate-200'
                }`}
              >
                {getTranslation(lang, 'range7Days')}
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`py-1.5 px-0.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors min-h-[36px] text-center ${
                  timeRange === '30d' ? 'bg-[#244638] text-white shadow-xs' : 'text-[#202821] hover:bg-slate-200'
                }`}
              >
                {getTranslation(lang, 'range30Days')}
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`py-1.5 px-0.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors min-h-[36px] text-center ${
                  timeRange === '90d' ? 'bg-[#244638] text-white shadow-xs' : 'text-[#202821] hover:bg-slate-200'
                }`}
              >
                {getTranslation(lang, 'range90Days')}
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`py-1.5 px-0.5 text-[11px] sm:text-xs font-semibold rounded-md transition-colors min-h-[36px] text-center ${
                  timeRange === 'all' ? 'bg-[#244638] text-white shadow-xs' : 'text-[#202821] hover:bg-slate-200'
                }`}
              >
                {getTranslation(lang, 'rangeAll')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inline AI Trend Insights */}
      {onTriggerAssistantPrompt && (
        <InlineAiSuggestions
          lang={lang}
          title={lang === 'mr' ? 'AI भाव कल विश्लेषण' : 'AI Trend Insights'}
          suggestions={
            lang === 'mr'
              ? [
                  `${selectedCrop} चा ${timeRange} चा कल स्पष्ट करा`,
                  'येत्या आठवड्यात भाव वाढण्याची शक्यता आहे का?',
                  'या कालावधीतील सर्वोच्च भाव कधी होता?',
                ]
              : [
                  `Explain ${selectedCrop} trend for ${timeRange}`,
                  'Are prices expected to increase?',
                  'When was the peak price recorded?',
                ]
          }
          onSelectSuggestion={onTriggerAssistantPrompt}
        />
      )}

      {/* 2. Plain-Language Trend Summary Notice */}
      {trendSummary && (
        <div className="p-4 bg-[#F8F5EC] rounded-xl border border-[#E2E5DC] flex items-center gap-3 text-xs sm:text-sm text-[#244638]">
          <TrendingUp className="w-5 h-5 shrink-0 text-[#2D7652]" />
          <span className="font-medium">{trendSummary}</span>
        </div>
      )}

      {/* 3. SVG Line Chart Area */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-base text-[#202821]">
              {selectedCrop} — {selectedMarket}
            </h3>
            <span className="text-xs text-[#667168]">
              {lang === 'mr' ? 'सरासरी भाव (₹/क्विंटल)' : 'Reported Modal Price (₹/quintal)'}
            </span>
          </div>

          <div className="text-xs text-[#96641E] bg-[#FFF0D9] px-2.5 py-1 rounded-md">
            {getTranslation(lang, 'noZeroNotice')}
          </div>
        </div>

        {chartData && chartData.points.length > 0 ? (
          <div className="relative w-full overflow-hidden">
            <svg
              viewBox={`0 0 ${chartData.width} ${chartData.height}`}
              className="w-full h-auto max-h-[360px]"
            >
              {/* Defs for gradient */}
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#244638" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#244638" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid lines and Y labels */}
              {chartData.yTicks.map(val => {
                const y =
                  chartData.margin.top +
                  chartData.innerHeight -
                  ((val - chartData.yMin) / (chartData.yMax - chartData.yMin || 1)) *
                    chartData.innerHeight;
                return (
                  <g key={val}>
                    <line
                      x1={chartData.margin.left}
                      y1={y}
                      x2={chartData.width - chartData.margin.right}
                      y2={y}
                      stroke="#E2E5DC"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={chartData.margin.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="#667168"
                      className="font-mono tabular-nums"
                    >
                      ₹{val}
                    </text>
                  </g>
                );
              })}

              {/* Area fill */}
              <path d={chartData.areaD} fill="url(#areaGradient)" />

              {/* Line path */}
              <path
                d={chartData.pathD}
                fill="none"
                stroke="#244638"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Points */}
              {chartData.points.map((pt, idx) => (
                <g key={pt.recordId}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={hoveredPoint?.date === pt.observationDate ? '6' : '4'}
                    fill="#FFFFFF"
                    stroke="#244638"
                    strokeWidth="2.5"
                    className="cursor-pointer transition-all"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        date: pt.observationDate,
                        modalPrice: pt.modalPrice,
                        minPrice: pt.minPrice,
                        maxPrice: pt.maxPrice,
                        x: pt.x,
                        y: pt.y,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                  {/* X Axis Date labels for first, middle, last */}
                  {(idx === 0 ||
                    idx === chartData.points.length - 1 ||
                    idx === Math.floor(chartData.points.length / 2)) && (
                    <text
                      x={pt.x}
                      y={chartData.height - 12}
                      textAnchor={
                        idx === 0
                          ? 'start'
                          : idx === chartData.points.length - 1
                          ? 'end'
                          : 'middle'
                      }
                      fontSize="11"
                      fill="#667168"
                      className="font-mono tabular-nums"
                    >
                      {pt.observationDate}
                    </text>
                  )}
                </g>
              ))}
            </svg>

            {/* Hover Tooltip Card */}
            {hoveredPoint && (
              <div
                className={`absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg p-2.5 shadow-lg text-xs space-y-1 transform -translate-y-full ${
                  hoveredPoint.x / chartData.width < 0.2
                    ? 'translate-x-0'
                    : hoveredPoint.x / chartData.width > 0.8
                    ? '-translate-x-full'
                    : '-translate-x-1/2'
                }`}
                style={{
                  left: `${Math.min(Math.max((hoveredPoint.x / chartData.width) * 100, 4), 96)}%`,
                  top: `${Math.max((hoveredPoint.y / chartData.height) * 100 - 8, 15)}%`,
                }}
              >
                <div className="font-semibold text-slate-200">{hoveredPoint.date}</div>
                <div className="text-emerald-400 font-bold font-mono text-sm">
                  Modal: ₹{hoveredPoint.modalPrice.toLocaleString('en-IN')}/qnt
                </div>
                {hoveredPoint.minPrice && hoveredPoint.maxPrice && (
                  <div className="text-slate-300 text-[10px] font-mono">
                    Range: ₹{hoveredPoint.minPrice} – ₹{hoveredPoint.maxPrice}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-[#667168]">
            {getTranslation(lang, 'noRecordsFound')}
          </div>
        )}
      </div>

      {/* 4. Accessible Historical Data Table (Underlying Records) */}
      <div className="bg-white rounded-xl border border-[#E2E5DC] overflow-hidden shadow-xs space-y-3 p-3.5 sm:p-5">
        <div className="flex items-center gap-2 text-base font-bold text-[#202821]">
          <TableIcon className="w-5 h-5 text-[#244638]" />
          <h2>{getTranslation(lang, 'historicalRecordsTitle')}</h2>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-[#F8F5EC] border-b border-[#E2E5DC] text-xs font-semibold text-[#244638]">
                <th className="py-2.5 px-3">{getTranslation(lang, 'colDate')}</th>
                <th className="py-2.5 px-3 text-right">{getTranslation(lang, 'colModalPrice')}</th>
                <th className="py-2.5 px-3 text-right">{getTranslation(lang, 'colMinMaxRange')}</th>
                <th className="py-2.5 px-3">{getTranslation(lang, 'colSourceStatus')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DC]">
              {filteredTrendRecords.map(rec => (
                <tr key={rec.recordId} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono tabular-nums text-[#202821]">
                    {rec.observationDate}
                  </td>
                  <td className="py-2.5 px-3 text-right font-bold text-[#244638] font-mono tabular-nums">
                    ₹{rec.modalPrice.toLocaleString('en-IN')} {rec.priceUnit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#667168]">
                    {rec.minPrice && rec.maxPrice
                      ? `₹${rec.minPrice} – ₹${rec.maxPrice}`
                      : '—'}
                  </td>
                  <td className="py-2.5 px-3 text-xs text-[#667168]">
                    <span>{rec.sourceName}</span>
                    <span className="ml-2 text-[#96641E]">({rec.dataStatus})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
