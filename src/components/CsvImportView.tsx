import React, { useState, useRef } from 'react';
import { Language, MarketPriceRecord, CsvValidationResult } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { validateCsvData, SAMPLE_CSV_CONTENT } from '../utils/csvValidator';
import {
  Download,
  Upload,
  AlertCircle,
  CheckCircle2,
  FileSpreadsheet,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { InlineAiSuggestions } from './InlineAiSuggestions';

interface CsvImportViewProps {
  existingRecords: MarketPriceRecord[];
  onImportSuccess: (importedRecords: MarketPriceRecord[], replaceDuplicates: boolean) => void;
  onResetToSample: () => void;
  lang: Language;
  onTriggerAssistantPrompt?: (prompt: string) => void;
}

export const CsvImportView: React.FC<CsvImportViewProps> = ({
  existingRecords,
  onImportSuccess,
  onResetToSample,
  lang,
  onTriggerAssistantPrompt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [fileSize, setFileSize] = useState<string>('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [replaceDuplicates, setReplaceDuplicates] = useState<boolean>(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // Download template CSV file
  const handleDownloadTemplate = () => {
    const blob = new Blob([SAMPLE_CSV_CONTENT], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'smart_shetkari_price_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessFile = (file: File) => {
    setFileName(file.name);
    setFileSize(`${(file.size / 1024).toFixed(1)} KB`);
    setImportNotification(null);

    const reader = new FileReader();
    reader.onload = e => {
      const text = e.target?.result as string;
      if (text) {
        const result = validateCsvData(text, existingRecords);
        setValidationResult(result);
      }
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleProcessFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleConfirmImport = () => {
    if (!validationResult || validationResult.validRecords.length === 0) return;
    onImportSuccess(validationResult.validRecords, replaceDuplicates);
    setImportNotification(
      getTranslation(lang, 'importSuccess', { count: validationResult.validRecords.length })
    );
    setValidationResult(null);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Template Action */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#244638] tracking-tight">
            {getTranslation(lang, 'csvTitle')}
          </h1>
          <p className="text-sm text-[#667168] mt-0.5">
            {getTranslation(lang, 'csvSubtitle')}
          </p>
        </div>

        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#244638] bg-[#F8F5EC] border border-[#E2E5DC] hover:bg-white rounded-lg transition-colors flex items-center justify-center gap-2 min-h-[44px]"
        >
          <Download className="w-4 h-4 text-[#244638]" />
          <span>{getTranslation(lang, 'downloadTemplate')}</span>
        </button>
      </div>

      {/* 2. Success Notification */}
      {importNotification && (
        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 flex items-center gap-2.5 text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Inline AI CSV Suggestions */}
      {onTriggerAssistantPrompt && (
        <InlineAiSuggestions
          lang={lang}
          title={lang === 'mr' ? 'AI डेटा सहाय्य' : 'AI Data Import Assistance'}
          suggestions={
            lang === 'mr'
              ? [
                  'CSV फाइल कशी अपलोड करावी?',
                  'नमुना डेटा कसा रीसेट करावा?',
                  'CSV मधील आवश्यक स्तंभ कोणते?',
                ]
              : [
                  'How to import a new CSV file?',
                  'How to reset to demo data?',
                  'What columns are required in CSV?',
                ]
          }
          onSelectSuggestion={onTriggerAssistantPrompt}
        />
      )}

      {/* 3. Drag and Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`bg-white rounded-xl p-8 border-2 border-dashed text-center cursor-pointer transition-all ${
          dragActive
            ? 'border-[#244638] bg-[#F8F5EC]'
            : 'border-[#E2E5DC] hover:border-[#244638]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="max-w-sm mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F8F5EC] text-[#244638] flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#202821]">
              {fileName ? fileName : getTranslation(lang, 'dragDropText')}
            </p>
            <p className="text-xs text-[#667168] mt-1">
              {fileName ? fileSize : getTranslation(lang, 'acceptedFormats')}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Validation Results Panel */}
      {validationResult && (
        <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E2E5DC]">
            <h2 className="font-bold text-base text-[#202821]">
              {getTranslation(lang, 'validationResults')}
            </h2>
            <span className="text-xs text-[#667168]">
              {getTranslation(lang, 'totalRowsRead')}:{' '}
              <strong className="font-mono tabular-nums">{validationResult.totalRows}</strong>
            </span>
          </div>

          {/* Validation Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <span className="text-xs text-emerald-800 block">
                {getTranslation(lang, 'validRowsReady')}
              </span>
              <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums mt-0.5">
                {validationResult.validRecords.length}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                validationResult.errors.length > 0
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-xs block">{getTranslation(lang, 'errorsFound')}</span>
              <div className="text-2xl font-bold font-mono tabular-nums mt-0.5">
                {validationResult.errors.length}
              </div>
            </div>

            <div
              className={`p-3.5 rounded-lg border ${
                validationResult.duplicateCount > 0
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <span className="text-xs block">{getTranslation(lang, 'duplicateRows')}</span>
              <div className="text-2xl font-bold font-mono tabular-nums mt-0.5">
                {validationResult.duplicateCount}
              </div>
            </div>
          </div>

          {/* Duplicate Handling Policy Selector */}
          {validationResult.duplicateCount > 0 && (
            <div className="p-4 bg-[#F8F5EC] rounded-lg border border-[#E2E5DC] space-y-2">
              <label className="text-xs font-semibold text-[#244638] uppercase tracking-wider block">
                {getTranslation(lang, 'duplicatePolicy')}
              </label>
              <div className="flex flex-col sm:flex-row gap-3 text-xs sm:text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicatePolicy"
                    checked={!replaceDuplicates}
                    onChange={() => setReplaceDuplicates(false)}
                    className="accent-[#244638]"
                  />
                  <span>{getTranslation(lang, 'duplicateSkip')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="duplicatePolicy"
                    checked={replaceDuplicates}
                    onChange={() => setReplaceDuplicates(true)}
                    className="accent-[#244638]"
                  />
                  <span>{getTranslation(lang, 'duplicateReplace')}</span>
                </label>
              </div>
            </div>
          )}

          {/* Row Validation Errors Table */}
          {validationResult.errors.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-[#B63D35] flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{getTranslation(lang, 'rowErrorTableTitle')}</span>
              </h3>
              <div className="overflow-x-auto rounded-lg border border-rose-200 -mx-1 sm:mx-0">
                <table className="w-full text-left text-xs border-collapse min-w-[460px]">
                  <thead className="bg-rose-50 text-rose-900 border-b border-rose-200">
                    <tr>
                      <th className="py-2 px-3">{getTranslation(lang, 'errRow')}</th>
                      <th className="py-2 px-3">{getTranslation(lang, 'errField')}</th>
                      <th className="py-2 px-3">{getTranslation(lang, 'errValue')}</th>
                      <th className="py-2 px-3">{getTranslation(lang, 'errReason')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-100 bg-white">
                    {validationResult.errors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-rose-50/50">
                        <td className="py-2 px-3 font-mono font-medium text-slate-800">
                          {err.rowNumber}
                        </td>
                        <td className="py-2 px-3 font-mono text-rose-700">{err.field}</td>
                        <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">
                          {err.value || '—'}
                        </td>
                        <td className="py-2 px-3 text-rose-800">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pre-commit Confirmation Area */}
          <div className="pt-3 border-t border-[#E2E5DC] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#667168]">
              {lang === 'mr'
                ? 'नोंदी "आयातित (अडताळणी नसलेला)" स्थितीत साठवल्या जातील.'
                : 'Imported records will be stored with "Imported (Unverified)" provenance status.'}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setValidationResult(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
              >
                {getTranslation(lang, 'cancel')}
              </button>
              <button
                disabled={validationResult.validRecords.length === 0}
                onClick={handleConfirmImport}
                className={`w-full sm:w-auto px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors min-h-[44px] flex items-center justify-center gap-1.5 ${
                  validationResult.validRecords.length > 0
                    ? 'bg-[#244638] text-white hover:bg-[#18352B]'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>{getTranslation(lang, 'confirmImport')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Safe Sandbox Reset Strip */}
      <div className="bg-white rounded-xl p-5 border border-[#E2E5DC] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-sm text-[#202821]">
            {lang === 'mr' ? 'स्थानिक डेटा रीसेट करा' : 'Local Sandbox Reset'}
          </h3>
          <p className="text-xs text-[#667168] mt-0.5">
            {lang === 'mr'
              ? 'केव्हाही मूळ ९० दिवसांच्या अधिकृत नमुना डेटावर परत या.'
              : 'Restore the pristine 90-day cash crop sample dataset at any time.'}
          </p>
        </div>

        <button
          onClick={onResetToSample}
          className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 border border-[#E2E5DC] hover:bg-[#F8F5EC] rounded-lg transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{getTranslation(lang, 'resetSample')}</span>
        </button>
      </div>
    </div>
  );
};
