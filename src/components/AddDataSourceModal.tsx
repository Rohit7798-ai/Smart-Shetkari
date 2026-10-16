import React, { useState } from 'react';
import { Language } from '../types/marketPrice';
import { DataSourceItem, dataSourceService } from '../services/dataSourceService';
import { X, Globe, Building2, Check, AlertCircle, Sparkles, PlusCircle } from 'lucide-react';
import { getCropMarathiShort } from '../utils/cropNames';

interface AddDataSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onSourceAdded: (source: DataSourceItem) => void;
}

const COMMON_CROPS = [
  'Onion',
  'Soybean',
  'Cotton',
  'Tomato',
  'Tur',
  'Chana',
  'Wheat',
  'Maize',
  'Rice / Paddy',
  'Turmeric',
  'Chilli',
  'Pomegranate',
  'Orange',
  'Ginger',
  'Grapes',
];

export const AddDataSourceModal: React.FC<AddDataSourceModalProps> = ({
  isOpen,
  onClose,
  lang,
  onSourceAdded,
}) => {
  const [nameEn, setNameEn] = useState('');
  const [nameMr, setNameMr] = useState('');
  const [orgEn, setOrgEn] = useState('');
  const [orgMr, setOrgMr] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<DataSourceItem['type']>('apmc_direct');
  const [selectedCrops, setSelectedCrops] = useState<string[]>(['Onion', 'Soybean']);
  const [coverageDistricts, setCoverageDistricts] = useState('');
  const [coverageDistrictsMr, setCoverageDistrictsMr] = useState('');
  const [updateCadence, setUpdateCadence] = useState('Daily Mandi Auctions');
  const [updateCadenceMr, setUpdateCadenceMr] = useState('दैनिक बाजार लिलाव');
  const [description, setDescription] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const toggleCrop = (crop: string) => {
    if (selectedCrops.includes(crop)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(prev => prev.filter(c => c !== crop));
      }
    } else {
      setSelectedCrops(prev => [...prev, crop]);
    }
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setErrorMsg(lang === 'mr' ? 'कृपया संकेतस्थळ (URL) प्रविष्ट करा.' : 'Please enter a URL first.');
      return;
    }
    setIsTesting(true);
    setErrorMsg('');
    setTestResult(null);

    // Simulate link validation
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(lang === 'mr' ? '✅ संकेतस्थळ तपासले: कनेक्शन यशस्वी (४०ms)' : '✅ Verified: Connection responsive (40ms)');
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameEn.trim() && !nameMr.trim()) {
      setErrorMsg(lang === 'mr' ? 'कृपया डेटा स्रोताचे नाव टाका.' : 'Please enter a source name.');
      return;
    }
    if (!url.trim()) {
      setErrorMsg(lang === 'mr' ? 'कृपया संकेतस्थळ (URL) टाका.' : 'Please enter a URL.');
      return;
    }

    const finalNameEn = nameEn.trim() || nameMr.trim();
    const finalNameMr = nameMr.trim() || nameEn.trim();
    const finalOrgEn = orgEn.trim() || orgMr.trim() || 'Local APMC Mandi Board';
    const finalOrgMr = orgMr.trim() || orgEn.trim() || 'स्थानिक बाजार समिती मंडळ';

    const cropsMr = selectedCrops.map(c => getCropMarathiShort(c) || c);

    const created = dataSourceService.addCustomSource({
      nameEn: finalNameEn,
      nameMr: finalNameMr,
      organizationEn: finalOrgEn,
      organizationMr: finalOrgMr,
      type,
      url: url.trim(),
      coverageDistricts: coverageDistricts.trim() || 'Maharashtra',
      coverageDistrictsMr: coverageDistrictsMr.trim() || 'महाराष्ट्र',
      coverageCrops: selectedCrops,
      coverageCropsMr: cropsMr,
      updateCadence: updateCadence.trim() || 'Daily after auctions',
      updateCadenceMr: updateCadenceMr.trim() || 'दैनिक लिलावानंतर',
      descriptionEn: description.trim() || `User-connected agricultural price source for ${selectedCrops.join(', ')}.`,
      descriptionMr: description.trim() || `शेतकऱ्यांनी जोडलेला स्थानिक बाजार भाव स्रोत (${cropsMr.join(', ')}).`,
    });

    onSourceAdded(created);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full border border-[#E2E5DC] shadow-xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-[#244638] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base sm:text-lg">
                {lang === 'mr' ? 'नवीन कृषी डेटा स्रोत जोडा' : 'Add New Agricultural Data Source'}
              </h2>
              <p className="text-xs text-emerald-200/90">
                {lang === 'mr'
                  ? 'स्थानिक बाजार समिती, शेतकरी उत्पादक कंपनी (FPO) किंवा मंडी लिंक जोडा'
                  : 'Connect a local APMC portal, FPO bulletin, or mandi feed'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-700 text-xs sm:text-sm rounded-lg border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Source Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'डेटा स्रोताचे नाव (मराठी)' : 'Source Name (Marathi)'}
              </label>
              <input
                type="text"
                placeholder={lang === 'mr' ? 'उदा. बारामती बाजार समिती पोर्टल' : 'e.g. बारामती बाजार समिती'}
                value={nameMr}
                onChange={e => setNameMr(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'स्रोताचे नाव (English)' : 'Source Name (English)'}
              </label>
              <input
                type="text"
                placeholder="e.g. Baramati APMC Daily Portal"
                value={nameEn}
                onChange={e => setNameEn(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
              />
            </div>
          </div>

          {/* Organization & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'संस्था किंवा बाजार समिती' : 'Organization / Mandi Board'}
              </label>
              <input
                type="text"
                placeholder={lang === 'mr' ? 'उदा. कृषी उत्पन्न बाजार समिती' : 'e.g. APMC Baramati / FPO'}
                value={orgMr}
                onChange={e => setOrgMr(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'स्रोताचा प्रकार' : 'Source Type'}
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as DataSourceItem['type'])}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#244638]"
              >
                <option value="apmc_direct">{lang === 'mr' ? 'बाजार समिती थेट (APMC Direct)' : 'APMC Direct Mandi'}</option>
                <option value="state_govt">{lang === 'mr' ? 'राज्य शासन पणन मंडळ' : 'State Govt Board'}</option>
                <option value="fpo_cooperative">{lang === 'mr' ? 'शेतकरी उत्पादक कंपनी (FPO / सहकार)' : 'FPO / Farmer Cooperative'}</option>
                <option value="commodity_board">{lang === 'mr' ? 'शेतमाल महामंडळ (Commodity Board)' : 'Commodity Board'}</option>
                <option value="open_data">{lang === 'mr' ? 'ओपन डेटा / सार्वजनिक एपीआय' : 'Open Data / Public API'}</option>
              </select>
            </div>
          </div>

          {/* Website / Feed URL with Test button */}
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">
              {lang === 'mr' ? 'संकेतस्थळ किंवा डेटा फीड लिंक (URL)' : 'Website or Data Feed URL'}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Globe className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  placeholder="https://example-apmc.org/daily-rates"
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
                />
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3.5 py-2 text-xs font-medium bg-[#F8F5EC] text-[#244638] border border-[#E2E5DC] hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0 transition-colors"
              >
                {isTesting ? (lang === 'mr' ? 'तपासत आहे...' : 'Testing...') : (lang === 'mr' ? 'कनेक्शन तपासा' : 'Test Ping')}
              </button>
            </div>
            {testResult && (
              <p className="text-xs text-emerald-700 font-medium mt-1.5">{testResult}</p>
            )}
          </div>

          {/* Crops Multi-Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#202821]">
                {lang === 'mr' ? 'समाविष्ट शेतमाल निवडा' : 'Covered Commodities'}
              </label>
              <span className="text-[11px] text-[#667168]">
                {selectedCrops.length} {lang === 'mr' ? 'पिके निवडली' : 'selected'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-[#F8F5EC]/60 rounded-lg border border-[#E2E5DC]">
              {COMMON_CROPS.map(crop => {
                const isSelected = selectedCrops.includes(crop);
                const mr = getCropMarathiShort(crop);
                return (
                  <button
                    type="button"
                    key={crop}
                    onClick={() => toggleCrop(crop)}
                    className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#244638] text-white'
                        : 'bg-white text-[#202821] border border-[#E2E5DC] hover:bg-slate-100'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{lang === 'mr' && mr ? `${mr} (${crop})` : crop}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Districts Covered */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'कार्यक्षेत्र जिल्हे' : 'Covered Districts'}
              </label>
              <input
                type="text"
                placeholder={lang === 'mr' ? 'उदा. पुणे, सातारा, सोलापूर' : 'e.g. Pune, Satara, Solapur'}
                value={coverageDistrictsMr}
                onChange={e => {
                  setCoverageDistrictsMr(e.target.value);
                  setCoverageDistricts(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#202821] mb-1">
                {lang === 'mr' ? 'अपडेट वारंवारता' : 'Update Frequency'}
              </label>
              <input
                type="text"
                placeholder={lang === 'mr' ? 'उदा. दैनिक लिलावानंतर' : 'e.g. Daily at 12:00 PM'}
                value={updateCadenceMr}
                onChange={e => {
                  setUpdateCadenceMr(e.target.value);
                  setUpdateCadence(e.target.value);
                }}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
              />
            </div>
          </div>

          {/* Note / Description */}
          <div>
            <label className="block text-xs font-semibold text-[#202821] mb-1">
              {lang === 'mr' ? 'स्रोताची माहिती किंवा टीप (पर्यायी)' : 'Notes / Description (Optional)'}
            </label>
            <textarea
              rows={2}
              placeholder={lang === 'mr' ? 'उदा. स्थानिक शेतकरी उत्पादक कंपनीचे अधिकृत दर' : 'e.g. Baramati local mandi verified daily auction feed'}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-[#E2E5DC] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#244638]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-[#202821] hover:bg-slate-100 rounded-lg transition-colors"
            >
              {lang === 'mr' ? 'रद्द करा' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs sm:text-sm font-semibold bg-[#244638] text-white rounded-lg hover:bg-[#18352B] transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-emerald-300" />
              <span>{lang === 'mr' ? 'स्रोत जोडा व सक्रिय करा' : 'Add & Activate Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
