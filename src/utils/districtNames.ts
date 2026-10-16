/**
 * Comprehensive mapping of all 36 Maharashtra Districts and their Marathi names,
 * administrative divisions, and display utilities.
 */

export interface DistrictInfo {
  nameEn: string;
  nameMr: string;
  divisionEn: 'Western Maharashtra' | 'Khandesh & North' | 'Marathwada' | 'Western Vidarbha' | 'Eastern Vidarbha' | 'Konkan';
  divisionMr: 'पश्चिम महाराष्ट्र' | 'उत्तर महाराष्ट्र / खान्देश' | 'मराठवाडा' | 'पश्चिम विदर्भ' | 'पूर्व विदर्भ' | 'कोकण';
  keyCommoditiesMr: string[];
}

export const MAHARASHTRA_DISTRICTS: Record<string, DistrictInfo> = {
  // 1. Khandesh & North Maharashtra
  Nashik: {
    nameEn: 'Nashik',
    nameMr: 'नाशिक',
    divisionEn: 'Khandesh & North',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    keyCommoditiesMr: ['कांदा', 'टोमॅटो', 'द्राक्षे', 'सोयाबीन', 'मका'],
  },
  Ahmednagar: {
    nameEn: 'Ahmednagar',
    nameMr: 'अहिल्यानगर (अहमदनगर)',
    divisionEn: 'Khandesh & North',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    keyCommoditiesMr: ['कांदा', 'टोमॅटो', 'सोयाबीन', 'गहू', 'दूध'],
  },
  Jalgaon: {
    nameEn: 'Jalgaon',
    nameMr: 'जळगाव',
    divisionEn: 'Khandesh & North',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    keyCommoditiesMr: ['कापूस', 'केळी', 'सोयाबीन', 'मका', 'हरभरा'],
  },
  Dhule: {
    nameEn: 'Dhule',
    nameMr: 'धुळे',
    divisionEn: 'Khandesh & North',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    keyCommoditiesMr: ['कापूस', 'मका', 'सोयाबीन', 'बाजरी'],
  },
  Nandurbar: {
    nameEn: 'Nandurbar',
    nameMr: 'नंदुरबार',
    divisionEn: 'Khandesh & North',
    divisionMr: 'उत्तर महाराष्ट्र / खान्देश',
    keyCommoditiesMr: ['लाल मिरची', 'कापूस', 'पपई', 'सोयाबीन'],
  },

  // 2. Western Maharashtra
  Pune: {
    nameEn: 'Pune',
    nameMr: 'पुणे',
    divisionEn: 'Western Maharashtra',
    divisionMr: 'पश्चिम महाराष्ट्र',
    keyCommoditiesMr: ['कांदा', 'टोमॅटो', 'भाजीपाला', 'डाळिंब', 'ऊस'],
  },
  Solapur: {
    nameEn: 'Solapur',
    nameMr: 'सोलापूर',
    divisionEn: 'Western Maharashtra',
    divisionMr: 'पश्चिम महाराष्ट्र',
    keyCommoditiesMr: ['कांदा', 'डाळिंब', 'तूर', 'हरभरा', 'ज्वारी'],
  },
  Satara: {
    nameEn: 'Satara',
    nameMr: 'सातारा',
    divisionEn: 'Western Maharashtra',
    divisionMr: 'पश्चिम महाराष्ट्र',
    keyCommoditiesMr: ['सोयाबीन', 'आले', 'हळद', 'स्ट्रॉबेरी', 'टोमॅटो'],
  },
  Sangli: {
    nameEn: 'Sangli',
    nameMr: 'सांगली',
    divisionEn: 'Western Maharashtra',
    divisionMr: 'पश्चिम महाराष्ट्र',
    keyCommoditiesMr: ['हळद', 'द्राक्षे (बेदाणा)', 'सोयाबीन', 'मका'],
  },
  Kolhapur: {
    nameEn: 'Kolhapur',
    nameMr: 'कोल्हापूर',
    divisionEn: 'Western Maharashtra',
    divisionMr: 'पश्चिम महाराष्ट्र',
    keyCommoditiesMr: ['गूळ', 'सोयाबीन', 'भाजीपाला', 'धान / तांदूळ'],
  },

  // 3. Marathwada
  'Chhatrapati Sambhajinagar': {
    nameEn: 'Chhatrapati Sambhajinagar',
    nameMr: 'छत्रपती संभाजीनगर (औरंगाबाद)',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['कापूस', 'मका', 'मोसंबी', 'सोयाबीन', 'कांदा'],
  },
  Jalna: {
    nameEn: 'Jalna',
    nameMr: 'जालना',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['सोयाबीन', 'कापूस', 'मोसंबी', 'तूर', 'हरभरा'],
  },
  Beed: {
    nameEn: 'Beed',
    nameMr: 'बीड',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['कापूस', 'सोयाबीन', 'तूर', 'बाजरी'],
  },
  Latur: {
    nameEn: 'Latur',
    nameMr: 'लातूर',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['सोयाबीन', 'तूर (डाळी)', 'हरभरा', 'उडीद', 'मूग'],
  },
  Dharashiv: {
    nameEn: 'Dharashiv',
    nameMr: 'धाराशिव (उस्मानाबाद)',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['सोयाबीन', 'तूर', 'हरभरा', 'कांदा'],
  },
  Nanded: {
    nameEn: 'Nanded',
    nameMr: 'नांदेड',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['सोयाबीन', 'कापूस', 'हळद', 'हरभरा', 'तूर'],
  },
  Parbhani: {
    nameEn: 'Parbhani',
    nameMr: 'परभणी',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['सोयाबीन', 'कापूस', 'तूर', 'ज्वारी'],
  },
  Hingoli: {
    nameEn: 'Hingoli',
    nameMr: 'हिंगोली',
    divisionEn: 'Marathwada',
    divisionMr: 'मराठवाडा',
    keyCommoditiesMr: ['हळद', 'सोयाबीन', 'हरभरा', 'कापूस'],
  },

  // 4. Western Vidarbha
  Amravati: {
    nameEn: 'Amravati',
    nameMr: 'अमरावती',
    divisionEn: 'Western Vidarbha',
    divisionMr: 'पश्चिम विदर्भ',
    keyCommoditiesMr: ['संत्रा', 'सोयाबीन', 'कापूस', 'तूर'],
  },
  Akola: {
    nameEn: 'Akola',
    nameMr: 'अकोला',
    divisionEn: 'Western Vidarbha',
    divisionMr: 'पश्चिम विदर्भ',
    keyCommoditiesMr: ['कापूस', 'सोयाबीन', 'तूर', 'हरभरा'],
  },
  Washim: {
    nameEn: 'Washim',
    nameMr: 'वाशीम',
    divisionEn: 'Western Vidarbha',
    divisionMr: 'पश्चिम विदर्भ',
    keyCommoditiesMr: ['सोयाबीन', 'तूर', 'हरभरा', 'गहू'],
  },
  Buldhana: {
    nameEn: 'Buldhana',
    nameMr: 'बुलढाणा',
    divisionEn: 'Western Vidarbha',
    divisionMr: 'पश्चिम विदर्भ',
    keyCommoditiesMr: ['कापूस', 'सोयाबीन', 'मका', 'तूर'],
  },
  Yavatmal: {
    nameEn: 'Yavatmal',
    nameMr: 'यवतमाळ',
    divisionEn: 'Western Vidarbha',
    divisionMr: 'पश्चिम विदर्भ',
    keyCommoditiesMr: ['कापूस (पांढरे सोने)', 'सोयाबीन', 'तूर', 'चना'],
  },

  // 5. Eastern Vidarbha
  Nagpur: {
    nameEn: 'Nagpur',
    nameMr: 'नागपूर',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['संत्रा', 'सोयाबीन', 'कापूस', 'धान / तांदूळ', 'मिरची'],
  },
  Wardha: {
    nameEn: 'Wardha',
    nameMr: 'वर्धा',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['कापूस', 'सोयाबीन', 'तूर', 'चना'],
  },
  Bhandara: {
    nameEn: 'Bhandara',
    nameMr: 'भंडारा',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['धान / तांदूळ (तुमसर बाजार)', 'सोयाबीन', 'तूर'],
  },
  Gondia: {
    nameEn: 'Gondia',
    nameMr: 'गोंदिया',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['धान / तांदूळ (राईस सिटी)', 'सोयाबीन'],
  },
  Chandrapur: {
    nameEn: 'Chandrapur',
    nameMr: 'चंद्रपूर',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['कापूस', 'धान / तांदूळ', 'सोयाबीन', 'तूर'],
  },
  Gadchiroli: {
    nameEn: 'Gadchiroli',
    nameMr: 'गडचिरोली',
    divisionEn: 'Eastern Vidarbha',
    divisionMr: 'पूर्व विदर्भ',
    keyCommoditiesMr: ['धान / तांदूळ', 'मका', 'वनोपज', 'सोयाबीन'],
  },

  // 6. Konkan & Coastal
  'Navi Mumbai': {
    nameEn: 'Navi Mumbai',
    nameMr: 'नवी मुंबई (वाशी APMC)',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['कांदा-बटाटा', 'फळे व भाजीपाला', 'धान्य'],
  },
  Thane: {
    nameEn: 'Thane',
    nameMr: 'ठाणे',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['भाजीपाला', 'धान / तांदूळ'],
  },
  Palghar: {
    nameEn: 'Palghar',
    nameMr: 'पालघर',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['वाडा कोलम तांदूळ', 'डहाणू चिकू', 'भाजीपाला'],
  },
  Raigad: {
    nameEn: 'Raigad',
    nameMr: 'रायगड',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['धान / तांदूळ', 'भाजीपाला', 'मासे'],
  },
  Ratnagiri: {
    nameEn: 'Ratnagiri',
    nameMr: 'रत्नागिरी',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['हापूस आंबा', 'काजू', 'सुपारी', 'नारळ'],
  },
  Sindhudurg: {
    nameEn: 'Sindhudurg',
    nameMr: 'सिंधुदुर्ग',
    divisionEn: 'Konkan',
    divisionMr: 'कोकण',
    keyCommoditiesMr: ['काजू', 'हापूस आंबा', 'नारळ', 'सुपारी'],
  },
};

