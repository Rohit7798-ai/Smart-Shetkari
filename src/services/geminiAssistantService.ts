import { AppAction, AssistantMessage, CropAnalysisResult } from '../types/assistant';
import { Language, MarketPriceRecord, NavTab } from '../types/marketPrice';

export interface ChatContext {
  activeTab: NavTab;
  lang: Language;
  availableCrops: string[];
  availableMarkets: string[];
  samplePrices: Array<{ crop: string; market: string; modalPrice: number; date: string }>;
  selectedCrop?: string;
  selectedMarket?: string;
  compareMarkets?: string[];
  trendTimeRange?: string;
  searchQuery?: string;
}

export const geminiAssistantService = {
  /**
   * Convert file to Base64 string
   */
  async fileToBase64(file: File): Promise<{ mimeType: string; data: string; previewUrl: string }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const [header, base64Data] = result.split(',');
        const mimeType = header.match(/:(.*?);/)?.[1] || file.type || 'image/jpeg';
        resolve({
          mimeType,
          data: base64Data,
          previewUrl: result,
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Send multi-turn conversation & voice query to Gemini
   */
  async sendMessage(
    messages: AssistantMessage[],
    context: ChatContext,
    modelChoice: 'gemini-3.5-flash' | 'gemini-3.1-flash-lite' = 'gemini-3.5-flash'
  ): Promise<{
    reply: string;
    actions: AppAction[];
    suggestedPrompts: string[];
  }> {
    const payload = {
      messages: messages.map(m => ({
        role: m.role,
        text: m.text,
        image: m.image ? { mimeType: m.image.mimeType, data: m.image.data } : undefined,
      })),
      currentContext: context,
      modelChoice,
    };

    const res = await fetch('/api/gemini/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `Server responded with status ${res.status}`);
    }

    const data = await res.json();
    return {
      reply: data.reply || 'मी तुमची मदत करू शकतो.',
      actions: Array.isArray(data.actions) ? data.actions : [],
      suggestedPrompts: Array.isArray(data.suggestedPrompts) ? data.suggestedPrompts : [],
    };
  },

  /**
   * Analyze crop photo using Gemini Vision
   */
  async analyzeCropPhoto(
    imageBase64: string,
    mimeType: string,
    question?: string,
    lang: Language = 'mr'
  ): Promise<CropAnalysisResult> {
    const res = await fetch('/api/gemini/analyze-crop', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageBase64,
        mimeType,
        question,
        lang,
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to analyze photo (HTTP ${res.status})`);
    }

    return await res.json();
  },
};
