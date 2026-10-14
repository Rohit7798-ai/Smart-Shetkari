import { CsvValidationError, CsvValidationResult, MarketPriceRecord } from '../types/marketPrice';

export const CSV_TEMPLATE_HEADERS = [
  'crop_name',
  'market_name',
  'state',
  'district',
  'observation_date',
  'min_price',
  'modal_price',
  'max_price',
  'price_unit',
  'source_name',
  'source_url',
];

export const SAMPLE_CSV_CONTENT = `crop_name,market_name,state,district,observation_date,min_price,modal_price,max_price,price_unit,source_name,source_url
Onion,Lasalgaon APMC,Maharashtra,Nashik,2026-10-12,1650,2280,2850,₹/quintal,MSAMB Mandi Bulletin,https://agmarknet.gov.in
Soybean,Akola APMC,Maharashtra,Akola,2026-10-12,4200,4680,4950,₹/quintal,MSAMB Mandi Bulletin,https://agmarknet.gov.in
Cotton,Nagpur APMC,Maharashtra,Nagpur,2026-10-11,6900,7480,7850,₹/quintal,Vidarbha Mandi Board,https://agmarknet.gov.in
Tomato,Pune APMC,Maharashtra,Pune,2026-10-12,1250,1800,2400,₹/quintal,Pune APMC Portal,https://agmarknet.gov.in`;

/**
 * Parses raw CSV text handling commas within quotes
 */
function parseCsvLines(csvText: string): string[][] {
  const lines: string[][] = [];
  const rawLines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);

  for (const line of rawLines) {
    const row: string[] = [];
    let insideQuotes = false;
    let entry = '';

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(entry.trim());
        entry = '';
      } else {
        entry += char;
      }
    }
    row.push(entry.trim());
    lines.push(row);
  }

  return lines;
}

/**
 * Maps common Marathi crop names to English and vice versa
 */
const CROP_TRANSLATIONS: Record<string, string> = {
  onion: 'कांदा',
  soybean: 'सोयाबीन',
  cotton: 'कापूस',
  tomato: 'टोमॅटो',
  wheat: 'गहू',
  gram: 'हरभरा',
  maize: 'मका',
  potato: 'बटाटा',
};

/**
 * Validates CSV lines against schema rules
 */
