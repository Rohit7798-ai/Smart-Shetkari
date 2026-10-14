# Smart Shetkari — Agricultural Market Price Information & Comparison Prototype

A clear, trustworthy web prototype designed for farmers to discover, compare, and track crop market prices across agricultural produce markets (mandis/APMCs), backed by transparent data provenance, honest demo status notices, and client-side CSV dataset management.

## User Review & Critical Decisions

> [!IMPORTANT]
> The implementation plan incorporates all 23 critical requirements across the 4 core domains, Phase 2 UX enhancements, and Phase 3 technical safeguards:

- **Confirmed Decision 1 (Data Provenance & Reliability)**: Every price record explicitly displays its `sourceName`, `marketName`, `observationDate`, and `dataStatus` (`demo`, `imported_unverified`, or `verified`). CSV imports will strictly be tagged `imported_unverified` regardless of validation success.
- **Confirmed Decision 2 (Stale-Data Warning)**: Price observations older than 7 days from the reference date automatically display a clear amber warning badge: "Stale data: observation is more than 7 days old."
- **Confirmed Decision 3 (Market Comparison Integrity)**: Only records with identical crop name and unit can be compared. If selected markets have observations from different dates, an explicit warning alert is rendered. Wording strictly uses "Highest listed price in current results" with a dedicated education callout explaining transportation, commission, quality variations, and weight deductions.
- **Confirmed Decision 4 (Bilingual Localization)**: English by default with a high-contrast Marathi (मराठी) header switch that dynamically translates all headings, filters, table columns, disclaimers, explanations, and error messages.
- **Confirmed Decision 5 (Strict CSV Validation)**: In-browser validator enforces column headers, schema types, date sanity (`YYYY-MM-DD` not in future), price positivity, the mathematical invariant `min_price <= modal_price <= max_price`, duplicate detection on `(crop, market, date)`, and provides a pre-commit row review table with downloadable template.
- **Confirmed Decision 6 (Resilient LocalStorage)**: Client-side storage with corrupted JSON protection, graceful storage-disabled fallback, and a prominent "Reset to Sample Data" confirmation flow.

---

## 1. Overview & Core Concept

### What It Does
Smart Shetkari provides farmers with a single, calm, and readable interface to check reported agricultural market prices, compare competing markets side-by-side on a level playing field, and examine historical price trends over time without promotional hype or misleading price guarantees.

### Target Audience & Persona
- **Primary Persona**: Small and marginal farmers accessing market prices on low-cost mobile phones. Requires large tap targets ($\ge 44\text{px}$), high contrast, plain language in Marathi or English, and separate displays for modal, min, and max prices.
- **Secondary Persona**: Prototype data manager / field researcher needing to import APMC market price CSVs, review errors row-by-row, and audit data freshness without risking database corruption.

### Key Value
Bridges the market information gap honestly: empowers farmers with clear observation dates, source citations, and realistic net-earning context before transport and market commission.

---

## 2. Detailed Requirements & Design Specifications

### Domain 1: Price Data Reliability
1. **Demo Data Separation**: A persistent, prominent banner at the top of the interface: *"Demo data — not live market prices. For prototype evaluation only."* Every seeded sample card/row shows `Data Status: Demo`.
2. **Provenance Labels**: Observation date, market name, crop name, unit (`₹/quintal`), data status, and data source (e.g., `MSAMB / APMC Prototype Sample`) rendered on every record.
3. **No False Verification**: CSV-uploaded records are hardcoded to `dataStatus: "imported_unverified"`.
4. **Stale Data Alert**: Records with `observationDate` $> 7\text{ days}$ relative to current dataset reference date display an amber indicator: *"Observation is over 7 days old"*.
5. **Sample Reset**: Single-click "Reset Sample Data" button with confirmation modal restores pristine sample records.

### Domain 2: Accurate Market Comparison
1. **Strict Unit & Crop Matching**: Compares only identical crops and units (e.g. Onion in ₹/quintal). Cannot select cross-crop comparisons.
2. **Observation Date Visibility**: Each compared market displays its specific observation date directly alongside its modal, min, and max price.
3. **Mismatched Date Warning**: If compared markets have differing dates, a prominent banner warns: *"Notice: Displayed prices were recorded on different dates and may not reflect current market differences."*
4. **Neutral Price Phrasing**: Highest price is labeled *"Highest listed price in current results"*, never "Best market" or "Guaranteed rate".
5. **Farmer Net Earnings Callout**: Always present under comparisons: *"Important: Transportation costs, mandi commissions, produce quality grade, and weighbridge charges affect your actual take-home earnings."*

