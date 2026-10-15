import React from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { AlertCircle, Calendar, RefreshCw, Radio, CheckCircle } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DataStatusBannerProps {
  records: MarketPriceRecord[];
  lang: Language;
  isSyncing?: boolean;
  onSyncPrices?: () => void;
  lastSyncedAt?: string | null;
}

export const DataStatusBanner: React.FC<DataStatusBannerProps> = ({
  records,
  lang,
  isSyncing = false,
  onSyncPrices,
  lastSyncedAt,
}) => {
  const latestDate = storageService.getLatestDate(records);
  const hasVerified = records.some(r => r.dataStatus === 'verified');

  const formattedSyncTime = React.useMemo(() => {
    if (!lastSyncedAt) return null;
    try {
      const d = new Date(lastSyncedAt);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  }, [lastSyncedAt]);

  return (
    <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#18352B]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium leading-snug">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="text-emerald-950 font-semibold">
            {getTranslation(lang, 'liveActive')}
          </span>
          <span className="text-emerald-800 hidden sm:inline text-xs font-normal">
            • {getTranslation(lang, 'liveAutoSubtitle')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-emerald-900">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span>
              {getTranslation(lang, 'summaryLatestDate')}:{' '}
              <strong className="font-mono tabular-nums text-emerald-950">{latestDate}</strong>
            </span>
          </div>

          {formattedSyncTime && (
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>
                {getTranslation(lang, 'lastSynced')}:{' '}
                <strong className="font-mono text-emerald-950">{formattedSyncTime}</strong>
              </span>
            </div>
          )}

          {onSyncPrices && (
            <button
              onClick={onSyncPrices}
              disabled={isSyncing}
              className="ml-auto md:ml-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-700 text-white hover:bg-emerald-800 disabled:opacity-60 transition-all shadow-xs"
              title={getTranslation(lang, 'btnSyncNow')}
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? getTranslation(lang, 'syncingText') : getTranslation(lang, 'btnSyncNow')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
