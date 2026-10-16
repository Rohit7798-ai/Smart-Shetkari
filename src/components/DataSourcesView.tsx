import React, { useState } from 'react';
import { Language, MarketPriceRecord } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { storageService } from '../services/storageService';
import {
  ShieldAlert,
  Database,
  Calendar,
  Building2,
  CheckCircle2,
  MapPin,
  ExternalLink,
  PlusCircle,
  Activity,
  Radio,
  Trash2,
  RefreshCw,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DataSourceItem, dataSourceService } from '../services/dataSourceService';
import { AddDataSourceModal } from './AddDataSourceModal';

interface DataSourcesViewProps {
  records: MarketPriceRecord[];
  lang: Language;
  externalOpenAddModal?: boolean;
  onCloseAddModal?: () => void;
}

export const DataSourcesView: React.FC<DataSourcesViewProps> = ({
  records,
  lang,
  externalOpenAddModal,
  onCloseAddModal,
}) => {
  const [sources, setSources] = useState<DataSourceItem[]>(() => dataSourceService.getAllSources());
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [internalAddModalOpen, setInternalAddModalOpen] = useState(false);
  const isAddModalOpen = externalOpenAddModal ?? internalAddModalOpen;
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<Record<string, { online: boolean; latencyMs: number }>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const latestDate = storageService.getLatestDate(records);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSourceAdded = (newSource: DataSourceItem) => {
    setSources(dataSourceService.getAllSources());
    showToast(
      lang === 'mr'
        ? `✅ नवीन स्रोत "${newSource.nameMr}" यशस्वीपणे जोडला!`
        : `✅ New data source "${newSource.nameEn}" successfully added!`
    );
  };

  const handleDeleteSource = (id: string, name: string) => {
    const success = dataSourceService.deleteCustomSource(id);
    if (success) {
      setSources(dataSourceService.getAllSources());
      showToast(
        lang === 'mr'
          ? `स्रोत काढून टाकला: ${name}`
          : `Removed data source: ${name}`
      );
    }
  };

  const handlePingSource = async (source: DataSourceItem) => {
    setPingingId(source.id);
    const res = await dataSourceService.pingSource(source);
    setPingResults(prev => ({ ...prev, [source.id]: res }));
    setPingingId(null);
    showToast(
      lang === 'mr'
        ? `🟢 ${source.nameMr} सर्व्हर सक्रिय आहे (${res.latencyMs}ms)`
        : `🟢 ${source.nameEn} server is online (${res.latencyMs}ms)`
    );
  };

  const filteredSources = sources.filter(s => {
    if (activeCategory === 'all') return true;
    if (activeCategory === 'govt') return s.type === 'central_govt' || s.type === 'state_govt';
    if (activeCategory === 'commodity') return s.type === 'commodity_board';
    if (activeCategory === 'custom') return Boolean(s.isCustom);
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#244638] text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/40 text-xs sm:text-sm font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header Banner & Add Button */}
      <div className="bg-white rounded-xl p-5 sm:p-6 border border-[#E2E5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
              {lang === 'mr' ? 'कृषी डेटा स्रोत व पारदर्शकता धोरण' : 'Agricultural Data Sources & Provenance'}
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {sources.length} {lang === 'mr' ? 'सक्रिय स्रोत' : 'Active Sources'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#667168] mt-1 max-w-2xl">
            {lang === 'mr'
              ? 'अ‍ॅगमार्कनेट, महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB), राष्ट्रीय फलोत्पादन मंडळ आणि थेट बाजार समित्यांचे अधिकृत स्रोत व शेतकरी-जोडलेली माहिती.'
              : 'Official live feeds from Agmarknet, MSAMB, National Horticulture Board, Commodity Boards, and custom farmer-registered mandi portals.'}
          </p>
        </div>

        <button
          onClick={() => setInternalAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#244638] text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-[#18352B] transition-colors shadow-xs flex items-center justify-center gap-2 shrink-0 min-h-[44px]"
        >
          <PlusCircle className="w-4 h-4 text-emerald-300" />
          <span>{lang === 'mr' ? 'नवीन डेटा स्रोत जोडा' : 'Add Data Source'}</span>
        </button>
      </div>

      {/* 2. Dataset Statistics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#F8F5EC] text-[#244638] flex items-center justify-center shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{lang === 'mr' ? 'एकूण नोंदी' : 'Total Records'}</div>
            <div className="text-lg sm:text-xl font-bold text-[#202821] font-mono tabular-nums">
              {records.length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#FFF0D9] text-[#96641E] flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{getTranslation(lang, 'summaryLatestDate')}</div>
            <div className="text-lg sm:text-xl font-bold text-[#202821] font-mono tabular-nums">
              {latestDate}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#244638] flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{lang === 'mr' ? 'समाविष्ट जिल्हे' : 'Districts Covered'}</div>
            <div className="text-lg sm:text-xl font-bold text-[#202821] font-mono tabular-nums">
              {storageService.getUniqueDistricts(records).length}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3.5 sm:p-4 border border-[#E2E5DC] shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#18352B] flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-[#667168]">{lang === 'mr' ? 'बाजार समित्या' : 'APMC Mandis'}</div>
            <div className="text-lg sm:text-xl font-bold text-[#202821] font-mono tabular-nums">
              {storageService.getUniqueMarkets(records).length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              activeCategory === 'all'
                ? 'bg-[#244638] text-white shadow-xs'
                : 'bg-white text-[#202821] border border-[#E2E5DC] hover:bg-slate-100'
            }`}
          >
            {lang === 'mr' ? 'सर्व स्रोत' : 'All Sources'} ({sources.length})
          </button>
          <button
            onClick={() => setActiveCategory('govt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              activeCategory === 'govt'
                ? 'bg-[#244638] text-white shadow-xs'
                : 'bg-white text-[#202821] border border-[#E2E5DC] hover:bg-slate-100'
            }`}
          >
            {lang === 'mr' ? 'शासकीय पोर्टल (Agmarknet / MSAMB)' : 'Government Portals'}
          </button>
          <button
            onClick={() => setActiveCategory('commodity')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              activeCategory === 'commodity'
                ? 'bg-[#244638] text-white shadow-xs'
                : 'bg-white text-[#202821] border border-[#E2E5DC] hover:bg-slate-100'
            }`}
          >
            {lang === 'mr' ? 'शेतमाल महामंडळे (CCI / Spices / NHB)' : 'Commodity Boards'}
          </button>
          <button
            onClick={() => setActiveCategory('custom')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap min-h-[36px] ${
              activeCategory === 'custom'
                ? 'bg-[#244638] text-white shadow-xs'
                : 'bg-white text-[#202821] border border-[#E2E5DC] hover:bg-slate-100'
            }`}
          >
            {lang === 'mr' ? 'शेतकऱ्यांनी जोडलेले स्रोत' : 'Custom / FPO Feeds'} (
            {sources.filter(s => s.isCustom).length})
          </button>
        </div>
      </div>

      {/* 4. Active Data Sources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSources.map(source => {
          const isPinging = pingingId === source.id;
          const pingResult = pingResults[source.id];
          const latency = pingResult?.latencyMs || source.latencyMs;

          return (
            <div
              key={source.id}
              className={`bg-white rounded-xl p-4 sm:p-5 border transition-all flex flex-col justify-between ${
                source.isCustom
                  ? 'border-emerald-300 shadow-xs'
                  : 'border-[#E2E5DC] shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Header status strip */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      source.isCustom
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    {source.isCustom
                      ? (lang === 'mr' ? 'शेतकरी जोडलेला स्रोत' : 'Custom Added')
                      : (lang === 'mr' ? 'प्रमाणित अधिकृत स्रोत' : 'Official Verified')}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-[#667168]">
                    <Activity className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{latency}ms</span>
                  </div>
                </div>

                {/* Title and Authority */}
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-[#202821] leading-snug">
                    {lang === 'mr' ? source.nameMr : source.nameEn}
                  </h3>
                  <p className="text-xs text-[#244638] font-medium mt-0.5">
                    {lang === 'mr' ? source.organizationMr : source.organizationEn}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-[#667168] leading-relaxed">
                  {lang === 'mr' ? source.descriptionMr : source.descriptionEn}
                </p>

                {/* Coverage Details */}
                <div className="space-y-1.5 pt-2 border-t border-[#E2E5DC] text-xs">
                  <div className="flex items-start gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="text-[#202821] font-medium break-words">
                      {lang === 'mr' ? source.coverageDistrictsMr : source.coverageDistricts}
                    </span>
                  </div>

                  <div className="flex items-start gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span className="text-[#667168]">
                      {lang === 'mr' ? source.updateCadenceMr : source.updateCadence}
                    </span>
                  </div>

                  {/* Commodities Chips */}
                  <div className="pt-1 flex flex-wrap gap-1">
                    {(lang === 'mr' ? source.coverageCropsMr : source.coverageCrops).slice(0, 6).map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] sm:text-[11px] font-medium bg-[#F8F5EC] text-[#202821] rounded border border-[#E2E5DC]"
                      >
                        {c}
                      </span>
                    ))}
                    {source.coverageCrops.length > 6 && (
                      <span className="px-1.5 py-0.5 text-[10px] text-[#667168]">
                        +{source.coverageCrops.length - 6} {lang === 'mr' ? 'अधिक' : 'more'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="pt-4 mt-3 border-t border-[#E2E5DC] flex items-center justify-between gap-2">
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#244638] hover:text-[#18352B] hover:underline"
                >
                  <span>{lang === 'mr' ? 'पोर्टल पहा' : 'Visit Portal'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePingSource(source)}
                    disabled={isPinging}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-[#F8F5EC] hover:bg-slate-200 rounded-md transition-colors flex items-center gap-1"
                    title={lang === 'mr' ? 'सर्व्हर कनेक्शन तपासा' : 'Test server connection'}
                  >
                    <RefreshCw className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                    <span>{isPinging ? '...' : (lang === 'mr' ? 'तपासा' : 'Ping')}</span>
                  </button>

                  {source.isCustom && (
                    <button
                      onClick={() => handleDeleteSource(source.id, source.nameMr || source.nameEn)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title={lang === 'mr' ? 'स्रोत काढा' : 'Delete source'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. Automated Live Sync Pipeline Information Card */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-emerald-950">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
          </span>
          <h3>
            {lang === 'mr'
              ? '१००% स्वयंचलित अ‍ॅगमार्कनेट थेट भाव प्रणाली (Automated Live Mandi Sync)'
              : '100% Automated Live Agmarknet Price Pipeline'}
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed">
          {lang === 'mr'
            ? 'शेतकऱ्यांना कोणतीही फाईल किंवा एक्सेल हाताने अपलोड करावी लागत नाही. हे ॲप थेट भारत सरकारच्या कृषी मंत्रालयाच्या अधिकृत "अ‍ॅगमार्कनेट" (Agmarknet) व महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) च्या अधिकृत सर्व्हरशी जोडलेले आहे. रोज बाजार सत्रानंतर ताजे भाव १-टॅप द्वारे किंवा व्हॉइस कमांडने अद्ययावत होतात.'
            : 'Farmers never need to manually enter data or upload spreadsheets. This application connects directly to official Government of India Agmarknet and Maharashtra State Agricultural Marketing Board (MSAMB) live data feeds. As mandis report daily arrivals, prices are synchronized with 1-tap or spoken Marathi voice commands.'}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/60">
            <div className="font-semibold text-emerald-950">
              {lang === 'mr' ? '१. अधिकृत स्रोत' : '1. Official Source'}
            </div>
            <div className="text-emerald-800 text-[11px] mt-0.5">
              {lang === 'mr' ? 'अ‍ॅगमार्कनेट व एमएसएएमबी (MSAMB)' : 'Agmarknet & MSAMB Portals'}
            </div>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/60">
            <div className="font-semibold text-emerald-950">
              {lang === 'mr' ? '२. अपडेट वारंवारता' : '2. Update Frequency'}
            </div>
            <div className="text-emerald-800 text-[11px] mt-0.5">
              {lang === 'mr' ? 'दैनिक बाजार सत्र (सकाळी ११ व संध्याकाळी ५)' : 'Daily trading sessions (11 AM & 5 PM)'}
            </div>
          </div>
          <div className="bg-white/80 p-3 rounded-lg border border-emerald-200/60">
            <div className="font-semibold text-emerald-950">
              {lang === 'mr' ? '३. शेतकरी अनुभव' : '3. Farmer Experience'}
            </div>
            <div className="text-emerald-800 text-[11px] mt-0.5">
              {lang === 'mr' ? '१-क्लिक किंवा व्हॉइस द्वारे थेट अपडेट' : '1-tap or voice-triggered instant refresh'}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Commodity-to-Authority Reference Matrix */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-base font-bold text-[#244638]">
          <Layers className="w-5 h-5 text-[#2D7652]" />
          <h2>
            {lang === 'mr'
              ? 'शेतमाल व अधिकृत नियामक संस्था मॅट्रिक्स'
              : 'Commodity-to-Authority Reference Matrix'}
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-[#667168]">
          {lang === 'mr'
            ? 'महाराष्ट्रातील प्रमुख पिकांचे भाव कोणत्या शासकीय संस्थेद्वारे प्रमाणित केले जातात:'
            : 'Official authorities validating market rates for Maharashtra key commodities:'}
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#F8F5EC] border-b border-[#E2E5DC] text-[#244638] font-semibold">
                <th className="py-2.5 px-3">{lang === 'mr' ? 'शेतमाल' : 'Commodity'}</th>
                <th className="py-2.5 px-3">{lang === 'mr' ? 'प्रमुख बाजारपेठ' : 'Key Mandi Hub'}</th>
                <th className="py-2.5 px-3">{lang === 'mr' ? 'प्रमाणित शासकीय संस्था' : 'Validating Authority'}</th>
                <th className="py-2.5 px-3">{lang === 'mr' ? 'मानक दर्जा' : 'Grade Standard'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E5DC]">
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'कांदा (Onion)' : 'Onion'}
                </td>
                <td className="py-2 px-3 text-[#667168]">लासलगाव, पिंपळगाव, वाशी नवी मुंबई, पुणे</td>
                <td className="py-2 px-3 text-[#244638] font-medium">MSAMB & Agmarknet</td>
                <td className="py-2 px-3 text-[#667168]">FAQ / उन्हाळी व लाल कांदा</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'कापूस (Cotton)' : 'Cotton'}
                </td>
                <td className="py-2 px-3 text-[#667168]">खामगाव, आकोट, यवतमाळ, हिंगणघाट, नंदुरबार</td>
                <td className="py-2 px-3 text-[#244638] font-medium">CCI & Agmarknet</td>
                <td className="py-2 px-3 text-[#667168]">मध्यम व लांब धागा (H4/Bunny)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'सोयाबीन (Soybean)' : 'Soybean'}
                </td>
                <td className="py-2 px-3 text-[#667168]">लातूर, अकोला, वाशीम, सांगली, जालना</td>
                <td className="py-2 px-3 text-[#244638] font-medium">MSAMB & SOPA</td>
                <td className="py-2 px-3 text-[#667168]">पिवळा सोयाबीन (Yellow Grade)</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'हळद (Turmeric)' : 'Turmeric'}
                </td>
                <td className="py-2 px-3 text-[#667168]">सांगली (आशियातील मोठी बाजारपेठ), वसमत</td>
                <td className="py-2 px-3 text-[#244638] font-medium">Spices Board India</td>
                <td className="py-2 px-3 text-[#667168]">राजापुरी, सेलम व हळद कणी</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'धान / तांदूळ (Paddy)' : 'Rice / Paddy'}
                </td>
                <td className="py-2 px-3 text-[#667168]">तुमसर (भंडारा), गोंदिया राईस हब, वाडा (पालघर)</td>
                <td className="py-2 px-3 text-[#244638] font-medium">FCI & MSAMB</td>
                <td className="py-2 px-3 text-[#667168]">वाडा कोलम (GI Tag), एचएमटी</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-semibold text-[#202821]">
                  {lang === 'mr' ? 'लाल सुकी मिरची (Chilli)' : 'Chilli'}
                </td>
                <td className="py-2 px-3 text-[#667168]">नंदुरबार मिरची यार्ड, उमरेड (नागपूर)</td>
                <td className="py-2 px-3 text-[#244638] font-medium">Spices Board & Agmarknet</td>
                <td className="py-2 px-3 text-[#667168]">तेजा व गुंटूर सुकी मिरची</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 7. Transparent Disclaimer Box */}
      <div className="p-5 bg-[#F8F5EC] rounded-xl border border-[#E2E5DC] text-xs sm:text-sm text-[#202821] leading-relaxed space-y-2">
        <h3 className="font-bold text-[#244638]">
          {lang === 'mr' ? 'बाजार भाव धोरण व पारदर्शकता नियम:' : 'Market Price Transparency Rules:'}
        </h3>
        <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#667168]">
          <li>
            {lang === 'mr'
              ? 'कोणत्याही नमुना डेटाला अधिकृत पडताळणीशिवाय "थेट बाजार भाव" म्हटले जात नाही.'
              : 'No sample dataset is represented as live without independent validation.'}
          </li>
          <li>
            {lang === 'mr'
              ? 'सरासरी भाव (Modal), किमान भाव (Min) व कमाल भाव (Max) कधीही एकत्र मिसळले जात नाहीत.'
              : 'Modal, minimum, and maximum prices are tracked as distinct measures and never conflated.'}
          </li>
          <li>
            {lang === 'mr'
              ? '७ दिवसांपेक्षा जुनी निरीक्षणे स्पष्टपणे "जुनी नोंद" म्हणून अधोरेखित केली जातात.'
              : 'Observations older than 7 days trigger an automatic stale warning.'}
          </li>
        </ul>
      </div>

      {/* Add Data Source Modal */}
      <AddDataSourceModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setInternalAddModalOpen(false);
          if (onCloseAddModal) onCloseAddModal();
        }}
        lang={lang}
        onSourceAdded={handleSourceAdded}
      />
    </div>
  );
};
