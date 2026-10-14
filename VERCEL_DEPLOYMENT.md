# Deploying Smart Shetkari on Vercel 🚀

This repository is already configured with a turnkey setup for Vercel:
- **Frontend**: Vite + React 19 SPA built to `/dist`.
- **Backend API**: Serverless Express function under `/api/index.ts` handling:
  - `/api/gemini/chat`: Context-aware multilingual voice & text assistant.
  - `/api/gemini/analyze-crop`: Multimodal visual crop disease and quality grading.
  - `/api/health`: Deployment health check.
- **Routing**: `vercel.json` automatically routes `/api/*` requests to the serverless function and all other paths to the SPA.

---

## Method 1: Deploy via Vercel Web Dashboard (Recommended)

### Step 1: Push Code to GitHub
1. Initialize git and commit your files (if not already done):
   ```bash
   git add .
   git commit -m "feat: setup Vercel serverless deployment"
   ```
2. Push your repository to your GitHub account.

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Under "Import Git Repository", select your repository.

### Step 3: Configure Build & Environment Variables
1. **Framework Preset**: Select **Vite** (Vercel should auto-detect this).
2. **Build and Output Settings** (auto-configured by `vercel.json`):
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. **Environment Variables**:
   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
   - *(Optional)* Name: `NODE_ENV`, Value: `production`
4. Click **Deploy**.

---

## Method 2: Deploy via Vercel CLI (Quickest)

You can deploy directly from your local terminal using the Vercel CLI:

1. **Install or run Vercel CLI**:
   ```bash
   npx vercel
   ```
2. Follow the interactive prompts:
   - Set up and deploy: **Y**
   - Which scope: Select your account
   - Link to existing project: **N**
   - Project name: `smart-shetkari` (or your chosen name)
   - Directory: `./`
3. **Set the Gemini API Key**:
   ```bash
   npx vercel env add GEMINI_API_KEY
   ```
   Paste your Gemini API key when prompted, and select `Production`, `Preview`, and `Development`.
4. **Deploy to Production**:
   ```bash
   npx vercel --prod
   ```

---

## Verification After Deployment

Once deployment completes, Vercel will provide your live URL (e.g., `https://smart-shetkari.vercel.app`):
1. **Frontend**: Open the URL in your browser or phone to verify all tabs (Market Prices, Comparison, Trends, Crop Analysis) load.
2. **API Health**: Visit `https://your-app.vercel.app/api/health` to confirm the serverless function returns:
   ```json
   {
     "status": "ok",
     "service": "smart-shetkari-api",
     "hasGeminiKey": true
   }
   ```
3. **AI Assistant**: Click the floating green assistant button or say a prompt like "कांदा भाव काय आहेत?" to test the Gemini voice responses and automated actions.
