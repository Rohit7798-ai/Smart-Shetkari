import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json({ limit: '25mb' }));

// Shared Gemini Client with proper User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * System instruction tailored for Smart Shetkari Voice Assistant
 */
const SYSTEM_INSTRUCTION = `
You are "स्मार्ट शेतकरी सहाय्यक" (Smart Shetkari Voice Assistant), a dedicated, warm, and highly capable agricultural guide and app navigator for Indian farmers.
Your mission is to help farmers control the Smart Shetkari app using voice, check mandi market prices, compare APMC markets, inspect price trends, analyze crop photo quality/health, and learn how to use the app step-by-step.

LANGUAGE PREFERENCE:
- If the user speaks or writes in Marathi (मराठी) or asks for Marathi, ALWAYS reply in natural, clear, respectful spoken Marathi. Use respectful terms like "शेतकरी मित्र", "भाऊ", "दादा", "नमस्कार".
- If the user speaks in English or asks in English, reply in friendly, accessible English.
- Keep spoken text concise, conversational, and direct so it sounds natural when spoken aloud.
- PLAIN TEXT ONLY: Do NOT use emojis, markdown asterisks, or fancy symbols in your responses. Keep answers simple, practical, and direct.

CAPABILITIES & APP ACTIONS:
You have direct control over ~90% of the app's features! Along with your helpful spoken response, you can return a JSON list of "actions" that the app will automatically execute on the user's screen.

Supported Actions:
1. switch_tab: { "type": "switch_tab", "tab": "prices" | "compare" | "trends" | "sources" | "csv" }
2. filter_prices: { "type": "filter_prices", "crop": "Onion" | "Soybean" | "Cotton" | "Tomato" | "", "district": string, "market": string, "search": string }
3. compare_markets: { "type": "compare_markets", "crop": "Onion" | "Soybean" | "Cotton" | "Tomato", "markets": ["Lasalgaon APMC", "Pune APMC", ...] }
4. view_trend: { "type": "view_trend", "crop": string, "market": string, "timeRange": "7d" | "30d" | "90d" | "all" }
5. toggle_language: { "type": "toggle_language", "lang": "mr" | "en" }
6. open_price_help: { "type": "open_price_help" }
7. trigger_sample_reset: { "type": "trigger_sample_reset" }
8. download_template: { "type": "download_template" }
9. guide_step: { "type": "guide_step", "step": number, "title": string, "content": string }

PRICE DATA ACCURACY & ANTI-PROMISE RULES:
- Never promise guaranteed selling prices or maximum profits. Always remind farmers that actual net revenue depends on transportation, APMC deductions, and produce quality.
- Note that observations older than 7 days are stale.
- Remind that the current dataset is a prototype demo dataset for Maharashtra APMCs.

RESPONSE FORMAT (JSON ONLY):
Return JSON strictly adhering to:
{
  "reply": "Warm concise spoken text in the requested language (Marathi or English)",
  "actions": [
    { "type": "...", ... }
  ],
  "suggestedPrompts": [
    "Short relevant next question 1",
    "Short relevant next question 2"
  ]
}
`;

const apiRouter = express.Router();

// Health check endpoint for uptime and deployment monitoring
apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'smart-shetkari-api',
    hasGeminiKey: Boolean(apiKey),
    timestamp: new Date().toISOString(),
  });
});

