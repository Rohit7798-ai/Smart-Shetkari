/**
 * Canonical types for Smart Shetkari Agricultural Market Price Information & Comparison
 */

export type DataStatus = 'demo' | 'imported_unverified' | 'verified';

export type Language = 'en' | 'mr';

export type NavTab = 'prices' | 'compare' | 'trends' | 'sources' | 'csv';

export interface MarketPriceRecord {
  recordId: string;
  cropName: string;
  cropNameMr: string;
  marketName: string;
  marketNameMr: string;
  state: string;
  stateMr?: string;
  district: string;
  districtMr?: string;
  observationDate: string; // ISO format: YYYY-MM-DD
  minPrice?: number;
  maxPrice?: number;
  modalPrice: number;
  priceUnit: string; // e.g. "₹/quintal"
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string; // ISO format
  dataStatus: DataStatus;
}

export interface CsvValidationError {
  rowNumber: number;
  field: string;
  value: string;
  message: string;
}

export interface CsvValidationResult {
  totalRows: number;
  validRecords: MarketPriceRecord[];
  errors: CsvValidationError[];
  duplicateCount: number;
}

export interface FilterState {
  searchQuery: string;
  selectedCrop: string;
  selectedState: string;
  selectedDistrict: string;
  selectedMarket: string;
  sortBy: 'price_desc' | 'price_asc' | 'date_desc' | 'market_asc';
}