export function validateCsvData(
  csvText: string,
  existingRecords: MarketPriceRecord[] = []
): CsvValidationResult {
  const lines = parseCsvLines(csvText);
  const errors: CsvValidationError[] = [];
  const validRecords: MarketPriceRecord[] = [];
  let duplicateCount = 0;

  if (lines.length === 0) {
    return {
      totalRows: 0,
      validRecords: [],
      errors: [
        {
          rowNumber: 0,
          field: 'file',
          value: '',
          message: 'The uploaded file is empty.',
        },
      ],
      duplicateCount: 0,
    };
  }

  // Header validation
  const rawHeaders = lines[0].map(h => h.toLowerCase().replace(/[\s_-]+/g, '_'));
  const headerMap: Record<string, number> = {};
  rawHeaders.forEach((h, idx) => {
    headerMap[h] = idx;
  });

  const requiredHeaders = [
    'crop_name',
    'market_name',
    'state',
    'district',
    'observation_date',
    'modal_price',
    'price_unit',
    'source_name',
  ];

  const missingHeaders = requiredHeaders.filter(req => !(req in headerMap));
  if (missingHeaders.length > 0) {
    return {
      totalRows: lines.length - 1,
      validRecords: [],
      errors: [
        {
          rowNumber: 1,
          field: 'headers',
          value: rawHeaders.join(', '),
          message: `Missing required columns: ${missingHeaders.join(', ')}`,
        },
      ],
      duplicateCount: 0,
    };
  }

  const existingKeys = new Set(
    existingRecords.map(
      r => `${r.cropName.toLowerCase()}__${r.marketName.toLowerCase()}__${r.observationDate}`
    )
  );

  const seenInBatch = new Set<string>();

  // Use today's ISO date (from metadata local time 2026-10-12)
  const maxAllowedDate = '2026-10-12';

  for (let rowIdx = 1; rowIdx < lines.length; rowIdx++) {
    const row = lines[rowIdx];
    const rowNum = rowIdx + 1; // 1-indexed for human readability

    const getCol = (colName: string): string => {
      const idx = headerMap[colName];
      return idx !== undefined && idx < row.length ? row[idx] : '';
    };

    const cropName = getCol('crop_name');
    const marketName = getCol('market_name');
    const state = getCol('state');
    const district = getCol('district');
    const observationDate = getCol('observation_date');
    const modalPriceStr = getCol('modal_price');
    const minPriceStr = getCol('min_price');
    const maxPriceStr = getCol('max_price');
    const priceUnit = getCol('price_unit') || '₹/quintal';
    const sourceName = getCol('source_name');
    const sourceUrl = getCol('source_url');

    let rowHasError = false;

    // 1. Required text fields
    if (!cropName) {
      errors.push({
        rowNumber: rowNum,
        field: 'crop_name',
        value: cropName,
        message: 'Crop name is required and cannot be blank.',
      });
      rowHasError = true;
    }

    if (!marketName) {
      errors.push({
        rowNumber: rowNum,
        field: 'market_name',
        value: marketName,
        message: 'Market name is required and cannot be blank.',
      });
      rowHasError = true;
    }

    if (!state) {
      errors.push({
        rowNumber: rowNum,
        field: 'state',
        value: state,
        message: 'State is required.',
      });
      rowHasError = true;
    }

    if (!district) {
      errors.push({
        rowNumber: rowNum,
        field: 'district',
        value: district,
        message: 'District is required.',
      });
      rowHasError = true;
    }

    if (!sourceName) {
      errors.push({
        rowNumber: rowNum,
        field: 'source_name',
        value: sourceName,
        message: 'Source name is required to verify provenance.',
      });
      rowHasError = true;
    }

    // 2. Date validation (YYYY-MM-DD and not future)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!observationDate || !dateRegex.test(observationDate)) {
      errors.push({
        rowNumber: rowNum,
        field: 'observation_date',
        value: observationDate,
        message: 'Observation date must be in YYYY-MM-DD format.',
      });
      rowHasError = true;
    } else {
      const parsedDate = new Date(observationDate);
      if (isNaN(parsedDate.getTime())) {
        errors.push({
          rowNumber: rowNum,
          field: 'observation_date',
          value: observationDate,
          message: 'Observation date is not a valid calendar date.',
        });
        rowHasError = true;
      } else if (observationDate > maxAllowedDate) {
        errors.push({
          rowNumber: rowNum,
          field: 'observation_date',
          value: observationDate,
          message: `Observation date cannot be in the future (max allowed: ${maxAllowedDate}).`,
        });
        rowHasError = true;
      }
    }

    // 3. Numeric price validation
    const modalPrice = parseFloat(modalPriceStr.replace(/[^0-9.]/g, ''));
    if (isNaN(modalPrice) || modalPrice <= 0) {
      errors.push({
        rowNumber: rowNum,
        field: 'modal_price',
        value: modalPriceStr,
        message: 'Modal price must be a valid positive number.',
      });
      rowHasError = true;
    }

    let minPrice: number | undefined;
    if (minPriceStr) {
      const parsedMin = parseFloat(minPriceStr.replace(/[^0-9.]/g, ''));
      if (isNaN(parsedMin) || parsedMin <= 0) {
        errors.push({
          rowNumber: rowNum,
          field: 'min_price',
          value: minPriceStr,
          message: 'Minimum price must be a positive number when provided.',
        });
        rowHasError = true;
      } else {
        minPrice = parsedMin;
      }
    }

    let maxPrice: number | undefined;
    if (maxPriceStr) {
      const parsedMax = parseFloat(maxPriceStr.replace(/[^0-9.]/g, ''));
      if (isNaN(parsedMax) || parsedMax <= 0) {
        errors.push({
          rowNumber: rowNum,
          field: 'max_price',
          value: maxPriceStr,
          message: 'Maximum price must be a positive number when provided.',
        });
        rowHasError = true;
      } else {
        maxPrice = parsedMax;
      }
    }

    // 4. Invariant check: min_price <= modal_price <= max_price
    if (!isNaN(modalPrice)) {
      if (minPrice !== undefined && minPrice > modalPrice) {
        errors.push({
          rowNumber: rowNum,
          field: 'min_price',
          value: `Min: ₹${minPrice}, Modal: ₹${modalPrice}`,
          message: 'Minimum price cannot exceed modal price.',
        });
        rowHasError = true;
      }

      if (maxPrice !== undefined && modalPrice > maxPrice) {
        errors.push({
          rowNumber: rowNum,
          field: 'max_price',
          value: `Modal: ₹${modalPrice}, Max: ₹${maxPrice}`,
          message: 'Modal price cannot exceed maximum price.',
        });
        rowHasError = true;
      }

      if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
        errors.push({
          rowNumber: rowNum,
          field: 'min_price / max_price',
          value: `Min: ₹${minPrice}, Max: ₹${maxPrice}`,
          message: 'Minimum price cannot exceed maximum price.',
        });
        rowHasError = true;
      }
    }

    // 5. Duplicate check
    const batchKey = `${cropName.toLowerCase()}__${marketName.toLowerCase()}__${observationDate}`;
    if (seenInBatch.has(batchKey) || existingKeys.has(batchKey)) {
      duplicateCount++;
    }
    seenInBatch.add(batchKey);

    // If valid, build record
    if (!rowHasError) {
      const cropLower = cropName.toLowerCase();
      const cropNameMr = CROP_TRANSLATIONS[cropLower] || cropName;

      validRecords.push({
        recordId: `import-${Date.now()}-${rowNum}-${Math.random().toString(36).substring(2, 6)}`,
        cropName,
        cropNameMr,
        marketName,
        marketNameMr: marketName,
        state,
        district,
        observationDate,
        minPrice,
        modalPrice,
        maxPrice,
        priceUnit,
        sourceName,
        sourceUrl: sourceUrl || undefined,
        retrievedAt: new Date().toISOString(),
        // MANDATORY: Never mark CSV-imported data as verified just because it passed validation
        dataStatus: 'imported_unverified',
      });
    }
  }

  return {
    totalRows: lines.length - 1,
    validRecords,
    errors,
    duplicateCount,
  };
}