### Domain 3: Farmer Dashboard
1. **Crop Search & Quick Selection**: Searchable input plus quick-filter buttons for core cash crops (**Onion / कांदा**, **Soybean / सोयाबीन**, **Cotton / कापूस**, **Tomato / टोमॅटो**).
2. **Cascading Location Filters**: State, District, and Market dropdowns.
3. **Separated Price Measures**: Clean distinction between **Modal Price** (representative), **Minimum Price**, and **Maximum Price**.
4. **Results Summary**: Real-time counter showing number of markets found and the latest observation date in the current filter.
5. **Responsive Views**: Clean, high-density desktop data table + touch-friendly mobile cards with clear typography.
6. **State Completeness**: Explicit Skeleton loading states, informative Empty State with "Clear Filters" action, and friendly Error Boundaries.

### Domain 4: Strengthened CSV Import & Validation
1. **Template Download**: In-app action to download `smart_shetkari_price_template.csv` with standard headers and sample rows.
2. **Header & Type Validation**: Checks presence of required headers (`crop_name`, `market_name`, `state`, `district`, `observation_date`, `modal_price`, `price_unit`, `source_name`).
3. **Sanity Checks**: Rejects invalid dates, dates in the future, negative or non-numeric prices, and empty required strings.
4. **Price Invariant**: Enforces `min_price <= modal_price <= max_price` (when optional min/max prices are supplied).
5. **Duplicate Resolution**: Detects duplicates matching on `(crop_name, market_name, observation_date)`. Users can choose to skip or overwrite duplicates.
6. **Row Error Table**: Displays an exact table of rejected rows with Row Number, Column Name, and clear explanation of the rejection.
7. **Pre-Save Review**: Displays valid rows count and allows user to inspect and confirm valid rows before committing to LocalStorage.

---

## 3. UI/UX Design System & Usability (Phase 2)

### Agricultural Design Palette
- **Forest (`#244638`)**: Primary action buttons, active navigation, key headings.
- **Deep Forest (`#18352B`)**: Hover and active pressed states.
- **Ivory (`#F8F5EC`)**: Calm, non-glare app canvas background.
- **White (`#FFFFFF`)**: Card surfaces, tables, filter containers.
- **Coral (`#D96C50`)**: Subtle accent highlights and selected filter chips.
- **Border (`#E2E5DC`)**: Hairline card outlines and table dividers.
- **Positive (`#2D7652`)**: Price increase direction (always paired with text "Increase").
- **Caution / Stale (`#96641E`)**: Stale observation notice on amber background (`#FFF0D9`).
- **Error (`#B63D35`)**: Validation errors.

### Bilingual Translation Dictionary (English / मराठी)
A comprehensive translations dictionary covers:
- Navigation items: Market Prices (बाजार भाव), Compare Markets (बाजार तुलना), Price Trends (भाव कल), Data Sources (माहिती स्रोत), CSV Admin (डेटा व्यवस्थापक).
- Core crops: Onion (कांदा), Soybean (सोयाबीन), Cotton (कापूस), Tomato (टोमॅटो).
- Key labels: Modal Price (सरासरी भाव), Min Price (किमान भाव), Max Price (कमाल भाव), Unit (युनिट), Date (दिनांक), Market (बाजार/मंडी), District (जिल्हा).
- Educational notes: Price measure explanations modal ("What do Modal, Min, Max mean?").

### Historical Trends & Chart Accessibility
- Time-range toggles: **7 Days**, **30 Days**, **90 Days**, and **All Available**.
- SVG line chart plotting chronological dates. Missing dates are rendered as visual breaks/gaps rather than interpolated down to ₹0.
- Interactive hover tooltips showing date, modal price, and market name.
- Full accessible data table directly below the chart listing all plotted data points chronologically.

---

