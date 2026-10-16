import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Language, MarketPriceRecord, NavTab } from '../types/marketPrice';
import { AppAction, AssistantMessage } from '../types/assistant';
import { voiceService } from '../services/voiceService';
import { geminiAssistantService, ChatContext } from '../services/geminiAssistantService';
import {
  Mic,
  MicOff,
  Send,
  X,
  Volume2,
  VolumeX,
  Camera,
  MessageSquare,
  Sparkles,
  Minimize2,
  Dock,
  RefreshCw,
  SlidersHorizontal,
  Scale,
  TrendingUp,
  ArrowUpDown,
  RotateCcw,
  Compass,
  HelpCircle,
  CheckCircle2,
  MapPin,
  Radio,
  Layers,
  ChevronRight,
} from 'lucide-react';

export type AssistantViewMode = 'side-panel' | 'floating';
export type AssistantTab = 'chat' | 'commands';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  activeTab: NavTab;
  records: MarketPriceRecord[];
  onExecuteAction: (action: AppAction) => void;
  currentCrop?: string;
  currentMarket?: string;
  compareMarkets?: string[];
  trendTimeRange?: string;
  pendingPrompt?: string | null;
  onClearPendingPrompt?: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  lang,
  activeTab,
  records,
  onExecuteAction,
  currentCrop,
  currentMarket,
  compareMarkets,
  trendTimeRange,
  pendingPrompt,
  onClearPendingPrompt,
}) => {
  const [viewMode, setViewMode] = useState<AssistantViewMode>('side-panel');
  const [activeSubTab, setActiveSubTab] = useState<AssistantTab>('chat');
  const [selectedCommandCategory, setSelectedCommandCategory] = useState<string>('crops');

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text:
        lang === 'mr'
          ? 'नमस्कार शेतकरी मित्र! मी तुमचा स्मार्ट शेतकरी व्हॉइस सहाय्यक आहे. तुम्ही मला थेट मराठीत बोलून ९०%+ ॲप नियंत्रित करू शकता:\n\n• "लासलगाव कांदा भाव दाखवा"\n• "लासलगाव व पुणे कांदा तुलना करा"\n• "३० दिवसांचा भाव कल दाखवा"\n• "आजचे ताजे भाव सिंक करा"\n• "जास्त भाव आधी लावा"\n• "सर्व फिल्टर काढून टाका"\n• "नवीन डेटा स्रोत जोडा"\n• "सरासरी भाव म्हणजे काय"\n\nखालील माईक दाबा आणि बोला!'
          : 'Hello farmer friend! I am your Smart Shetkari Voice Assistant. You can control 90%+ of the app using voice in your regional language:\n\n• "Show Lasalgaon Onion price"\n• "Compare Lasalgaon and Pune Onion"\n• "Show 30-day price trend"\n• "Sync today\'s fresh APMC rates"\n• "Sort by highest price"\n• "Clear all filters"\n• "Add new data source"\n• "Explain price terms"\n\nTap the mic below and start speaking!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
  const [continuousVoice, setContinuousVoice] = useState<boolean>(false); // Continuous hands-free toggle
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Selected crop photo state
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
    mimeType: string;
    data: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Refs to avoid stale closures in audio onEnd callbacks
  const continuousVoiceRef = useRef(continuousVoice);
  continuousVoiceRef.current = continuousVoice;
  const isOpenRef = useRef(isOpen);
  isOpenRef.current = isOpen;
  const isListeningRef = useRef(isListening);
  isListeningRef.current = isListening;

  useEffect(() => {
    if (activeSubTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, interimTranscript, isLoading, activeSubTab]);

  useEffect(() => {
    if (!isOpen) {
      voiceService.stopListening();
      voiceService.stopSpeaking();
      setIsListening(false);
    } else {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  // Handle external pending prompts triggered from inline page suggestions
  useEffect(() => {
    if (pendingPrompt && isOpen) {
      handleSend(pendingPrompt);
      if (onClearPendingPrompt) {
        onClearPendingPrompt();
      }
    }
  }, [pendingPrompt, isOpen]);

  const buildContext = (): ChatContext => {
    const crops = Array.from(new Set(records.map(r => r.cropName)));
    const markets = Array.from(new Set(records.map(r => r.marketName)));
    const samplePrices = records.slice(0, 10).map(r => ({
      crop: r.cropName,
      market: r.marketName,
      modalPrice: r.modalPrice,
      date: r.observationDate,
    }));

    return {
      activeTab,
      lang,
      availableCrops: crops,
      availableMarkets: markets,
      samplePrices,
      selectedCrop: currentCrop,
      selectedMarket: currentMarket,
      compareMarkets: compareMarkets,
      trendTimeRange: trendTimeRange,
    };
  };

  const startVoiceListening = () => {
    if (isListeningRef.current) return;
    setIsListening(true);
    setInterimTranscript('');
    voiceService.startListening(
      lang,
      (text, isFinal) => {
        if (isFinal) {
          setInputText(text);
          setIsListening(false);
          handleSend(text);
        } else {
          setInterimTranscript(text);
        }
      },
      error => {
        console.warn('Voice input error:', error);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && !selectedImage) return;

    // Switch back to chat view so farmer sees their command being executed
    if (activeSubTab !== 'chat') {
      setActiveSubTab('chat');
    }

    const userMessage: AssistantMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      image: selectedImage
        ? {
            mimeType: selectedImage.mimeType,
            data: selectedImage.data,
            previewUrl: selectedImage.previewUrl,
          }
        : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setInterimTranscript('');
    const currentSelectedImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      let replyText = '';
      let actions: AppAction[] = [];
      let suggestedPrompts: string[] = [];

      if (currentSelectedImage) {
        // Multi-modal crop photo inspection
        const analysis = await geminiAssistantService.analyzeCropPhoto(
          currentSelectedImage.data,
          currentSelectedImage.mimeType,
          textToSend || undefined,
          lang
        );

        replyText = `${analysis.spokenReply}\n\n${lang === 'mr' ? 'पीक ओळख: ' : 'Crop: '}${analysis.cropIdentified}\n${lang === 'mr' ? 'प्रत (Grade): ' : 'Quality Grade: '}${analysis.qualityGrade}\n${lang === 'mr' ? 'अपेक्षित श्रेणी: ' : 'Expected Bracket: '}${analysis.expectedPriceCategory}\n\n${analysis.conditionSummary}\n\n${analysis.detailedAdvice}`;
        actions = analysis.actions || [];
        suggestedPrompts =
          lang === 'mr'
            ? [
                `${analysis.cropIdentified} चे आजचे बाजार भाव दाखवा`,
                `या पिकासाठी कोणता बाजार चांगला?`,
                `प्रत सुधारण्यासाठी सल्ला`,
              ]
            : [
                `Show current prices for ${analysis.cropIdentified}`,
                `Which market is best for this crop?`,
                `Tips to improve quality`,
              ];
      } else {
        const response = await geminiAssistantService.sendMessage(
          newMessages,
          buildContext(),
          'gemini-3.8-flash'
        );

        replyText = response.reply;
        actions = response.actions;
        suggestedPrompts = response.suggestedPrompts;
      }

      const assistantMessage: AssistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'model',
        text: replyText,
        actions: actions,
        suggestedPrompts: suggestedPrompts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Direct Programmatic Execution of 90%+ App Features
      if (actions && actions.length > 0) {
        actions.forEach(action => {
          onExecuteAction(action);
        });
      }

      // Spoken Voice Feedback (with continuous voice chaining)
      if (autoSpeak) {
        setSpeakingMessageId(assistantMessage.id);
        voiceService.speak(
          replyText,
          lang,
          () => setSpeakingMessageId(assistantMessage.id),
          () => {
            setSpeakingMessageId(null);
            // If continuous hands-free voice mode is active, automatically listen for the next command!
            if (continuousVoiceRef.current && isOpenRef.current) {
              setTimeout(() => {
                if (isOpenRef.current && !isListeningRef.current) {
                  startVoiceListening();
                }
              }, 450);
            }
          }
        );
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: AssistantMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        text:
          lang === 'mr'
            ? 'माफ करा, संपर्क साधताना अडचण आली. कृपया पुन्हा प्रयत्न करा.'
            : 'Sorry, unable to connect right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleVoice = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      startVoiceListening();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const converted = await geminiAssistantService.fileToBase64(file);
      setSelectedImage({
        file,
        previewUrl: converted.previewUrl,
        mimeType: converted.mimeType,
        data: converted.data,
      });
    } catch (err) {
      console.error('Error preparing image:', err);
    }
  };

  const handleReplayAudio = (msgId: string, text: string) => {
    if (speakingMessageId === msgId) {
      voiceService.stopSpeaking();
      setSpeakingMessageId(null);
    } else {
      setSpeakingMessageId(msgId);
      voiceService.speak(
        text,
        lang,
        () => setSpeakingMessageId(msgId),
        () => setSpeakingMessageId(null)
      );
    }
  };

  // Contextual quick suggestions that adapt to the active page
  const getContextualPrompts = (): string[] => {
    switch (activeTab) {
      case 'prices':
        return lang === 'mr'
          ? [
              'लासलगाव कांदा भाव दाखवा',
              'लातूर सोयाबीन भाव दाखवा',
              'जास्त भाव आधी लावा',
              'सर्व फिल्टर काढून टाका',
              'आजचे ताजे भाव सिंक करा',
              'विदर्भ विभाग भाव दाखवा',
            ]
          : [
              'Show Lasalgaon Onion price',
              'Show Latur Soybean rate',
              'Sort by Highest Price',
              'Clear All Filters',
              "Sync Today's Rates",
              'Filter Vidarbha Division',
            ];

      case 'compare':
        return lang === 'mr'
          ? [
              'लासलगाव आणि पुणे कांदा तुलना करा',
              'लातूर आणि अकोला सोयाबीन तुलना',
              'जळगाव व यवतमाळ कापूस तुलना',
              'कांदा भाव कल दाखवा',
            ]
          : [
              'Compare Lasalgaon and Pune Onion',
              'Compare Latur and Akola Soybean',
              'Compare Jalgaon and Yavatmal Cotton',
              'View Onion Price Trend',
            ];

      case 'trends':
        return lang === 'mr'
          ? [
              'लासलगाव कांद्याचा भाव कल दाखवा',
              '७ दिवसांचा कल दाखवा',
              '३० दिवसांचा कल दाखवा',
              '९० दिवसांचा कल दाखवा',
              'बाजार तुलना स्क्रीन उघडा',
            ]
          : [
              'Show Lasalgaon Onion Trend',
              'Show 7 Days Trend',
              'Show 30 Days Trend',
              'Show 90 Days Trend',
              'Open Market Comparison',
            ];

      case 'sources':
        return lang === 'mr'
          ? [
              'नवीन डेटा स्रोत जोडा',
              'अ‍ॅगमार्कनेट पोर्टल माहिती सांगा',
              'आजचे ताजे भाव सिंक करा',
              'बाजार भाव स्क्रीनवर जा',
            ]
          : [
              'Add New Data Source',
              'Agmarknet Portal Info',
              "Sync Today's Rates",
              'Go to Market Prices Screen',
            ];

      default:
        return [];
    }
  };

  // Voice Command Directory for the 90%+ App Control Hub
  const commandCategories = useMemo(() => [
    {
      id: 'crops',
      labelMr: '🌾 पिके व भाव (Crops)',
      labelEn: '🌾 Crops & Prices',
      commands: [
        { labelMr: 'लासलगाव कांदा भाव', labelEn: 'Lasalgaon Onion Rate', prompt: 'लासलगाव कांदा भाव दाखवा' },
        { labelMr: 'लातूर सोयाबीन भाव', labelEn: 'Latur Soybean Rate', prompt: 'लातूर सोयाबीन भाव दाखवा' },
        { labelMr: 'जळगाव कापूस भाव', labelEn: 'Jalgaon Cotton Rate', prompt: 'जळगाव कापूस भाव दाखवा' },
        { labelMr: 'नारायणगाव टोमॅटो भाव', labelEn: 'Narayangaon Tomato', prompt: 'नारायणगाव टोमॅटो भाव दाखवा' },
        { labelMr: 'सांगली हळद भाव', labelEn: 'Sangli Turmeric', prompt: 'सांगली हळद भाव दाखवा' },
        { labelMr: 'सोलापूर डाळिंब भाव', labelEn: 'Solapur Pomegranate', prompt: 'सोलापूर डाळिंब भाव दाखवा' },
        { labelMr: 'तुमसर धान / भात भाव', labelEn: 'Tumsar Paddy Rate', prompt: 'तुमसर धान भाव दाखवा' },
        { labelMr: 'नंदुरबार मिरची भाव', labelEn: 'Nandurbar Chilli', prompt: 'नंदुरबार मिरची भाव दाखवा' },
        { labelMr: 'मोर्शी संत्रा भाव', labelEn: 'Morshi Orange Hub', prompt: 'मोर्शी संत्रा भाव दाखवा' },
        { labelMr: 'कराड आले भाव', labelEn: 'Karad Ginger', prompt: 'कराड आले भाव दाखवा' },
        { labelMr: 'तासगाव बेदाणा भाव', labelEn: 'Tasgaon Raisins', prompt: 'तासगाव बेदाणा भाव दाखवा' },
        { labelMr: 'लातूर तूर भाव', labelEn: 'Latur Tur Rate', prompt: 'लातूर तूर भाव दाखवा' },
        { labelMr: 'अकोला हरभरा भाव', labelEn: 'Akola Chana Rate', prompt: 'अकोला हरभरा भाव दाखवा' },
        { labelMr: 'पुणे गहू भाव', labelEn: 'Pune Wheat Rate', prompt: 'पुणे गहू भाव दाखवा' },
        { labelMr: 'नाशिक मका भाव', labelEn: 'Nashik Maize Rate', prompt: 'नाशिक मका भाव दाखवा' },
      ],
    },
    {
      id: 'districts',
      labelMr: '🏛️ जिल्हे व विभाग (Districts)',
      labelEn: '🏛️ Districts & Divisions',
      commands: [
        { labelMr: 'विदर्भ (अमरावती विभाग)', labelEn: 'Vidarbha Division', prompt: 'विदर्भ विभाग दाखवा' },
        { labelMr: 'नागपूर विभाग भाव', labelEn: 'Nagpur Division', prompt: 'नागपूर विभाग दाखवा' },
        { labelMr: 'मराठवाडा विभाग भाव', labelEn: 'Marathwada Division', prompt: 'मराठवाडा विभाग दाखवा' },
        { labelMr: 'पश्चिम महाराष्ट्र (पुणे)', labelEn: 'Western Maharashtra', prompt: 'पश्चिम महाराष्ट्र दाखवा' },
        { labelMr: 'उत्तर महाराष्ट्र (खानदेश)', labelEn: 'North Maharashtra', prompt: 'उत्तर महाराष्ट्र दाखवा' },
        { labelMr: 'कोकण विभाग (वाशी)', labelEn: 'Konkan Division', prompt: 'कोकण विभाग दाखवा' },
        { labelMr: 'नाशिक जिल्हा भाव', labelEn: 'Nashik District', prompt: 'नाशिक जिल्ह्यातील भाव दाखवा' },
        { labelMr: 'पुणे जिल्हा भाव', labelEn: 'Pune District', prompt: 'पुणे जिल्ह्यातील भाव दाखवा' },
        { labelMr: 'लातूर जिल्हा भाव', labelEn: 'Latur District', prompt: 'लातूर जिल्ह्यातील भाव दाखवा' },
        { labelMr: 'सोलापूर जिल्हा भाव', labelEn: 'Solapur District', prompt: 'सोलापूर जिल्ह्यातील भाव दाखवा' },
        { labelMr: 'जळगाव जिल्हा भाव', labelEn: 'Jalgaon District', prompt: 'जळगाव जिल्ह्यातील भाव दाखवा' },
        { labelMr: 'अमरावती जिल्हा भाव', labelEn: 'Amravati District', prompt: 'अमरावती जिल्ह्यातील भाव दाखवा' },
      ],
    },
    {
      id: 'compare',
      labelMr: '⚖️ बाजार तुलना (Compare)',
      labelEn: '⚖️ Compare Mandis',
      commands: [
        { labelMr: 'लासलगाव व पुणे कांदा तुलना', labelEn: 'Compare Lasalgaon & Pune Onion', prompt: 'लासलगाव आणि पुणे कांदा तुलना करा' },
        { labelMr: 'लातूर व अकोला सोयाबीन तुलना', labelEn: 'Compare Latur & Akola Soybean', prompt: 'लातूर आणि अकोला सोयाबीन तुलना करा' },
        { labelMr: 'जळगाव व अमरावती कापूस तुलना', labelEn: 'Compare Jalgaon & Amravati Cotton', prompt: 'जळगाव आणि अमरावती कापूस तुलना करा' },
        { labelMr: 'नारायणगाव व पिंपळगाव टोमॅटो तुलना', labelEn: 'Compare Tomato Mandis', prompt: 'नारायणगाव आणि पिंपळगाव टोमॅटो तुलना' },
        { labelMr: 'सांगली व वसमत हळद तुलना', labelEn: 'Compare Turmeric Mandis', prompt: 'सांगली आणि वसमत हळद तुलना' },
        { labelMr: 'सोलापूर व सांगली डाळिंब तुलना', labelEn: 'Compare Pomegranate Mandis', prompt: 'सोलापूर आणि सांगली डाळिंब तुलना' },
      ],
    },
    {
      id: 'trends',
      labelMr: '📈 भाव कल (Price Trends)',
      labelEn: '📈 Trends & Timeframe',
      commands: [
        { labelMr: 'लासलगाव कांदा भाव कल', labelEn: 'Lasalgaon Onion Trend', prompt: 'लासलगाव कांद्याचा भाव कल दाखवा' },
        { labelMr: 'लातूर सोयाबीन भाव कल', labelEn: 'Latur Soybean Trend', prompt: 'लातूर सोयाबीन भाव कल दाखवा' },
        { labelMr: 'गेल्या ७ दिवसांचा कल', labelEn: '7 Days Timeframe', prompt: '७ दिवसांचा कल दाखवा' },
        { labelMr: 'गेल्या ३० दिवसांचा कल', labelEn: '30 Days Timeframe', prompt: '३० दिवसांचा कल दाखवा' },
        { labelMr: 'गेल्या ९० दिवसांचा कल (३ महिने)', labelEn: '90 Days Timeframe', prompt: '९० दिवसांचा कल दाखवा' },
        { labelMr: 'सर्व उपलब्ध कल दाखवा', labelEn: 'All Historical Trend', prompt: 'सर्व कल दाखवा' },
      ],
    },
    {
      id: 'sort',
      labelMr: '↕️ क्रमवारी (Sorting)',
      labelEn: '↕️ Sort Rates',
      commands: [
        { labelMr: 'जास्त भाव आधी लावा (कमाल दर)', labelEn: 'Sort: Highest Price First', prompt: 'जास्त भाव आधी लावा' },
        { labelMr: 'कमी भाव आधी लावा (किमान दर)', labelEn: 'Sort: Lowest Price First', prompt: 'कमी भाव आधी लावा' },
        { labelMr: 'नवीनतम तारीख (ताजी नोंदणी)', labelEn: 'Sort: Recent Date First', prompt: 'नवीनतम नोंदणी तारीख लावा' },
        { labelMr: 'बाजार अ-झा (नावांनुसार)', labelEn: 'Sort: Mandi Name A to Z', prompt: 'बाजाराच्या नावानुसार लावा' },
      ],
    },
    {
      id: 'tools',
      labelMr: '🔄 सिंक व साधने (Tools)',
      labelEn: '🔄 Sync & App Tools',
      commands: [
        { labelMr: 'आजचे ताजे भाव सिंक करा', labelEn: "Sync Today's Rates", prompt: 'आजचे ताजे भाव सिंक करा' },
        { labelMr: 'सर्व फिल्टर काढून टाका (सर्व पिके)', labelEn: 'Clear All Active Filters', prompt: 'सर्व फिल्टर काढून टाका' },
        { labelMr: 'नवीन डेटा स्रोत जोडा', labelEn: 'Add New Mandi Source', prompt: 'नवीन डेटा स्रोत जोडा' },
        { labelMr: 'भावांचे प्रकार समजावून सांगा', labelEn: 'Explain Price Types (Modal/Min/Max)', prompt: 'सरासरी भाव म्हणजे काय' },
        { labelMr: 'अधिकृत डेटा रीलोड करा', labelEn: 'Reload Official APMC Data', prompt: 'अधिकृत डेटा रीलोड करा' },
        { labelMr: 'इंग्रजी भाषा करा / मराठी करा', labelEn: 'Toggle Language', prompt: lang === 'mr' ? 'इंग्रजी भाषा करा' : 'मराठी भाषा करा' },
      ],
    },
  ], [lang]);

  const getTabBadge = () => {
    switch (activeTab) {
      case 'prices':
        return lang === 'mr' ? 'बाजार भाव' : 'Prices';
      case 'compare':
        return lang === 'mr' ? 'बाजार तुलना' : 'Compare';
      case 'trends':
        return lang === 'mr' ? 'भाव कल' : 'Trends';
      case 'sources':
        return lang === 'mr' ? 'डेटा स्रोत' : 'Sources';
      default:
        return '';
    }
  };

  if (!isOpen) return null;

  const isSidePanel = viewMode === 'side-panel';

  return (
    <>
      {/* Semi-transparent backdrop on mobile or when side panel is open */}
      <div
        className={`fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px] transition-opacity md:${
          isSidePanel ? 'bg-transparent pointer-events-none' : 'bg-black/25'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === 'mr' ? 'शेतकरी AI मदतनीस' : 'Farmer AI Assistant'}
        className={`fixed z-50 flex flex-col bg-white border border-[#E2E5DC] shadow-2xl transition-all duration-200 overflow-hidden ${
          isSidePanel
            ? 'top-0 right-0 bottom-0 w-full sm:w-[460px] md:w-[500px] h-full sm:rounded-l-2xl border-r-0'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[440px] h-[600px] max-h-[85vh] rounded-2xl'
        }`}
      >
        {/* 1. Top Header with SaaS Controls */}
        <div className="bg-white px-3.5 sm:px-4 py-2.5 border-b border-[#E2E5DC] shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#244638] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mic className="w-4 h-4 text-emerald-300" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm text-[#202821] truncate">
                    {lang === 'mr' ? 'स्मार्ट शेतकरी व्हॉइस सहाय्यक' : 'Smart Shetkari Voice AI'}
                  </h2>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-[#244638] shrink-0">
                    ९०%+ ॲप नियंत्रण
                  </span>
                </div>
                <div className="text-[11px] text-[#667168] truncate flex items-center gap-1">
                  <span>{lang === 'mr' ? 'सध्याचे पान: ' : 'Active: '}</span>
                  <strong className="text-[#244638] font-medium">{getTabBadge()}</strong>
                  {currentCrop && (
                    <>
                      <span>·</span>
                      <span className="truncate">{currentCrop}</span>
                    </>
                  )}
                  {currentMarket && (
                    <>
                      <span>·</span>
                      <span className="truncate">{currentMarket}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Continuous Voice Mode Toggle */}
              <button
                type="button"
                onClick={() => setContinuousVoice(!continuousVoice)}
                className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                  continuousVoice
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
                }`}
                title={
                  continuousVoice
                    ? lang === 'mr'
                      ? 'हँड्स-फ्री सतत व्हॉइस चालू आहे (उत्तरोत्तर आपोआप ऐकले जाईल)'
                      : 'Continuous Hands-Free Voice is ON'
                    : lang === 'mr'
                    ? 'हँड्स-फ्री सतत व्हॉइस चालू करा'
                    : 'Turn ON Continuous Hands-Free Voice'
                }
              >
                <Radio className={`w-3.5 h-3.5 ${continuousVoice ? 'animate-pulse' : ''}`} />
                <span className="hidden lg:inline text-[11px]">
                  {continuousVoice ? (lang === 'mr' ? 'हँड्स-फ्री चालू' : 'Hands-free ON') : (lang === 'mr' ? 'हँड्स-फ्री' : 'Hands-free')}
                </span>
              </button>

              {/* Toggle View Mode (Side Panel vs Floating) */}
              <button
                type="button"
                onClick={() => setViewMode(prev => (prev === 'side-panel' ? 'floating' : 'side-panel'))}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title={isSidePanel ? 'Floating' : 'Dock Panel'}
                aria-label="Toggle layout mode"
              >
                {isSidePanel ? <Minimize2 className="w-4 h-4" /> : <Dock className="w-4 h-4" />}
              </button>

              {/* Audio Read Aloud Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (autoSpeak) {
                    voiceService.stopSpeaking();
                    setSpeakingMessageId(null);
                  }
                  setAutoSpeak(!autoSpeak);
                }}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  autoSpeak
                    ? 'text-[#244638] bg-emerald-50 hover:bg-emerald-100'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
                title={autoSpeak ? (lang === 'mr' ? 'आवाज मूक करा' : 'Mute voice') : (lang === 'mr' ? 'आवाज चालू करा' : 'Unmute voice')}
                aria-label="Toggle voice output"
              >
                {autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title={lang === 'mr' ? 'बंद करा' : 'Close'}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sub-Tabs: Chat Conversation vs 90% Voice Command Directory */}
          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-[#E2E5DC]">
            <button
              type="button"
              onClick={() => setActiveSubTab('chat')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'chat'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{lang === 'mr' ? 'संभाषण (Chat & Voice)' : 'Chat & Voice'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('commands')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSubTab === 'commands'
                  ? 'bg-[#244638] text-white shadow-xs'
                  : 'bg-[#F8F5EC] text-[#202821] hover:bg-slate-200'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-amber-500" />
              <span>{lang === 'mr' ? '९०% व्हॉइस कमांड केंद्र' : '90% Voice Control Hub'}</span>
            </button>
          </div>
        </div>

        {/* Dynamic Voice Status Banner with Audio Waveform */}
        <div className={`px-3.5 py-1.5 border-b flex items-center justify-between text-xs shrink-0 transition-colors ${
          isListening
            ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
            : 'bg-emerald-50/90 border-emerald-200/80 text-emerald-950'
        }`}>
          <div className="flex items-center gap-2 font-medium">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isListening ? 'bg-rose-500' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isListening ? 'bg-rose-600' : 'bg-emerald-600'
              }`}></span>
            </span>
            <span className="font-bold">
              {isListening
                ? (lang === 'mr' ? '🎤 मी ऐकत आहे... (मराठीत बोला)' : '🎤 Listening... (Speak now)')
                : (lang === 'mr' ? 'व्हॉइस मोड सक्रिय (मराठी बोलीभाषा)' : 'Voice Mode Active')}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-700">
            {continuousVoice && (
              <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-[#244638] font-semibold text-[10px]">
                {lang === 'mr' ? 'सतत संवाद चालू' : 'Continuous Mode'}
              </span>
            )}
            <span>{lang === 'mr' ? 'mr-IN (मराठी)' : 'en-IN (English)'}</span>
          </div>
        </div>

        {/* 2. Main Content Area */}
        {activeSubTab === 'chat' ? (
          /* CHAT CONVERSATION VIEW */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F8F5EC]/70">
            {/* Contextual Quick Suggestions Strip */}
            <div className="bg-white/80 p-2 rounded-xl border border-[#E2E5DC] mb-1">
              <div className="flex items-center justify-between text-[11px] text-[#667168] mb-1">
                <span className="font-semibold flex items-center gap-1 text-[#244638]">
                  <Sparkles className="w-3 h-3 text-[#2D7652]" />
                  {lang === 'mr' ? 'सध्याच्या पानावरील त्वरित व्हॉइस आज्ञा:' : 'Contextual quick voice commands:'}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {getContextualPrompts().map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(prompt)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-[#F8F5EC] hover:bg-[#244638] text-[#244638] hover:text-white border border-[#D5DCD0] transition-colors text-left truncate max-w-full cursor-pointer font-medium"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>

            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[92%] rounded-xl p-3 text-sm leading-relaxed shadow-xs ${
                    msg.role === 'user'
                      ? 'bg-[#244638] text-white'
                      : 'bg-white text-[#202821] border border-[#E2E5DC]'
                  }`}
                >
                  {msg.image && (
                    <div className="rounded-lg overflow-hidden mb-2 border border-slate-200 max-h-48 bg-slate-100">
                      <img
                        src={msg.image.previewUrl || `data:${msg.image.mimeType};base64,${msg.image.data}`}
                        alt="Crop produce"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  )}

                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Executed App Actions Notification */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="pt-2 mt-2 border-t border-slate-100 text-xs space-y-1">
                      {msg.actions.map((act, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-[#18352B] border border-emerald-300 font-medium"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="font-bold text-emerald-950">
                            {lang === 'mr' ? '⚡ ९०% ॲप कृती: ' : '⚡ App Action: '}
                          </span>
                          <span className="text-xs">
                            {lang === 'mr' ? act.labelMr : act.labelEn}
                            {!act.labelMr && !act.labelEn && (
                              <>
                                {act.type === 'switch_tab' && `स्क्रीन बदलली: ${act.tab}`}
                                {act.type === 'filter_prices' && `${act.crop || 'सर्व पिके'} · ${act.district || act.division || 'सर्व जिल्हे'}`}
                                {act.type === 'clear_filters' && 'सर्व फिल्टर काढले'}
                                {act.type === 'sort_prices' && `क्रमवारी: ${act.sortBy}`}
                                {act.type === 'compare_markets' && `तुलना: ${act.crop || 'बाजार'}`}
                                {act.type === 'view_trend' && `भाव कल: ${act.crop}`}
                                {act.type === 'sync_live_prices' && 'थेट भाव सिंक केले'}
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between text-[11px] pt-1.5 mt-1 ${
                      msg.role === 'user' ? 'text-emerald-100 border-t border-emerald-800/40' : 'text-[#667168] border-t border-slate-100'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.role === 'model' && (
                      <button
                        type="button"
                        onClick={() => handleReplayAudio(msg.id, msg.text)}
                        className="hover:underline flex items-center gap-1 cursor-pointer font-medium text-[#244638]"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>{speakingMessageId === msg.id ? (lang === 'mr' ? 'थांबवा' : 'Stop') : (lang === 'mr' ? 'ऐका' : 'Listen')}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Follow-up Suggestions */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[90%]">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleSend(prompt)}
                        className="text-xs px-2.5 py-1 bg-white hover:bg-[#244638] text-[#202821] hover:text-white border border-[#E2E5DC] rounded-lg text-left transition-colors cursor-pointer shadow-2xs font-medium"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Active Voice Listening Waveform Banner */}
            {isListening && (
              <div className="p-3 bg-white border border-rose-300 rounded-xl text-rose-900 text-xs shadow-sm space-y-2">
                <div className="flex items-center justify-between font-bold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                    <span>{lang === 'mr' ? 'मी ऐकत आहे... (मराठीत बोला)' : 'Listening to your voice in Marathi/English...'}</span>
                  </div>
                  {/* Equalizer soundwave visualizer */}
                  <div className="flex items-end gap-1 h-4">
                    <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-2"></span>
                    <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.6s_ease-in-out_0.2s_infinite] h-4"></span>
                    <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.4s_infinite] h-3"></span>
                    <span className="w-1 bg-rose-600 rounded-full animate-[bounce_0.6s_ease-in-out_0.1s_infinite] h-4"></span>
                    <span className="w-1 bg-rose-500 rounded-full animate-[bounce_0.6s_ease-in-out_0.3s_infinite] h-2"></span>
                  </div>
                </div>
                <div className="font-mono text-slate-900 bg-rose-50/80 p-2.5 rounded-lg border border-rose-100 text-sm">
                  {interimTranscript || (lang === 'mr' ? 'उदा. "लासलगाव कांदा भाव दाखवा" किंवा "जास्त भाव आधी लावा"' : 'e.g. "Show Lasalgaon Onion price" or "Sort by High Price"')}
                </div>
              </div>
            )}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-white border border-[#E2E5DC] rounded-xl text-xs text-[#667168] max-w-[80%] shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-[#244638]">
                  {lang === 'mr' ? 'माहिती शोधत आहे व ॲप आज्ञा तयार करत आहे...' : 'Processing voice command & executing app action...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* 90% VOICE COMMAND DIRECTORY HUB */
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#F8F5EC]/70 space-y-3">
            <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#244638]">
                <Radio className="w-4 h-4 text-emerald-600" />
                <span>{lang === 'mr' ? '९०%+ व्हॉइस नियंत्रण मार्गदर्शक' : '90%+ Voice Control Directory'}</span>
              </div>
              <p className="text-[11px] text-[#667168] leading-relaxed">
                {lang === 'mr'
                  ? 'खालीलपैकी कोणताही शब्द थेट माईकमध्ये बोला किंवा थेट कार्डवर क्लिक करा. सहाय्यक संपूर्ण ॲपवर त्वरित कृती करेल!'
                  : 'Speak any phrase below into the mic or click the card. The assistant directly executes the corresponding app action.'}
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {commandCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCommandCategory(cat.id)}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                    selectedCommandCategory === cat.id
                      ? 'bg-[#244638] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-[#E2E5DC]'
                  }`}
                >
                  {lang === 'mr' ? cat.labelMr : cat.labelEn}
                </button>
              ))}
            </div>

            {/* Command Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {commandCategories
                .find(c => c.id === selectedCommandCategory)
                ?.commands.map((cmd, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(cmd.prompt)}
                    className="p-2.5 bg-white hover:bg-emerald-50/80 border border-[#E2E5DC] hover:border-emerald-300 rounded-xl text-left transition-all group flex items-center justify-between gap-2 shadow-2xs cursor-pointer"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-xs text-[#202821] group-hover:text-[#244638] truncate">
                        {lang === 'mr' ? cmd.labelMr : cmd.labelEn}
                      </div>
                      <div className="text-[11px] text-[#667168] truncate italic">
                        "{cmd.prompt}"
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#244638] group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* 3. Photo Preview Bar (if uploaded) */}
        {selectedImage && (
          <div className="px-3.5 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={selectedImage.previewUrl}
                alt="Upload preview"
                className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shrink-0"
              />
              <span className="text-xs text-emerald-900 truncate font-medium">
                {selectedImage.file.name}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded text-emerald-800 hover:bg-emerald-100 cursor-pointer"
              aria-label="Remove photo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* 4. Farmer-friendly Voice Input Bar */}
        <div className="p-2.5 sm:p-3 bg-white border-t border-[#E2E5DC] shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-1.5 sm:gap-2"
          >
            {/* Hidden File Input for Camera/Gallery */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            {/* Photo Upload Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-2.5 text-slate-600 hover:text-[#244638] hover:bg-slate-100 rounded-xl border border-[#E2E5DC] transition-colors shrink-0 cursor-pointer"
              title={lang === 'mr' ? 'पिकाचा फोटो जोडा' : 'Add crop photo'}
              aria-label="Upload crop photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Microphone Voice Button (Big & Prominent) */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 sm:p-2.5 rounded-xl border transition-all shrink-0 cursor-pointer flex items-center gap-1.5 font-bold text-xs ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 shadow-md animate-pulse ring-2 ring-rose-300'
                  : 'bg-emerald-50 text-[#244638] hover:bg-[#244638] hover:text-white border-emerald-300'
              }`}
              title={isListening ? (lang === 'mr' ? 'माईक बंद करा' : 'Stop voice') : (lang === 'mr' ? 'माईक चालू करा' : 'Start speaking')}
              aria-label="Voice input"
            >
              {isListening ? (
                <>
                  <MicOff className="w-4 h-4 animate-bounce" />
                  <span className="hidden sm:inline">{lang === 'mr' ? 'थांबवा' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span className="hidden sm:inline">{lang === 'mr' ? 'बोला' : 'Speak'}</span>
                </>
              )}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'मराठीत बोला किंवा येथे लिहा (उदा. "लासलगाव कांदा भाव")...'
                  : 'Speak or type here (e.g. "Show Lasalgaon Onion price")...'
              }
              className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-[#F8F5EC] border border-[#E2E5DC] rounded-xl focus:outline-hidden focus:ring-1 focus:ring-[#244638] focus:bg-white text-[#202821] placeholder:text-[#667168]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-2 sm:p-2.5 bg-[#244638] hover:bg-[#18352B] disabled:opacity-40 text-white rounded-xl transition-colors shrink-0 cursor-pointer shadow-xs"
              title={lang === 'mr' ? 'पाठवा' : 'Send'}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};
