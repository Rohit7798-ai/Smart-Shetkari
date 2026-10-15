import React, { useState, useRef, useEffect } from 'react';
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
  Maximize2,
  Dock,
  PanelRightClose,
  ChevronRight,
  Info,
} from 'lucide-react';

export type AssistantViewMode = 'side-panel' | 'floating';

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
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      text:
        lang === 'mr'
          ? 'नमस्कार. मी तुमचा शेतकरी AI मदतनीस आहे. तुम्ही मला बोलून किंवा लिहून बाजार भाव विचारू शकता, बाजारांची तुलना करू शकता, भाव कल पाहू शकता किंवा पिकाचा फोटो पाठवू शकता.'
          : 'Hello. I am your farmer AI assistant. Speak or type to check market prices, compare markets, view price trends, or upload a crop photo for quality advice.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [autoSpeak, setAutoSpeak] = useState<boolean>(true);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript, isLoading]);

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

  const handleSend = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputText;
    if (!textToSend.trim() && !selectedImage) return;

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
          'gemini-3.5-flash'
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

      if (actions && actions.length > 0) {
        actions.forEach(action => {
          onExecuteAction(action);
        });
      }

      if (autoSpeak) {
        setSpeakingMessageId(assistantMessage.id);
        voiceService.speak(
          replyText,
          lang,
          () => setSpeakingMessageId(assistantMessage.id),
          () => setSpeakingMessageId(null)
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
          console.error('Voice input error:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );
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

  // Contextual quick suggestions that adapt to the active page & selected data
  const getContextualPrompts = (): string[] => {
    switch (activeTab) {
      case 'prices':
        return lang === 'mr'
          ? [
              currentCrop ? `${currentCrop} चे आजचे कमाल भाव दाखवा` : 'आजचे कमाल भाव कोणते?',
              'लासलगाव कांदा भाव काय आहे?',
              'सर्वोत्तम भाव देणारा बाजार शोधा',
              'भावांचे प्रकार समजावून सांगा',
            ]
          : [
              currentCrop ? `Show highest price for ${currentCrop}` : 'Show highest price today',
              'What is Lasalgaon onion price?',
              'Find best paying market',
              'Explain price terms',
            ];

      case 'compare':
        return lang === 'mr'
          ? [
              'निवडलेल्या बाजारांमधील फरकाचे विश्लेषण करा',
              `${currentCrop || 'कांदा'} साठी कोणता बाजार अधिक फायदेशीर?`,
              'भावामध्ये फरक असण्याचे कारण काय?',
            ]
          : [
              'Analyze price differences between selected markets',
              `Which market is more profitable for ${currentCrop || 'Onion'}?`,
              'Why do these markets have price gaps?',
            ];

      case 'trends':
        return lang === 'mr'
          ? [
              `${currentCrop || 'कांदा'} चा ३० दिवसांचा भाव कल स्पष्ट करा`,
              'येत्या आठवड्यात भाव वाढण्याची शक्यता आहे का?',
              'या कालावधीतील सर्वोच्च भाव कधी होता?',
            ]
          : [
              `Explain 30-day price trend for ${currentCrop || 'Onion'}`,
              'Are prices expected to rise next week?',
              'When was the peak price recorded?',
            ];

      case 'sources':
        return lang === 'mr'
          ? [
              'हा भाव डेटा कुठून येतो?',
              'डेटा किती दिवसांनी अपडेट होतो?',
              'APMC बाजार म्हणजे काय?',
            ]
          : [
              'Where does this mandi data come from?',
              'How frequently is data updated?',
              'What is an APMC mandi?',
            ];

      default:
        return [];
    }
  };

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
            ? 'top-0 right-0 bottom-0 w-full sm:w-[440px] md:w-[480px] h-full sm:rounded-l-2xl border-r-0'
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] h-[580px] max-h-[85vh] rounded-2xl'
        }`}
      >
        {/* 1. Header with SaaS Context Bar & Controls */}
        <div className="bg-white px-3.5 sm:px-4 py-3 border-b border-[#E2E5DC] shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#244638] text-white flex items-center justify-center shrink-0">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="font-bold text-sm text-[#202821] truncate">
                    {lang === 'mr' ? 'शेतकरी AI मदतनीस' : 'Farmer AI Assistant'}
                  </h2>
                  <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-[#244638] shrink-0">
                    Gemini
                  </span>
                </div>
                <div className="text-[11px] text-[#667168] truncate flex items-center gap-1">
                  <span>{lang === 'mr' ? 'पान: ' : 'Page: '}</span>
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
              {/* Toggle View Mode (Side Panel vs Floating) on larger screens */}
              <button
                type="button"
                onClick={() => setViewMode(prev => (prev === 'side-panel' ? 'floating' : 'side-panel'))}
                className="hidden sm:inline-flex p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                title={
                  isSidePanel
                    ? lang === 'mr'
                      ? 'फ्लोटिंग विंडो करा'
                      : 'Switch to floating window'
                    : lang === 'mr'
                    ? 'साइड पॅनल करा'
                    : 'Dock as side panel'
                }
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

          {/* Contextual Quick Suggestions Strip */}
          <div className="mt-2.5 pt-2 border-t border-[#E2E5DC] -mx-1 px-1">
            <div className="flex items-center justify-between text-[11px] text-[#667168] mb-1.5">
              <span className="font-medium flex items-center gap-1 text-[#244638]">
                <Sparkles className="w-3 h-3 text-[#2D7652]" />
                {lang === 'mr' ? 'चालू पानानुसार प्रश्न:' : 'Contextual quick prompts:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto no-scrollbar">
              {getContextualPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="text-xs px-2 py-1 rounded bg-[#F8F5EC] hover:bg-[#244638] text-[#244638] hover:text-white border border-[#D5DCD0] transition-colors text-left truncate max-w-full cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Message Thread */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-[#F8F5EC]/70">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] rounded-xl p-3 text-sm leading-relaxed shadow-xs ${
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

                {/* Plain-text executed app action notification */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-100 text-xs text-[#244638] font-mono space-y-0.5">
                    {msg.actions.map((act, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <ChevronRight className="w-3 h-3 text-[#2D7652] shrink-0" />
                        <span>
                          {lang === 'mr' ? 'कृती: ' : 'Action: '}
                          {act.type === 'switch_tab' && `Screen: ${act.tab}`}
                          {act.type === 'filter_prices' && `${act.crop || 'All'} ${act.district || ''}`}
                          {act.type === 'compare_markets' && `Compare: ${act.crop || 'Markets'}`}
                          {act.type === 'view_trend' && `Trend: ${act.crop} (${act.market})`}
                          {act.type === 'toggle_language' && `Language: ${act.lang}`}
                          {act.type === 'open_price_help' && `Price measure help`}
                          {act.type === 'sync_live_prices' && (lang === 'mr' ? 'अ‍ॅगमार्कनेट भाव सिंक केले' : 'Synced live APMC prices')}
                          {act.type === 'guide_step' && `Step ${act.step}`}
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
                      className="hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{speakingMessageId === msg.id ? (lang === 'mr' ? 'थांबवा' : 'Stop') : (lang === 'mr' ? 'ऐका' : 'Listen')}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Dynamic Follow-up Suggestions */}
              {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-1.5 max-w-[90%]">
                  {msg.suggestedPrompts.map((prompt, pIdx) => (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      className="text-xs px-2.5 py-1 bg-white hover:bg-[#244638] text-[#202821] hover:text-white border border-[#E2E5DC] rounded-lg text-left transition-colors cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="p-3 bg-white border border-rose-300 rounded-xl text-rose-800 text-xs shadow-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping shrink-0" />
                <span>{lang === 'mr' ? 'मी ऐकत आहे... (मराठी किंवा इंग्रजीत बोला)' : 'Listening... (Speak naturally in Marathi or English)'}</span>
              </div>
              <p className="font-mono text-slate-800 bg-rose-50/60 p-2 rounded">
                {interimTranscript || (lang === 'mr' ? 'आता बोला...' : 'Speak now...')}
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-2 p-3 bg-white border border-[#E2E5DC] rounded-xl text-xs text-[#667168] max-w-[80%]">
              <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#244638] animate-bounce [animation-delay:0.4s]" />
              <span>
                {lang === 'mr' ? 'माहिती शोधत आहे...' : 'Finding answer...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. Photo Preview Bar (if uploaded) */}
        {selectedImage && (
          <div className="px-3.5 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={selectedImage.previewUrl}
                alt="Upload preview"
                className="w-10 h-10 rounded object-cover border border-emerald-300 shrink-0"
              />
              <span className="text-xs text-emerald-900 truncate">
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

        {/* 4. Farmer-friendly Input Bar */}
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
              className="p-2 sm:p-2.5 text-slate-600 hover:text-[#244638] hover:bg-slate-100 rounded-lg border border-[#E2E5DC] transition-colors shrink-0 cursor-pointer"
              title={lang === 'mr' ? 'पिकाचा फोटो जोडा' : 'Add crop photo'}
              aria-label="Upload crop photo"
            >
              <Camera className="w-4 h-4" />
            </button>

            {/* Microphone Voice Button */}
            <button
              type="button"
              onClick={handleToggleVoice}
              className={`p-2 sm:p-2.5 rounded-lg border transition-all shrink-0 cursor-pointer ${
                isListening
                  ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                  : 'text-slate-700 hover:text-[#244638] hover:bg-slate-100 border-[#E2E5DC]'
              }`}
              title={isListening ? (lang === 'mr' ? 'माईक बंद करा' : 'Stop voice') : (lang === 'mr' ? 'माईक चालू करा' : 'Start speaking')}
              aria-label="Voice input"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Text Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder={
                lang === 'mr'
                  ? 'बोलण्यासाठी माईक दाबा किंवा येथे लिहा...'
                  : 'Tap mic to speak or type here...'
              }
              className="flex-1 min-w-0 px-3 py-2 text-xs sm:text-sm bg-[#F8F5EC] border border-[#E2E5DC] rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#244638] focus:bg-white text-[#202821] placeholder:text-[#667168]"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !selectedImage)}
              className="p-2 sm:p-2.5 bg-[#244638] hover:bg-[#18352B] disabled:opacity-40 text-white rounded-lg transition-colors shrink-0 cursor-pointer"
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
