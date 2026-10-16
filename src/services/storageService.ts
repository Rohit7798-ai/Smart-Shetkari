import { SEED_MARKET_PRICES } from '../data/seedData';
import { MarketPriceRecord } from '../types/marketPrice';

const STORAGE_KEY = 'smart_shetkari_market_prices_v3';
export const REFERENCE_DATE = '2026-10-12';

/**
 * Safe local storage service with error resilience and seed fallback
 */
export const storageService = {
  /**
   * Load stored records or fall back to seed data if missing or corrupted
   */
  loadRecords(): MarketPriceRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('smart_shetkari_market_prices_v2');
      if (!raw) {
        // Initialize with seed data
        this.saveRecords(SEED_MARKET_PRICES);
        return [...SEED_MARKET_PRICES];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.warn('Storage data corrupted or empty, resetting to seed records.');
        this.saveRecords(SEED_MARKET_PRICES);
        return [...SEED_MARKET_PRICES];
      }

      // Ensure all expanded seed records are merged in if missing
      const existingIds = new Set(parsed.map(r => r.recordId));
      const missingSeeds = SEED_MARKET_PRICES.filter(s => !existingIds.has(s.recordId));
      if (missingSeeds.length > 0) {
        const merged = [...parsed, ...missingSeeds];
        this.saveRecords(merged);
        return merged;
      }

      return parsed;
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return [...SEED_MARKET_PRICES];
    }
  },

  /**
   * Save records to local storage safely
   */
  saveRecords(records: MarketPriceRecord[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
      return true;
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      return false;
    }
  },

  /**
   * Reset local storage to clean seed dataset
   */
  resetToSampleData(): MarketPriceRecord[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_MARKET_PRICES));
      return [...SEED_MARKET_PRICES];
    } catch (err) {
      console.error('Failed to reset localStorage:', err);
      return [...SEED_MARKET_PRICES];
    }
  },

  /**
   * Determine if observation is older than 7 days from the reference date
   */
  isStale(observationDate: string, refDate: string = REFERENCE_DATE): boolean {
    try {
      const obs = new Date(observationDate).getTime();
      const ref = new Date(refDate).getTime();
      const diffDays = (ref - obs) / (1000 * 60 * 60 * 24);
      return diffDays > 7;
    } catch {
      return false;
    }
  },

  /**
   * Extract unique crop names
   */
  getUniqueCrops(records: MarketPriceRecord[]): string[] {
    return Array.from(new Set(records.map(r => r.cropName))).sort();
  },

  /**
   * Extract unique districts
   */
  getUniqueDistricts(records: MarketPriceRecord[], cropName?: string): string[] {
    const filtered = cropName ? records.filter(r => r.cropName === cropName) : records;
    return Array.from(new Set(filtered.map(r => r.district))).sort();
  },

  /**
   * Extract unique markets
   */
  getUniqueMarkets(records: MarketPriceRecord[], cropName?: string, district?: string): string[] {
    let filtered = records;
    if (cropName) {
      filtered = filtered.filter(r => r.cropName === cropName);
    }
    if (district) {
      filtered = filtered.filter(r => r.district === district);
    }
    return Array.from(new Set(filtered.map(r => r.marketName))).sort();
  },

  /**
   * Get latest observation date in a set of records
   */
  getLatestDate(records: MarketPriceRecord[]): string {
    if (records.length === 0) return '—';
    return records.reduce((latest, r) => (r.observationDate > latest ? r.observationDate : latest), records[0].observationDate);
  },
};
