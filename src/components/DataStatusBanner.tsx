import React from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { AlertCircle, Calendar, Database } from 'lucide-react';
import { storageService } from '../services/storageService';

interface DataStatusBannerProps {
  records: MarketPriceRecord[];
  lang: Language;
}

export const DataStatusBanner: React.FC<DataStatusBannerProps> = ({ records, lang }) => {
  const latestDate = storageService.getLatestDate(records);
  const hasImported = records.some(r => r.dataStatus === 'imported_unverified');

  return (
    <div className="bg-[#FFF0D9] border-b border-[#F0D5B5] px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-[#96641E]">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-1.5 sm:gap-2">
        <div className="flex items-start gap-1.5 sm:gap-2 font-medium leading-snug break-words">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#96641E] mt-0.5" />
          <span className="break-words">{getTranslation(lang, 'demoNotice')}</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1 text-xs text-[#7A5016]">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#96641E] shrink-0" />
            <span>
              {getTranslation(lang, 'summaryLatestDate')}:{' '}
              <strong className="font-mono tabular-nums">{latestDate}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-[#96641E] shrink-0" />
            <span>
              {getTranslation(lang, 'summaryDatasetStatus')}:{' '}
              <strong>
                {hasImported
                  ? getTranslation(lang, 'statusImported')
                  : getTranslation(lang, 'statusDemo')}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
