/**
 * @license
 * SPDX-License-Identifier: MIT
 * Multilingual translation engine (English, Telugu, Hindi)
 */

export type SupportedLanguage = 'en' | 'te' | 'hi';

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  te: 'తెలుగు (Telugu)',
  hi: 'हिन्दी (Hindi)',
};

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    // Brand & App
    appName: 'ScanKavach',
    appTagline: 'Your shield for safer medical image screening',
    appFullTitle: 'Label-Free Anomaly Screening and Decision Support for Medical Images',
    privacyNote: 'Privacy preserved: medical images never leave this device.',
    disclaimerNotice: 'This flags an unusual pattern for clinician review. It is not a diagnosis.',
    decisionSupportNotice:
      'This is an AI-suggested finding from a research prototype, not a confirmed diagnosis and not a medical device. It must be reviewed and confirmed by a qualified doctor or radiologist.',

    // Navigation
    navDashboard: 'Dashboard',
    navBuildBank: 'Build Bank',
    navAnalyze: 'Analyze',
    navBatch: 'Batch Triage',
    navEvaluation: 'Evaluation',
    navConditionModel: 'Condition Model',
    navHealthHub: 'Health Hub',
    navAssistant: 'AI Assistant',
    navModelCard: 'Model Card',
    navQuality: 'Quality',
    navHelp: 'Help & FAQ',
    navAbout: 'About',
    signOut: 'Sign out',

    // Verdicts & Badges
    verdictNormal: 'Normal',
    verdictReview: 'Review',
    verdictRefer: 'Refer',
    borderlineFlag: 'Borderline: needs human review',
    percentilePrefix: 'More unusual than',
    percentileSuffix: 'of healthy validation scans',
    reliabilityHigh: 'High Reliability',
    reliabilityMedium: 'Medium Reliability',
    reliabilityLow: 'Low Reliability',
    abstainNotice: 'Not reliable enough to score: human review needed',

    // Safety Gate
    gatePassedTitle: 'Safety Gate Passed',
    gateRejectedTitle: 'Input Safety Gate Rejection',
    gateReasonColor: 'This is a colour photo. Expected a grayscale medical scan.',
    gateReasonContrast: 'The image has too little contrast to assess.',
    gateReasonBlur: 'The image is too blurry to assess reliably.',
    gateReasonOod:
      'This does not look like the type of scan the reference set was built from (for example, not a chest X-ray).',

    // Fusion
    fusionConsistentNormal: 'Consistent-normal: Both anomaly screening and classifier align as normal.',
    fusionSuggestedCondition: 'AI-suggested finding (decision support)',
    fusionConflict: 'Signals disagree. A clinician review is strongly recommended.',
    fusionInconclusive: 'The model is not confident. Unusual pattern present but condition unclear.',

    // Common Actions
    btnAnalyze: 'Analyze Scan',
    btnExportCsv: 'Export CSV',
    btnDownloadPdf: 'Download report (PDF)',
    btnAskAi: 'Ask AI Assistant',
    btnTakeTour: 'Take the tour',
    btnClearHistory: 'Clear my history',
    btnLoadSample: 'Load sample data',
  },
  te: {
    // Brand & App
    appName: 'ScanKavach',
    appTagline: 'సురక్షితమైన వైద్య ఇమేజ్ స్క్రీనింగ్ కోసం మీ రక్షణ కవచం',
    appFullTitle: 'లేబుల్ రహిత అసహజతల స్క్రీనింగ్ మరియు నిర్ణయ సహాయక వేదిక',
    privacyNote: 'గోప్యత సురక్షితం: వైద్య ఇమేజ్‌లు మీ పరికరాన్ని ఎప్పటికీ దాటి వెళ్ళవు.',
    disclaimerNotice: 'ఇది వైద్యుల సమీక్ష కోసం ఒక అసాధారణ నమూనాను సూచిస్తుంది. ఇది రోగ నిర్ధారణ కాదు.',
    decisionSupportNotice:
      'ఇది పరిశోధనా ప్రోటోటైప్ నుండి రూపొందించబడిన సూచన మాత్రమే, తుది నిర్ధారణ లేదా వైద్య పరికరం కాదు. అర్హత కలిగిన వైద్యులు తప్పక సమీక్షించాలి.',

    // Navigation
    navDashboard: 'డ్యాష్‌బోర్డ్',
    navBuildBank: 'బ్యాంక్ నిర్మించండి',
    navAnalyze: 'విశ్లేషణ',
    navBatch: 'బ్యాచ్ స్క్రీనింగ్',
    navEvaluation: 'మూల్యాంకనం',
    navConditionModel: 'పరిస్థితి నమూనా',
    navHealthHub: 'ఆరోగ్య కేంద్రం',
    navAssistant: 'AI సహాయకుడు',
    navModelCard: 'మోడల్ కార్డ్',
    navQuality: 'నాణ్యత',
    navHelp: 'సహాయం & FAQ',
    navAbout: 'గురించి',
    signOut: 'లాగ్ అవుట్',

    // Verdicts & Badges
    verdictNormal: 'సాధారణం (Normal)',
    verdictReview: 'సమీక్షించండి (Review)',
    verdictRefer: 'సిఫార్సు చేయండి (Refer)',
    borderlineFlag: 'సరిహద్దు స్కోరు: మానవ వైద్యుల సమీక్ష అవసరం',
    percentilePrefix: 'ఆరోగ్యకరమైన ధృవీకరణ స్కాన్‌లలో',
    percentileSuffix: '% కంటే ఎక్కువ భిన్నంగా ఉంది',
    reliabilityHigh: 'అధిక విశ్వసనీయత',
    reliabilityMedium: 'మధ్యస్థ విశ్వసనీయత',
    reliabilityLow: 'తక్కువ విశ్వసనీయత',
    abstainNotice: 'స్కోర్ చేయడానికి తగినంత నమ్మదగినది కాదు: మానవ సమీక్ష అవసరం',

    // Safety Gate
    gatePassedTitle: 'భద్రతా గేట్ ఆమోదించబడింది',
    gateRejectedTitle: 'భద్రతా గేట్ తిరస్కరణ',
    gateReasonColor: 'ఇది రంగు ఫోటో. గ్రేస్కేల్ మెడికల్ స్కాన్ అవసరం.',
    gateReasonContrast: 'ఇమేజ్‌లో తగినంత కాంట్రాస్ట్ లేదు.',
    gateReasonBlur: 'ఇమేజ్ చాలా మసకగా ఉంది, ఖచ్చితంగా అంచనా వేయలేము.',
    gateReasonOod: 'ఇది ఆరోగ్యకరమైన ఛాతీ ఎక్స్-రే నమూనాతో సరిపోలడం లేదు.',

    // Fusion
    fusionConsistentNormal: 'సాధారణంగా స్థిరంగా ఉంది: స్క్రీనింగ్ మరియు వర్గీకరణ రెండూ సాధారణంగా ఉన్నాయి.',
    fusionSuggestedCondition: 'AI-సూచించిన అన్వేషణ (నిర్ణయ మద్దతు)',
    fusionConflict: 'సంకేతాలు విభేదిస్తున్నాయి. వైద్యుల సమీక్ష తప్పనిసరిగా సిఫార్సు చేయబడింది.',
    fusionInconclusive: 'మోడల్‌కు తగినంత విశ్వాసం లేదు. అసాధారణ నమూనా ఉంది కానీ స్పష్టత లేదు.',

    // Common Actions
    btnAnalyze: 'స్కాన్ విశ్లేషించండి',
    btnExportCsv: 'CSV ఎగుమతి చేయండి',
    btnDownloadPdf: 'నివేదికను డౌన్‌లోడ్ చేయండి (PDF)',
    btnAskAi: 'AI సహాయకుడిని అడగండి',
    btnTakeTour: 'గైడెడ్ టూర్ చూడండి',
    btnClearHistory: 'చరిత్రను క్లియర్ చేయండి',
    btnLoadSample: 'నమూనా డేటాను లోడ్ చేయండి',
  },
  hi: {
    // Brand & App
    appName: 'ScanKavach',
    appTagline: 'सुरक्षित मेडिकल इमेज स्क्रीनिंग के लिए आपका रक्षा कवच',
    appFullTitle: 'लेबल-मुक्त विसंगति स्क्रीनिंग और निर्णय सहायता प्रणाली',
    privacyNote: 'गोपनीयता सुरक्षित: मेडिकल इमेज आपके डिवाइस से बाहर कभी नहीं जातीं।',
    disclaimerNotice: 'यह चिकित्सक की समीक्षा के लिए एक असामान्य पैटर्न दर्शाता है। यह कोई निदान नहीं है।',
    decisionSupportNotice:
      'यह शोध प्रोटोटाइप से एक सुझाव मात्र है, कोई अंतिम निदान या चिकित्सा उपकरण नहीं। योग्य चिकित्सक द्वारा समीक्षा अनिवार्य है।',

    // Navigation
    navDashboard: 'डैशबोर्ड',
    navBuildBank: 'बैंक तैयार करें',
    navAnalyze: 'विश्लेषण',
    navBatch: 'बैच स्क्रीनिंग',
    navEvaluation: 'मूल्यांकन',
    navConditionModel: 'कंडीशन मॉडल',
    navHealthHub: 'स्वास्थ्य केंद्र',
    navAssistant: 'AI सहायक',
    navModelCard: 'मॉडल कार्ड',
    navQuality: 'गुणवत्ता',
    navHelp: 'सहायता एवं प्रश्नोत्तर',
    navAbout: 'परिचय',
    signOut: 'लॉग आउट',

    // Verdicts & Badges
    verdictNormal: 'सामान्य (Normal)',
    verdictReview: 'समीक्षा करें (Review)',
    verdictRefer: 'रेफर करें (Refer)',
    borderlineFlag: 'सीमावर्ती स्कोर: मानवीय समीक्षा आवश्यक',
    percentilePrefix: 'स्वस्थ सत्यापन स्कैन के',
    percentileSuffix: '% से अधिक असामान्य',
    reliabilityHigh: 'उच्च विश्वसनीयता',
    reliabilityMedium: 'मध्यम विश्वसनीयता',
    reliabilityLow: 'कम विश्वसनीयता',
    abstainNotice: 'स्कोर के लिए पर्याप्त विश्वसनीय नहीं: मानवीय समीक्षा आवश्यक',

    // Safety Gate
    gatePassedTitle: 'सुरक्षा गेट उत्तीर्ण',
    gateRejectedTitle: 'सुरक्षा गेट द्वारा अस्वीकृत',
    gateReasonColor: 'यह रंगीन फोटो है। ग्रेस्केल मेडिकल स्कैन अपेक्षित है।',
    gateReasonContrast: 'इमेज में कंट्रास्ट बहुत कम है।',
    gateReasonBlur: 'इमेज बहुत धुंधली है, स्पष्ट मूल्यांकन संभव नहीं।',
    gateReasonOod: 'यह रेफरेंस सेट से मेल नहीं खाता (उदा. छाती का एक्स-रे नहीं है)।',

    // Fusion
    fusionConsistentNormal: 'सतत सामान्य: स्क्रीनिंग और क्लासिफायर दोनों सामान्य श्रेणी में हैं।',
    fusionSuggestedCondition: 'AI-सुझाया गया निष्कर्ष (निर्णय समर्थन)',
    fusionConflict: 'संकेत असहमत हैं। चिकित्सक द्वारा समीक्षा की दृढ़ अनुशंसा की जाती है।',
    fusionInconclusive: 'मॉडल पर्याप्त आश्वस्त नहीं है। असामान्य पैटर्न मौजूद है पर स्थिति अस्पष्ट है।',

    // Common Actions
    btnAnalyze: 'स्कैन का विश्लेषण करें',
    btnExportCsv: 'CSV निर्यात करें',
    btnDownloadPdf: 'रिपोर्ट डाउनलोड करें (PDF)',
    btnAskAi: 'AI सहायक से पूछें',
    btnTakeTour: 'टूर देखें',
    btnClearHistory: 'इतिहास साफ़ करें',
    btnLoadSample: 'सैंपल डेटा लोड करें',
  },
};

/**
 * Retrieves translation by key with automatic fallback to English
 */
export function t(key: string, lang: SupportedLanguage = 'en'): string {
  const table = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return table[key] ?? TRANSLATIONS.en[key] ?? key;
}

export function setAppLanguage(lang: SupportedLanguage): void {
  try {
    localStorage.setItem('scankavach_lang', lang);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  } catch {
    // fallback
  }
}

export function getAppLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem('scankavach_lang') as SupportedLanguage | null;
    if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
      return saved;
    }
  } catch {
    // fallback
  }
  return 'en';
}
