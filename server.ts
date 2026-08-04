import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy Google GenAI initialization
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    aiConfigured: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY',
  });
});

// AI Portfolio & Tax Strategy Advisor Endpoint
app.post('/api/ai-advisor', async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.json({
        success: false,
        message: 'Gemini API Key is not configured. Please set GEMINI_API_KEY in the environment secrets panel.',
        fallbackAnalysis: 'The Sahota Group portfolio holds $3,836,023 in total property income against $3,116,120 in total property costs, producing a net gross profit of $719,903 (+23.1% overall margin). Managed investments contribute $957,407 with a +30.6% gain ($224,354 net gain over contributions). Key tax recommendation: Consider utilizing the 50% Australian Capital Gains Tax discount for properties held over 12 months under Sahota Family Trust streaming resolutions.',
      });
    }

    const { prompt, portfolioContext } = req.body;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `You are an expert Australian High Net Worth Tax & Wealth Strategy Assistant for the Sahota Family Portfolio (Entities: Sahota Family Trust, Sahota Nominees Pty Ltd, Sahota Trading Pty Ltd, Sahota Gold Pty Ltd).
              
Portfolio Context:
${JSON.stringify(portfolioContext, null, 2)}

User Prompt: ${prompt || 'Analyze our portfolio structure, CGT liabilities, trust streaming strategy, and give top 3 strategic recommendations.'}

Provide a structured, professional, executive analysis with bullet points and clear numbers in Australian Dollars (AUD). Include tax minimization strategies, franking credit utilization for Sahota Gold bucket company, and risk management notes.`,
            },
          ],
        },
      ],
    });

    const analysis = response.text;
    res.json({ success: true, analysis });
  } catch (error: any) {
    console.error('AI Advisor error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to process AI analysis' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sahota Portfolio Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