## 4. Technical Architecture & Data Strategy (Phase 3)

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                       App.tsx                                          │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │ State: activeTab · lang ('en'|'mr') · storageRecords · lastUpdated · alertBanner │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
│        │                                        │                                      │
│        ▼                                        ▼                                      ▼
│  ┌───────────────┐                       ┌───────────────┐                      ┌────────────┐
│  │   AppHeader   │                       │  DemoBanner   │                      │   NavTabs  │
│  │ - Brand       │                       │ - Status alert│                      │ 5 views    │
│  │ - Lang Switch │                       │ - Provenance  │                      └────────────┘
│  │ - Reset Sample│                       └───────────────┘                             │
│  └───────────────┘                                                                     │
│        ┌───────────────────┬─────────────────────┬──────────────────────┬──────────────┘
│        ▼                   ▼                     ▼                      ▼
│  ┌───────────┐      ┌─────────────┐       ┌──────────────┐       ┌──────────────┐
│  │ Dashboard │      │ CompareView │       │  TrendsView  │       │  CsvManager  │
│  │ - Search  │      │ - Max 4 mkts│       │ - 7/30/90 d  │       │ - Template dl│
│  │ - Filters │      │ - Date warn │       │ - Gap chart  │       │ - Validator  │
│  │ - Table   │      │ - Net earn  │       │ - Data table │       │ - Row errors │
│  │ - Cards   │      │   callout   │       │ - Summary    │       │ - Pre-commit │
│  └───────────┘      └─────────────┘       └──────────────┘       └──────────────┘
│        │                   │                     │                      │
│        └───────────────────┴─────────────────────┴──────────────────────┘
│                                    │
│                                    ▼
│                        ┌───────────────────────┐
│                        │ storageService.ts     │
│                        │ - LocalStorage Safe   │
│                        │ - Corrupt recovery    │
│                        │ - Seed data fallback  │
│                        └───────────────────────┘
```

### Canonical Data Types (`src/types/marketPrice.ts`)
```typescript
export type DataStatus = "demo" | "imported_unverified" | "verified";

export interface MarketPriceRecord {
  recordId: string;
  cropName: string;
  cropNameMr: string;
  marketName: string;
  marketNameMr: string;
  state: string;
  district: string;
  observationDate: string; // YYYY-MM-DD
  minPrice?: number;
  maxPrice?: number;
  modalPrice: number;
  priceUnit: string;      // "₹/quintal"
  sourceName: string;
  sourceUrl?: string;
  retrievedAt: string;
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
```

---

## 5. Implementation Roadmap (Phases 1–4)

```
[Step 1: Data Model, Seed Records, & Validator]
  ├── Create src/types/marketPrice.ts
  ├── Create src/data/seedData.ts (90-day multi-market records for Onion, Soybean, Cotton, Tomato)
  ├── Create src/utils/translations.ts (EN & MR complete dictionary)
  ├── Create src/utils/csvValidator.ts (strict type, date, invariant, duplicate validation)
  └── Create src/services/storageService.ts (safe LocalStorage with error resilience & reset)

[Step 2: Header, Demo Banner, & Farmer Dashboard (Screen A)]
  ├── AppHeader with brand wordmark, language toggle (EN/मराठी), and Reset Sample action
  ├── DataStatusBanner with honest demo warning and latest dataset observation date
  ├── CropSearchSelect with quick buttons for key cash crops
  ├── Cascading LocationFilterGroup (State, District, Market) + active filter chips
  ├── PriceSummary bar with market count and latest observation date
  └── Responsive MarketPriceTable (desktop) & MarketPriceCard (mobile) with separate Modal/Min/Max

[Step 3: Market Comparison View (Screen B)]
  ├── Multi-market selector (up to 4 markets for selected crop and unit)
  ├── Date mismatch warning banner when observation dates differ
  ├── Side-by-side comparison cards highlighting "Highest listed price in current results"
  ├── Price measure info modal explaining Modal vs Min vs Max
  └── Farmer net earnings callout (transport, commission, quality grading, deductions)

[Step 4: Price Trends View (Screen C)]
  ├── Time-range selector (7 days, 30 days, 90 days, all available)
  ├── SVG line chart handling missing dates as visual breaks (no zero-price interpolation)
  ├── Tooltips with exact date, price, unit, and market
  ├── Accessible chronological data table under chart
  └── Data-derived movement summary

[Step 5: CSV Data Manager (Screen E) & Data Sources (Screen D)]
  ├── Downloadable CSV template generator (`smart_shetkari_price_template.csv`)
  ├── Drag-and-drop file upload with live client-side validation
  ├── Row-by-row error table (row #, column, value, reason)
  ├── Duplicate resolution toggle (skip vs replace)
  ├── Valid rows preview and confirmation button (commits as `imported_unverified`)
  └── Data Sources view explaining provenance, update limits, and data status meanings

[Step 6: QA Pass, Accessibility, & Compilation]
  ├── Verify all 11 testing scenarios from Phase 4
  ├── Check mobile viewports (360px+) and keyboard accessibility (focus-visible, 44px targets)
  └── Run compile_applet and confirm pristine build
```
