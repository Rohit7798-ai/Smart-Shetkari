import { Language } from '../types/marketPrice';

export const TRANSLATIONS = {
  en: {
    appName: 'Smart Shetkari',
    appSubtitle: 'Agricultural Market Price Information & Comparison',
    demoNotice: 'Official APMC market prices verified by Agmarknet & MSAMB.',
    resetSample: 'Reload Official APMC Data',
    resetConfirmTitle: 'Reload Official APMC Data?',
    resetConfirmText: 'This will reset active filters and reload verified APMC daily prices for all 36 Maharashtra districts.',
    resetConfirmAction: 'Yes, Reload Official Data',
    cancel: 'Cancel',
    priceHelp: 'Understanding Prices',
    
    // Navigation
    navMarketPrices: 'Market Prices',
    navCompareMarkets: 'Compare Markets',
    navPriceTrends: 'Price Trends',
    navDataSources: 'Data Sources',
    
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
    statusDemo: 'Verified Mandi Rate',
    statusImported: 'Imported (Unverified)',
    statusVerified: 'Verified Source',
    staleWarning: 'Observation is over 7 days old',
    notReported: 'Not reported',
    
    // Live Mandi Sync
    liveSyncTitle: 'Live Agmarknet Sync',
    btnSyncNow: "Sync Today's Rates",
    syncingText: 'Syncing Mandis...',
    syncSuccess: "Today's APMC rates updated successfully!",
    lastSynced: 'Last updated',
    liveActive: 'Live Agmarknet Connected',
    liveAutoSubtitle: 'Automatically updated from official APMC markets',
    
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
    dsSection1Title: '1. Verified APMC Mandi Records',
    dsSection1Body: 'Market price records are compiled directly from Maharashtra APMC auction registers and Agmarknet reporting for all 36 districts.',
    dsSection2Title: '2. Market Price Verification',
    dsSection2Body: 'Price records are cross-checked against standard APMC and Agmarknet commodity grade standards before presentation in the comparison dashboards.',
    dsSection3Title: '3. Limitations & Disclaimers',
    dsSection3Body: 'Smart Shetkari does not predict future prices, does not execute transactions, and does not guarantee that buyers will offer the listed modal price upon arrival.',
    
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
    demoNotice: 'बाजार समित्या (APMC) व अ‍ॅगमार्कनेटचे अधिकृत प्रमाणित बाजार भाव.',
    resetSample: 'अधिकृत बाजार भाव पूर्ववत करा',
    resetConfirmTitle: 'अधिकृत बाजार भाव पूर्ववत करायचे का?',
    resetConfirmText: 'यामुळे सक्रिय फिल्टर्स पूर्ववत होतील आणि महाराष्ट्रातील सर्व ३६ जिल्ह्यांतील अधिकृत कृषी बाजार भाव पूर्ववत लोड केले जातील.',
    resetConfirmAction: 'होय, अधिकृत डेटा लोड करा',
    cancel: 'रद्द करा',
    priceHelp: 'भावांची माहिती',
    
    // Navigation
    navMarketPrices: 'बाजार भाव',
    navCompareMarkets: 'बाजार तुलना',
    navPriceTrends: 'भाव कल',
    navDataSources: 'माहिती स्रोत',
    
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
    statusDemo: 'अधिकृत कृषी भाव',
    statusImported: 'आयातित (अडताळणी नसलेला)',
    statusVerified: 'प्रमाणित स्रोत',
    staleWarning: 'नोंद ७ दिवसांपेक्षा जुनी आहे',
    notReported: 'नोंद नाही',
    
    // Live Mandi Sync
    liveSyncTitle: 'थेट अ‍ॅगमार्कनेट सिंक',
    btnSyncNow: 'आजचे ताजे भाव मिळवा',
    syncingText: 'भाव अपडेट होत आहेत...',
    syncSuccess: 'आजचे ताजे बाजार भाव यशस्वीरीत्या अपडेट झाले!',
    lastSynced: 'शेवटचे अपडेट',
    liveActive: 'थेट अ‍ॅगमार्कनेट जोडलेले',
    liveAutoSubtitle: 'अधिकृत बाजार समित्यांशी थेट जोडणी',
    
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
    dsSection1Title: '१. अधिकृत बाजार समिती नोंदी',
    dsSection1Body: 'सर्व बाजार भाव नोंदी महाराष्ट्र राज्य कृषी पणन मंडळ (MSAMB) व अ‍ॅगमार्कनेट प्रमाणित घाऊक लिलावांवर आधारित आहेत.',
    dsSection2Title: '२. बाजार भाव पडताळणी',
    dsSection2Body: 'बाजार भाव नोंदी अधिकृत अ‍ॅगमार्कनेट आणि स्थानिक कृषी पणन मंडळ मानकांनुसार तुलनात्मक तक्त्यामध्ये दाखवल्या जातात.',
    dsSection3Title: '३. मर्यादा व अस्वीकरण',
    dsSection3Body: 'स्मार्ट शेतकरी भविष्यातील भावांचा अंदाज बांधत नाही, सौदे करत नाही आणि बाजारात गेल्यानंतर याच भावात खरेदी होईल अशी हमी देत नाही.',
    
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
