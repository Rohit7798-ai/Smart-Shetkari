import { SEED_MARKET_PRICES } from '../data/seedData';
import { MarketPriceRecord } from '../types/marketPrice';

const STORAGE_KEY = 'smart_shetkari_market_prices_v4';
export const REFERENCE_DATE = '2026-10-12';

/**
 * Filter out any dummy, mock, or unverified demo records
 */
function purgeDummyRecords(records: MarketPriceRecord[]): MarketPriceRecord[] {
  return records.filter(r => {
    if (!r || !r.recordId) return false;
    // Exclude any explicitly marked demo or dummy records
    if (r.dataStatus === 'demo') return false;
    const lowerId = r.recordId.toLowerCase();
    if (lowerId.includes('dummy') || lowerId.includes('mock')) return false;
    if (r.sourceName && (r.sourceName.toLowerCase().includes('dummy') || r.sourceName.toLowerCase().includes('fake'))) return false;
    return true;
  });
}

/**
 * Safe local storage service with error resilience and official APMC verified data
 */
export const storageService = {
  /**
   * Load stored records, purging any dummy/demo records and ensuring official APMC records
   */
  loadRecords(): MarketPriceRecord[] {
    try {
      // Clear legacy storage keys that may contain obsolete dummy records
      ['smart_shetkari_market_prices_v1', 'smart_shetkari_market_prices_v2', 'smart_shetkari_market_prices_v3'].forEach(k => {
        try { localStorage.removeItem(k); } catch { /* ignore */ }
      });

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const verifiedSeeds = purgeDummyRecords(SEED_MARKET_PRICES);
        this.saveRecords(verifiedSeeds);
        return verifiedSeeds;
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        console.warn('Storage data corrupted or empty, resetting to verified APMC records.');
        const verifiedSeeds = purgeDummyRecords(SEED_MARKET_PRICES);
        this.saveRecords(verifiedSeeds);
        return verifiedSeeds;
      }

      // Strictly purge any dummy records that may have existed
      const cleaned = purgeDummyRecords(parsed);

      // Ensure all expanded verified APMC records are merged in if missing
      const existingIds = new Set(cleaned.map(r => r.recordId));
      const missingSeeds = SEED_MARKET_PRICES.filter(s => s.dataStatus === 'verified' && !existingIds.has(s.recordId));
      if (missingSeeds.length > 0 || cleaned.length !== parsed.length) {
        const merged = [...cleaned, ...missingSeeds];
        this.saveRecords(merged);
        return merged;
      }

      return cleaned;
    } catch (err) {
      console.error('Failed to read from localStorage:', err);
      return purgeDummyRecords(SEED_MARKET_PRICES);
    }
  },

  /**
   * Save records to local storage safely (always enforcing dummy purge)
   */
  saveRecords(records: MarketPriceRecord[]): boolean {
    try {
      const sanitized = purgeDummyRecords(records);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return true;
    } catch (err) {
      console.error('Failed to write to localStorage:', err);
      return false;
    }
  },

  /**
   * Reset local storage to clean verified APMC dataset
   */
  resetToOfficialData(): MarketPriceRecord[] {
    try {
      localStorage.removeItem(STORAGE_KEY);
      const verifiedSeeds = purgeDummyRecords(SEED_MARKET_PRICES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(verifiedSeeds));
      return verifiedSeeds;
    } catch (err) {
      console.error('Failed to reset localStorage:', err);
      return purgeDummyRecords(SEED_MARKET_PRICES);
    }
  },

  // Alias for backward compatibility
  resetToSampleData(): MarketPriceRecord[] {
    return this.resetToOfficialData();
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
