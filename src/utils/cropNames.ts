/**
 * Multi-lingual crop display helpers for Maharashtra farmers
 */
export const getCropMarathiShort = (crop: string): string => {
  switch (crop) {
    case 'Onion':
      return 'कांदा';
    case 'Soybean':
      return 'सोयाबीन';
    case 'Cotton':
      return 'कापूस';
    case 'Tomato':
      return 'टोमॅटो';
    case 'Tur':
      return 'तूर';
    case 'Chana':
      return 'हरभरा';
    case 'Wheat':
      return 'गहू';
    case 'Maize':
      return 'मका';
    case 'Turmeric':
      return 'हळद';
    case 'Pomegranate':
      return 'डाळिंब';
    case 'Rice / Paddy':
    case 'Paddy':
    case 'Rice':
      return 'धान / तांदूळ';
    case 'Chilli':
      return 'मिरची';
    case 'Orange':
      return 'संत्रा / मोसंबी';
    case 'Ginger':
      return 'आले';
    case 'Grapes':
      return 'द्राक्षे / बेदाणा';
    default:
      return '';
  }
};

export const getCropDisplayName = (crop: string, lang: 'mr' | 'en'): string => {
  if (lang === 'mr') {
    const mr = getCropMarathiShort(crop);
    return mr ? `${mr} (${crop})` : crop;
  }
  return crop;
};
