import React from 'react';
import { Language } from '../types/marketPrice';
import { getTranslation } from '../utils/translations';
import { AlertTriangle, X } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  lang: Language;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
    >
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E2E5DC]">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E5DC]">
          <div className="flex items-center gap-2 text-[#96641E]">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <h2 id="reset-modal-title" className="text-lg font-semibold text-slate-900">
              {getTranslation(lang, 'resetConfirmTitle')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            aria-label={getTranslation(lang, 'cancel')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="py-4 text-sm text-[#202821] leading-relaxed">
          {getTranslation(lang, 'resetConfirmText')}
        </p>

        <div className="pt-3 border-t border-[#E2E5DC] flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            {getTranslation(lang, 'cancel')}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2.5 min-h-[44px] text-sm font-medium text-white bg-[#D96C50] rounded-lg hover:bg-[#c2593f] transition-colors"
          >
            {getTranslation(lang, 'resetConfirmAction')}
          </button>
        </div>
      </div>
    </div>
  );
};
