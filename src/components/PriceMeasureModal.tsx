import React from 'react';
import { Language } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { HelpCircle, X, CheckCircle2 } from 'lucide-react';

interface PriceMeasureModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const PriceMeasureModal: React.FC<PriceMeasureModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-modal-title"
    >
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-[#E2E5DC]">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E5DC]">
          <div className="flex items-center gap-2 text-[#244638]">
            <HelpCircle className="w-5 h-5 shrink-0" />
            <h2 id="price-modal-title" className="text-lg font-semibold">
              {getTranslation(lang, 'modalDefTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={getTranslation(lang, 'close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4 text-sm text-[#202821] leading-relaxed">
          <div className="p-3.5 bg-[#F8F5EC] rounded-lg border border-[#E2E5DC]">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-[#2D7652] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-[#244638]">
                  {lang === 'mr' ? 'सरासरी भाव (Modal Price): ' : 'Modal Price: '}
                </span>
                <span>
                  {getTranslation(lang, 'modalDefModal')}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800">
              {lang === 'mr' ? 'किमान भाव (Minimum Price): ' : 'Minimum Price: '}
            </span>
            <span>
              {getTranslation(lang, 'modalDefMin')}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800">
              {lang === 'mr' ? 'कमाल भाव (Maximum Price): ' : 'Maximum Price: '}
            </span>
            <span>
              {getTranslation(lang, 'modalDefMax')}
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-[#E2E5DC] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 min-h-[44px] bg-[#244638] text-white text-sm font-medium rounded-lg hover:bg-[#18352B] transition-colors"
          >
            {getTranslation(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
