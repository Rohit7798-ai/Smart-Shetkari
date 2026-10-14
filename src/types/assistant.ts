import { NavTab } from './marketPrice';

export type AppActionType =
  | 'switch_tab'
  | 'filter_prices'
  | 'compare_markets'
  | 'view_trend'
  | 'toggle_language'
  | 'open_price_help'
  | 'trigger_sample_reset'
  | 'download_template'
  | 'guide_step';

export interface AppAction {
  type: AppActionType;
  tab?: NavTab;
  crop?: string;
  district?: string;
  market?: string;
  markets?: string[];
  search?: string;
  timeRange?: '7d' | '30d' | '90d' | 'all';
  lang?: 'mr' | 'en';
  step?: number;
  title?: string;
  content?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: {
    mimeType: string;
    data: string;
    previewUrl?: string;
  };
  actions?: AppAction[];
  suggestedPrompts?: string[];
  timestamp: string;
}

export interface CropAnalysisResult {
  cropIdentified: string;
  qualityGrade: string;
  conditionSummary: string;
  detailedAdvice: string;
  expectedPriceCategory: 'Max Price' | 'Modal Price' | 'Min Price';
  spokenReply: string;
  actions?: AppAction[];
}
