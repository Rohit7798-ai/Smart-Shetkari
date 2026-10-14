import React from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { storageService } from '../services/storageService';
import { ShieldAlert, Database, Calendar, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

interface DataSourcesViewProps {
  records: MarketPriceRecord[];
  lang: Language;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({ records, lang }) => {
  const latestDate = storageService.getLatestDate(records);
  const demoCount = records.filter(r => r.dataStatus === 'demo').length;
  const importedCount = records.filter(r => r.dataStatus === 'imported_unverified').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 border border-[#E2E5DC] shadow-xs space-y-2">
        <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
          {getTranslation(lang, 'dataSourcesTitle')}
        </h1>
        <p className="text-sm text-[#667168]">
          {getTranslation(lang, 'dataSourcesSubtitle')}
        </p>
      </div>

      {/* Dataset Statistics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F8F5EC] text-[#244638] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{lang === 'mr' ? 'एकूण नोंदी' : 'Total Records'}</div>
            <div className="text-xl font-bold text-[#202821] font-mono tabular-nums">
              {records.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFF0D9] text-[#96641E] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{getTranslation(lang, 'summaryLatestDate')}</div>
            <div className="text-xl font-bold text-[#202821] font-mono tabular-nums">
              {latestDate}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{lang === 'mr' ? 'रेकॉर्ड रचना' : 'Record Breakdown'}</div>
            <div className="text-sm font-semibold text-[#202821]">
              <span className="text-[#96641E]">{demoCount} Demo</span> ·{' '}
              <span className="text-blue-700">{importedCount} CSV</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Core Policy Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#244638]">
            <CheckCircle2 className="w-5 h-5 text-[#2D7652]" />
            <h2>{getTranslation(lang, 'dsSection1Title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#202821] leading-relaxed">
            {getTranslation(lang, 'dsSection1Body')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#244638]">
            <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            <h2>{getTranslation(lang, 'dsSection2Title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#202821] leading-relaxed">
            {getTranslation(lang, 'dsSection2Body')}
          </p>
        </div>

        <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-base font-bold text-[#96641E]">
            <ShieldAlert className="w-5 h-5 text-[#96641E]" />
            <h2>{getTranslation(lang, 'dsSection3Title')}</h2>
          </div>
          <p className="text-xs sm:text-sm text-[#202821] leading-relaxed">
            {getTranslation(lang, 'dsSection3Body')}
          </p>
        </div>
      </div>

      {/* Transparent Disclaimer Box */}
      <div className="p-5 bg-[#F8F5EC] rounded-xl border border-[#E2E5DC] text-xs sm:text-sm text-[#202821] leading-relaxed space-y-2">
        <h3 className="font-bold text-[#244638]">
          {lang === 'mr' ? 'बाजार भाव धोरण व पारदर्शकता नियम:' : 'Market Price Transparency Rules:'}
        </h3>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#667168]">
          <li>
            {lang === 'mr'
              ? 'कोणत्याही नमुना किंवा CSV आयात केलेल्या डेटाला अधिकृत पडताळणीशिवाय "थेट बाजार भाव" म्हटले जात नाही.'
              : 'No sample or CSV-uploaded dataset is represented as live without independent validation.'}
          </li>
          <li>
            {lang === 'mr'
              ? 'सरासरी भाव (Modal), किमान भाव (Min) व कमाल भाव (Max) कधीही एकत्र मिसळले जात नाहीत.'
              : 'Modal, minimum, and maximum prices are tracked as distinct measures and never conflated.'}
          </li>
          <li>
            {lang === 'mr'
              ? '७ दिवसांपेक्षा जुनी निरीक्षणे स्पष्टपणे "जुनी नोंद" म्हणून अधोरेखित केली जातात.'
              : 'Observations older than 7 days from the reference date trigger an automatic stale warning.'}
          </li>
        </ul>
      </div>
    </div>
  );
};