export const DIVISIONS = [
  { id: 'all', en: 'All Maharashtra', mr: 'संपूर्ण महाराष्ट्र' },
  { id: 'Western Maharashtra', en: 'Western Maharashtra', mr: 'पश्चिम महाराष्ट्र' },
  { id: 'Khandesh & North', en: 'North Maharashtra / Khandesh', mr: 'उत्तर महाराष्ट्र / खान्देश' },
  { id: 'Marathwada', en: 'Marathwada', mr: 'मराठवाडा' },
  { id: 'Western Vidarbha', en: 'Western Vidarbha', mr: 'पश्चिम विदर्भ' },
  { id: 'Eastern Vidarbha', en: 'Eastern Vidarbha', mr: 'पूर्व विदर्भ' },
  { id: 'Konkan', en: 'Konkan & Coastal', mr: 'कोकण व किनारपट्टी' },
];

export const getDistrictMarathi = (district: string): string => {
  return MAHARASHTRA_DISTRICTS[district]?.nameMr || district;
};

export const getDistrictDisplayName = (district: string, lang: 'mr' | 'en'): string => {
  const info = MAHARASHTRA_DISTRICTS[district];
  if (!info) return district;
  if (lang === 'mr') {
    return `${info.nameMr} (${info.nameEn})`;
  }
  return info.nameEn;
};

export const getDistrictDivision = (district: string) => {
  const info = MAHARASHTRA_DISTRICTS[district];
  if (!info) return null;
  return {
    en: info.divisionEn,
    mr: info.divisionMr,
  };
};
