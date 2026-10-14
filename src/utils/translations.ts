import { Language } from '../types/marketPrice';

export const TRANSLATIONS = {
  en: {
    appName: 'Smart Shetkari',
    appSubtitle: 'Agricultural Market Price Information & Comparison',
    demoNotice: 'Demo data — not live market prices. For prototype evaluation only.',
    resetSample: 'Reset Sample Data',
    resetConfirmTitle: 'Reset to Sample Data?',
    resetConfirmText: 'This will remove any uploaded CSV records and restore the original 90-day cash crop sample dataset.',
    resetConfirmAction: 'Yes, Reset Data',
    cancel: 'Cancel',
    priceHelp: 'Understanding Prices',
    
    // Navigation
    navMarketPrices: 'Market Prices',
    navCompareMarkets: 'Compare Markets',
    navPriceTrends: 'Price Trends',
    navDataSources: 'Data Sources',
    navCsvImport: 'CSV Data Manager',
    
    // Dashboard
    searchPlaceholder: 'Search crop (e.g. Onion, Soybean, Cotton, Tomato)...',
    allCrops: 'All Crops',
    allStates: 'All States',
    allDistricts: 'All Districts',
    allMarkets: 'All Markets',
    stateLabel: 'State',
    districtLabel: 'District',
    marketLabel: 'Market / Mandi',
    sortByLabel: 'Sort by',
    sortPriceHigh: 'Modal Price: High to Low',
    sortPriceLow: 'Modal Price: Low to High',
    sortDateRecent: 'Observation: Most Recent',
    sortMarketAlpha: 'Market: Alphabetical',
    clearFilters: 'Clear Filters',
    activeFilters: 'Active Filters',
    
    // Summary
    summaryMarketsFound: 'markets with records',
    summaryLatestDate: 'Latest observation date',
    summaryDatasetStatus: 'Dataset status',
    
    // Table / Card Headers
    colCrop: 'Crop',
    colMarket: 'Market',
    colDistrict: 'District',
    colModalPrice: 'Modal Price',
    colMinMaxRange: 'Min – Max Range',
    colDate: 'Observation Date',
    colSourceStatus: 'Source & Status',
    colAction: 'Action',
    viewTrend: 'View Trend',
    compareAction: 'Compare',
    
    // Status Labels
    statusDemo: 'Demo Data',
    statusImported: 'Imported (Unverified)',
    statusVerified: 'Verified Source',
    staleWarning: 'Observation is over 7 days old',
    notReported: 'Not reported',
    
    // Comparison View
    compareTitle: 'Compare Market Prices',
    compareSubtitle: 'Compare the same crop across up to 4 markets on an equal footing.',
    selectCropPrompt: 'Select Crop to Compare',
    selectMarketsPrompt: 'Select Markets (Max 4)',
    highestPriceLabel: 'Highest listed price in current results',
    dateMismatchWarning: 'Notice: Displayed prices were recorded on different dates. Price differences may reflect market movements over time rather than true day-of-sale variations.',
    netEarningsTitle: 'Important note on farmer take-home earnings',
    netEarningsExplanation: 'The highest listed market price does not guarantee higher profit. Actual take-home income is reduced by transportation distance, mandi commission rates, weighbridge charges, and quality grading deductions at individual mandis.',
    chartComparisonTitle: 'Modal Price Comparison (₹/quintal)',
    
    // Trends View
    trendsTitle: 'Historical Price Movement',
    trendsSubtitle: 'Examine reported price movement over time without speculative predictions.',
    range7Days: '7 Days',
    range30Days: '30 Days',
    range90Days: '90 Days',
    rangeAll: 'All Available',
    historicalRecordsTitle: 'Underlying Historical Observations',
    noZeroNotice: 'Note: Days without recorded market trades are represented as data gaps, not zero prices.',
    trendSummaryRose: 'The modal price rose from {start} to {end} ({pct}%) over the selected period.',
    trendSummaryFell: 'The modal price fell from {start} to {end} ({pct}%) over the selected period.',
    trendSummaryFlat: 'The modal price remained steady at {start} over the selected period.',
    
    // Data Sources View
    dataSourcesTitle: 'Data Provenance & Reliability Policy',
    dataSourcesSubtitle: 'Clear transparency on how price records are acquired and handled.',
    dsSection1Title: '1. Seeded Demo Records',
    dsSection1Body: 'The initial dataset represents realistic sample observations for Maharashtra APMC mandis (Lasalgaon, Pune, Nashik, Solapur, Nagpur, Akola) across 90 days. It is strictly intended for interface evaluation.',
    dsSection2Title: '2. Unverified CSV Uploads',
    dsSection2Body: 'When a field user imports a CSV file, data format validation checks the structure, but the data is never marked as verified without independent verification by agricultural market authorities.',
    dsSection3Title: '3. Limitations & Disclaimers',
    dsSection3Body: 'Smart Shetkari does not predict future prices, does not execute transactions, and does not guarantee that buyers will offer the listed modal price upon arrival.',
    
    // CSV Manager View
    csvTitle: 'Import Market-Price Data',
    csvSubtitle: 'Load local APMC price observation datasets into the browser sandbox.',
    downloadTemplate: 'Download CSV Template',
    dragDropText: 'Drop your CSV file here, or click to browse',
    acceptedFormats: 'Supported: .csv files matching schema (max 2MB)',
    validationResults: 'Validation Results',
    totalRowsRead: 'Total rows processed',
    validRowsReady: 'Valid records ready to import',
    errorsFound: 'Validation errors found',
    duplicateRows: 'Duplicate records detected',
    duplicatePolicy: 'Duplicate Handling',
    duplicateSkip: 'Skip duplicates (Keep existing records)',
    duplicateReplace: 'Replace existing with imported records',
    rowErrorTableTitle: 'Row Validation Errors (Requires Correction)',
    errRow: 'Row',
    errField: 'Field',
    errValue: 'Value',
    errReason: 'Reason',
    confirmImport: 'Confirm & Import Valid Records',
    importSuccess: 'Successfully imported {count} records into local storage.',
    
    // Empty & Loading States
    noRecordsFound: 'No price records match the selected filters.',
    tryClearing: 'Try adjusting your crop selection or clearing the district filter.',
    loading: 'Loading market records...',
    
    // Modal Price Explanations
    modalDefTitle: 'What do these price terms mean?',
    modalDefModal: 'Modal Price: The most frequent price at which the majority of produce traded on that day. This is the most representative benchmark for comparison.',
    modalDefMin: 'Minimum Price: The lowest recorded price accepted for lower-grade or damaged lots.',
    modalDefMax: 'Maximum Price: The highest recorded price received, usually reserved for premium quality lots.',
    close: 'Close',
  },
  mr: {
    appName: 'स्मार्ट शेतकरी',
    appSubtitle: 'कृषी बाजार भाव माहिती व तुलना प्रणाली',
    demoNotice: 'नमुना डेटा — थेट बाजार भाव नाहीत. केवळ प्रोटोटाइप मूल्यमापनासाठी.',
    resetSample: 'नमुना डेटा पूर्ववत करा',
    resetConfirmTitle: 'नमुना डेटा पूर्ववत करायचा का?',
    resetConfirmText: 'यामुळे आयात केलेले CSV रेकॉर्ड हटवले जातील आणि मूळ 90 दिवसांचा नमुना डेटा पुन्हा लोड केला जाईल.',
    resetConfirmAction: 'होय, डेटा पूर्ववत करा',
    cancel: 'रद्द करा',
    priceHelp: 'भावांची माहिती',
    
    // Navigation
    navMarketPrices: 'बाजार भाव',
    navCompareMarkets: 'बाजार तुलना',
    navPriceTrends: 'भाव कल',
    navDataSources: 'माहिती स्रोत',
    navCsvImport: 'CSV व्यवस्थापक',
    
    // Dashboard
    searchPlaceholder: 'पीक शोधा (उदा. कांदा, सोयाबीन, कापूस, टोमॅटो)...',
    allCrops: 'सर्व पिके',
    allStates: 'सर्व राज्ये',
    allDistricts: 'सर्व जिल्हे',
    allMarkets: 'सर्व बाजार',
    stateLabel: 'राज्य',
    districtLabel: 'जिल्हा',
    marketLabel: 'बाजार / मंडी',
    sortByLabel: 'क्रमवारी',
    sortPriceHigh: 'सरासरी भाव: जास्त ते कमी',
    sortPriceLow: 'सरासरी भाव: कमी ते जास्त',
    sortDateRecent: 'नोंदणी दिनांक: सर्वात नवीन',
    sortMarketAlpha: 'बाजार: अ-झा नुसार',
    clearFilters: 'फिल्टर काढा',
    activeFilters: 'निवडलेले फिल्टर्स',
    
    // Summary
    summaryMarketsFound: 'बाजारांचे भाव उपलब्ध',
    summaryLatestDate: 'नवीनतम नोंदणी दिनांक',
    summaryDatasetStatus: 'डेटा स्थिती',
    
    // Table / Card Headers
    colCrop: 'पीक',
    colMarket: 'बाजार / मंडी',
    colDistrict: 'जिल्हा',
    colModalPrice: 'सरासरी भाव (Modal)',
    colMinMaxRange: 'किमान – कमाल भाव',
    colDate: 'नोंद दिनांक',
    colSourceStatus: 'स्रोत व स्थिती',
    colAction: 'कृती',
    viewTrend: 'भाव कल पहा',
    compareAction: 'तुलना करा',
    
    // Status Labels
    statusDemo: 'नमुना डेटा',
    statusImported: 'आयातित (अडताळणी नसलेला)',
    statusVerified: 'प्रमाणित स्रोत',
    staleWarning: 'नोंद ७ दिवसांपेक्षा जुनी आहे',
    notReported: 'नोंद नाही',
    
    // Comparison View
    compareTitle: 'बाजार भाव तुलना',
    compareSubtitle: 'एकाच पिकाचे विविध बाजारांमधील भाव एकाच युनिटवर तपासा.',
    selectCropPrompt: 'तुलनेसाठी पीक निवडा',
    selectMarketsPrompt: 'बाजार निवडा (जास्तीत जास्त ४)',
    highestPriceLabel: 'सध्याच्या परिणामांमध्ये नोंदवलेला सर्वोच्च भाव',
    dateMismatchWarning: 'सूचना: प्रदर्शित केलेले भाव वेगवेगळ्या तारखांचे आहेत. भावांमधील फरक हा बाजारामधील तात्कालिक फरकाऐवजी वेगवेगळ्या दिवसांचा असू शकतो.',
    netEarningsTitle: 'शेतकऱ्यांच्या प्रत्यक्ष मिळकतीबाबत महत्त्वाची नोंद',
    netEarningsExplanation: 'केवळ बाजारातील जास्त भाव हा जास्त नफ्याची हमी देत नाही. वाहतूक खर्च, बाजार समितीचे शुल्क, तोलाई व मालाच्या प्रतवारीनुसार शेतकऱ्यांच्या हातात येणारी रक्कम बदलते.',
    chartComparisonTitle: 'सरासरी भाव तुलना (₹/क्विंटल)',
    
    // Trends View
    trendsTitle: 'ऐतिहासिक भाव कल',
    trendsSubtitle: 'मागील काळातील भावांमधील चढ-उतार समजून घ्या (कोणताही काल्पनिक अंदाज न करता).',
    range7Days: '७ दिवस',
    range30Days: '३० दिवस',
    range90Days: '९० दिवस',
    rangeAll: 'सर्व उपलब्ध',
    historicalRecordsTitle: 'मागील नोंदवलेले सर्व बाजार भाव',
    noZeroNotice: 'टीप: ज्या दिवशी बाजारात सौदे झाले नाहीत, ते दिवस शून्य भाव न दाखवता खंडित दर्शवले आहेत.',
    trendSummaryRose: 'निवडलेल्या कालावधीत सरासरी भाव {start} वरून {end} पर्यंत वाढला ({pct}%).',
    trendSummaryFell: 'निवडलेल्या कालावधीत सरासरी भाव {start} वरून {end} पर्यंत घसरला ({pct}%).',
    trendSummaryFlat: 'निवडलेल्या कालावधीत सरासरी भाव {start} वर स्थिर राहिला.',
    
    // Data Sources View
    dataSourcesTitle: 'डेटा स्रोत व पारदर्शकता धोरण',
    dataSourcesSubtitle: 'बाजार भाव नोंदी कशा संकलित केल्या जातात याची स्पष्ट माहिती.',
    dsSection1Title: '१. पूर्व-लोड केलेला नमुना डेटा',
    dsSection1Body: 'सुरुवातीचा डेटा महाराष्ट्रातील प्रमुख बाजार समित्यांचा (लासलगाव, पुणे, नाशिक, सोलापूर, नागपूर, अकोला) ९० दिवसांचा नमुना आहे. हा केवळ प्रणालीच्या चाचणीसाठी आहे.',
    dsSection2Title: '२. आयात केलेल्या CSV फाईल्स',
    dsSection2Body: 'जेव्हा वापरकर्ता CSV फाईल अपलोड करतो, तेव्हा डेटाची रचना तपासली जाते; परंतु अधिकृत कृषी विभागाच्या पडताळणीशिवाय त्याला थेट "प्रमाणित" मानले जात नाही.',
    dsSection3Title: '३. मर्यादा व अस्वीकरण',
    dsSection3Body: 'स्मार्ट शेतकरी भविष्यातील भावांचा अंदाज बांधत नाही, सौदे करत नाही आणि बाजारात गेल्यानंतर याच भावात खरेदी होईल अशी हमी देत नाही.',
    
    // CSV Manager View
    csvTitle: 'बाजार भाव डेटा आयात करा',
    csvSubtitle: 'स्थानिक बाजार समितीच्या भावांची CSV फाईल ब्राउझरमध्ये सुरक्षितपणे लोड करा.',
    downloadTemplate: 'CSV नमुना टेम्प्लेट डाउनलोड करा',
    dragDropText: 'येथे CSV फाईल टाका किंवा निवडण्यासाठी क्लिक करा',
    acceptedFormats: 'मान्य: .csv फाईल (कमाल २ MB)',
    validationResults: 'पडताळणी निकाल',
    totalRowsRead: 'एकूण तपासलेल्या ओळी',
    validRowsReady: 'आयात करण्यासाठी योग्य नोंदी',
    errorsFound: 'त्रुटी आढळलेल्या ओळी',
    duplicateRows: 'दुबार नोंदी आढळल्या',
    duplicatePolicy: 'दुबार नोंदी धोरण',
    duplicateSkip: 'दुबार नोंदी वगळा (जुनी नोंद कायम ठेवा)',
    duplicateReplace: 'नवीन नोंदीने जुनी नोंद बदला',
    rowErrorTableTitle: 'दुरुस्ती आवश्यक असलेल्या ओळी',
    errRow: 'ओळ',
    errField: 'रकाना',
    errValue: 'मूल्य',
    errReason: 'कारण',
    confirmImport: 'योग्य नोंदी आयात करा',
    importSuccess: '{count} नोंदी स्थानिक ब्राउझरमध्ये यशस्वीरीत्या जतन केल्या.',
    
    // Empty & Loading States
    noRecordsFound: 'निवडलेल्या निकषांनुसार कोणतेही भाव आढळले नाहीत.',
    tryClearing: 'कृपया दुसरे पीक निवडून पहा किंवा फिल्टर काढून टाका.',
    loading: 'बाजार भाव लोड होत आहेत...',
    
    // Modal Price Explanations
    modalDefTitle: 'भावांचे प्रकार समजून घ्या',
    modalDefModal: 'सरासरी भाव (Modal Price): ज्या भावात त्या दिवशी बहुतांश मालाची खरेदी-विक्री झाली. बाजारांची तुलना करण्यासाठी हा भाव सर्वात योग्य मानला जातो.',
    modalDefMin: 'किमान भाव (Min Price): त्या दिवशी कमी दर्जाच्या किंवा खराब मालासाठी मिळालेला सर्वात कमी भाव.',
    modalDefMax: 'कमाल भाव (Max Price): त्या दिवशी उत्कृष्ट प्रतीच्या मालासाठी मिळालेला सर्वोच्च भाव.',
    close: 'बंद करा',
  },
};

export function getTranslation(lang: Language, key: keyof typeof TRANSLATIONS['en'], params?: Record<string, string | number>): string {
  const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
  let text = dict[key] || TRANSLATIONS['en'][key] || key;
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }
  return text;
}
