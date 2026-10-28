import express, { Request, Response } from 'express';
import http from 'http';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '20mb' }));

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'worldforge-api', offlineReady: true });
  });

  // AI-Assisted generation endpoint (optional feature)
  app.post('/api/generate', async (req: Request, res: Response) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY || req.body.apiKey;
      if (!apiKey) {
        return res.status(400).json({
          error: 'No GEMINI_API_KEY available. You can also provide an API key in the generation dialog, or use the offline procedural generator tables.',
          offlineAvailable: true,
        });
      }

      const { prompt, systemInstruction, worldContext, entityType } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Missing prompt in request.' });
      }

      const ai = new GoogleGenAI({ apiKey });
      const fullSystem = [
        'You are a master worldbuilding architect and fantasy RPG systems designer for WorldForge.',
        'Generate structured, immersive, original worldbuilding entries that fit the specified world tone, genre, and rules.',
        'Never return conversational filler or meta-commentary. Output the requested creative content directly in JSON format matching the requested structure.',
        systemInstruction || '',
        worldContext ? `World Context:\nGenre: ${worldContext.genre || 'fantasy'}\nMagic Level: ${worldContext.magicLevel || 'medium'}\nTech Level: ${worldContext.techLevel || 'medieval'}\nTone: ${worldContext.tone || 'epic'}\nWorld Summary: ${worldContext.description || ''}` : '',
      ].filter(Boolean).join('\n\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: fullSystem,
          responseMimeType: 'application/json',
          temperature: 0.8,
        },
      });

      const text = response.text || '{}';
      let parsed = {};
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        parsed = { rawContent: text };
      }

      res.json({ success: true, data: parsed, raw: text });
    } catch (err: unknown) {
      console.error('Gemini generation error:', err);
      const message = err instanceof Error ? err.message : 'Unknown generation failure';
      res.status(500).json({
        error: message,
        tip: 'Check your internet connection and API key. Core worldbuilding remains fully functional offline!',
      });
    }
  });

  if (!isProduction) {
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`WorldForge server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start WorldForge server:', err);
  process.exit(1);
});
