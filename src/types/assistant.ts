import { NavTab } from './marketPrice';

export type AppActionType =
  | 'switch_tab'
  | 'filter_prices'
  | 'compare_markets'
  | 'view_trend'
  | 'toggle_language'
  | 'open_price_help'
  | 'trigger_sample_reset'
  | 'sync_live_prices'
  | 'clear_filters'
  | 'sort_prices'
  | 'open_add_source'
  | 'set_time_range'
  | 'guide_step';

export interface AppAction {
  type: AppActionType;
  tab?: NavTab;
  crop?: string;
  district?: string;
  market?: string;
  markets?: string[];
  search?: string;
  division?: string;
  sortBy?: 'price_desc' | 'price_asc' | 'date_desc' | 'market_asc';
  timeRange?: '7d' | '30d' | '90d' | 'all';
  lang?: 'mr' | 'en';
  step?: number;
  title?: string;
  content?: string;
  labelMr?: string;
  labelEn?: string;
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