// Main Conversational Voice & Action Assistant Endpoint
apiRouter.post('/gemini/chat', async (req, res) => {
  try {
    const { messages = [], currentContext, modelChoice = 'gemini-3.5-flash' } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        reply: 'सर्व्हरवर Gemini API Key उपलब्ध नाही. कृपया Vercel पर्यावरण व्हेरिएबल्स मध्ये GEMINI_API_KEY जोडा. (Gemini API key is not configured in server environment).',
        actions: [],
        suggestedPrompts: [],
      });
    }

    const selectedModel = modelChoice || 'gemini-3.5-flash';
    const contents: any[] = [];

    // Context injection as initial user turn if available
    if (currentContext) {
      const contextLines = [
        `CURRENT APPLICATION CONTEXT:`,
        `- Active Screen/Page: ${currentContext.activeTab} (${currentContext.activeTab === 'prices' ? 'Market Prices List' : currentContext.activeTab === 'compare' ? 'Compare Markets' : currentContext.activeTab === 'trends' ? 'Price Trends' : currentContext.activeTab === 'csv' ? 'CSV Import & Backup' : 'Official Data Sources'})`,
        `- User Interface Language: ${currentContext.lang === 'mr' ? 'Marathi (मराठी)' : 'English'}`,
      ];

      if (currentContext.selectedCrop) {
        contextLines.push(`- Currently Selected Crop: ${currentContext.selectedCrop}`);
      }
      if (currentContext.selectedMarket) {
        contextLines.push(`- Currently Selected APMC Market: ${currentContext.selectedMarket}`);
      }
      if (currentContext.compareMarkets && currentContext.compareMarkets.length > 0) {
        contextLines.push(`- Markets Being Compared: ${currentContext.compareMarkets.join(', ')}`);
      }
      if (currentContext.trendTimeRange) {
        contextLines.push(`- Trend Time Window: ${currentContext.trendTimeRange}`);
      }
      if (currentContext.searchQuery) {
        contextLines.push(`- Active Search Filter: "${currentContext.searchQuery}"`);
      }

      if (currentContext.availableCrops && currentContext.availableCrops.length > 0) {
        contextLines.push(`- Available Crops in Database: ${currentContext.availableCrops.slice(0, 15).join(', ')}`);
      }
      if (currentContext.availableMarkets && currentContext.availableMarkets.length > 0) {
        contextLines.push(`- Available Mandi Markets: ${currentContext.availableMarkets.slice(0, 15).join(', ')}`);
      }
      if (currentContext.samplePrices && currentContext.samplePrices.length > 0) {
        contextLines.push(`- Latest Mandi Quotes: ${JSON.stringify(currentContext.samplePrices.slice(0, 5))}`);
      }

      contents.push({
        role: 'user',
        parts: [
          {
            text: contextLines.join('\n'),
          },
        ],
      });
      contents.push({
        role: 'model',
        parts: [
          {
            text: `{"reply": "मी संदर्भ समजून घेतला आहे. तुम्ही सध्या ${currentContext.activeTab} पानावर आहात. मी तुम्हाला कशी मदत करू शकतो?", "actions": [], "suggestedPrompts": []}`,
          },
        ],
      });
    }

    // Append prior conversation turns
    if (Array.isArray(messages) && messages.length > 0) {
      for (const msg of messages) {
        const parts: any[] = [];
        if (msg.image && msg.image.data) {
          parts.push({
            inlineData: {
              mimeType: msg.image.mimeType || 'image/jpeg',
              data: msg.image.data,
            },
          });
        }
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts,
        });
      }
    }

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      parsedData = {
        reply: responseText,
        actions: [],
        suggestedPrompts: [],
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error in /api/gemini/chat:', error);
    res.status(500).json({
      reply: 'माफ करा, सर्व्हरशी संपर्क साधताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा. (Error connecting to AI assistant)',
      error: error.message || 'Unknown error',
      actions: [],
    });
  }
});

// Dedicated Multimodal Crop Photo Analysis endpoint
apiRouter.post('/gemini/analyze-crop', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', question, lang = 'mr' } = req.body;

    if (!apiKey) {
      return res.status(500).json({
        reply: 'सर्व्हरवर Gemini API Key उपलब्ध नाही. (Gemini API key is missing on the server).',
      });
    }

    const promptText = `
User Query: ${question || 'Analyze this crop/agricultural produce photo.'}
Preferred Language: ${lang === 'mr' ? 'Marathi (मराठी)' : 'English'}

Provide an in-depth, practical agricultural analysis:
1. Identify the crop and assess visual quality grade (A-grade, B-grade, damaged/spotted).
2. Detect any visible diseases, pests, fungal blights, or storage moisture damage.
3. Provide practical farmer recommendations for post-harvest handling, sorting, or mandi selling timing.
4. Estimate how this visual grade affects the expected mandi price bracket (whether it is likely to receive Maximum, Modal, or Minimum market price).
5. Suggest relevant actions in the Smart Shetkari app (e.g. check current prices for this crop).

Return response as JSON:
{
  "cropIdentified": string,
  "qualityGrade": string,
  "conditionSummary": string,
  "detailedAdvice": string,
  "expectedPriceCategory": "Max Price" | "Modal Price" | "Min Price",
  "spokenReply": "Warm spoken summary in ${lang === 'mr' ? 'Marathi' : 'English'}",
  "actions": [
    { "type": "filter_prices", "crop": "...", "district": "", "market": "", "search": "" }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: imageBase64,
            },
          },
          { text: promptText },
        ],
      },
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in /api/gemini/analyze-crop:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze crop photo',
      spokenReply: 'फोटो विश्लेषण करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.',
    });
  }
});

// Mount on both /api (when called directly or with /api prefix) and / (if path rewritten)
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
