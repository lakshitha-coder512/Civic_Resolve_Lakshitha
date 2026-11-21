import 'dotenv/config';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const CATEGORIES = [
  'Roads & Potholes',
  'Water & Drainage',
  'Street Lighting',
  'Waste & Sanitation',
  'Traffic & Signals',
  'Parks & Public Spaces',
] as const;

const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'] as const;

const DEPARTMENT_MAP: Record<string, string> = {
  'Roads & Potholes': 'Department of Transportation & Roadways',
  'Water & Drainage': 'Municipal Water & Sewerage Board',
  'Street Lighting': 'Electrical & Street Lighting Division',
  'Waste & Sanitation': 'Solid Waste Management Authority',
  'Traffic & Signals': 'Traffic Engineering Bureau',
  'Parks & Public Spaces': 'Parks & Urban Forestry',
};

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '8mb' }));

  app.post('/api/analyze-issue', async (req, res) => {
    const { title, description, location, imageBase64, imageMimeType } = req.body ?? {};

    if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({
        error: 'Both an issue title and description are required for AI classification.',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini API key is not configured in the server environment. Check Settings > Secrets.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = [
        'You are the municipal AI triage engine for CivicResolve, a smart-city civic issue reporting platform.',
        'Classify the citizen report below into the exact category, priority level, responsible city department, estimated resolution window, and provide a concise 1-2 sentence triage rationale.',
        `Allowed categories: ${CATEGORIES.join(', ')}.`,
        `Allowed priorities: ${PRIORITIES.join(', ')}.`,
        `Department mapping:\n${Object.entries(DEPARTMENT_MAP)
          .map(([cat, dept]) => `- ${cat} -> ${dept}`)
          .join('\n')}`,
        'Priority rules:',
        '- Critical: immediate public safety hazard, active flooding, broken traffic signal, exposed electrical hazard, collapsed roadway.',
        '- High: major mobility disruption, dark pedestrian crossing, severe pothole on arterial road, blocked storm drain before rain.',
        '- Medium: localized sanitation overflow, minor sidewalk damage, flickering streetlight, park fixture wear.',
        '- Low: cosmetic maintenance, non-urgent park upkeep, minor signage fade.',
        '',
        `Issue Title: ${title.trim()}`,
        `Location: ${typeof location === 'string' && location.trim() ? location.trim() : 'Not specified'}`,
        `Citizen Description: ${description.trim()}`,
      ].join('\n');

      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      if (
        typeof imageBase64 === 'string' &&
        imageBase64.length > 0 &&
        typeof imageMimeType === 'string' &&
        imageMimeType.startsWith('image/')
      ) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: imageBase64,
          },
        });
      }
      parts.push({ text: promptText });

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: { parts },
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: {
                type: Type.STRING,
                description: `One of: ${CATEGORIES.join(', ')}`,
              },
              priority: {
                type: Type.STRING,
                description: `One of: ${PRIORITIES.join(', ')}`,
              },
              department: {
                type: Type.STRING,
                description: 'The exact responsible municipal department name.',
              },
              estimatedResolution: {
                type: Type.STRING,
                description: 'Realistic municipal SLA window, e.g., "12–24 hours" or "3–5 business days".',
              },
              reasoning: {
                type: Type.STRING,
                description: 'Concise 1-2 sentence municipal triage rationale explaining the classification and priority.',
              },
            },
            required: ['category', 'priority', 'department', 'estimatedResolution', 'reasoning'],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'The AI model returned an empty triage response.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        category?: string;
        priority?: string;
        department?: string;
        estimatedResolution?: string;
        reasoning?: string;
      };

      const validCategory = CATEGORIES.includes(parsed.category as (typeof CATEGORIES)[number])
        ? (parsed.category as (typeof CATEGORIES)[number])
        : 'Roads & Potholes';

      const validPriority = PRIORITIES.includes(parsed.priority as (typeof PRIORITIES)[number])
        ? (parsed.priority as (typeof PRIORITIES)[number])
        : 'Medium';

      const department = DEPARTMENT_MAP[validCategory] || parsed.department || 'Municipal Operations Desk';

      res.json({
        category: validCategory,
        priority: validPriority,
        department,
        estimatedResolution: parsed.estimatedResolution || '2–4 business days',
        reasoning: parsed.reasoning || 'Classified based on civic infrastructure impact and public safety criteria.',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error while analyzing civic issue.';
      console.error('AI Triage Error:', err);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/action-plan', async (req, res) => {
    const {
      id,
      title,
      description,
      location,
      ward,
      category,
      priority,
      department,
      status,
      reportedBy,
    } = req.body ?? {};

    if (typeof title !== 'string' || !title.trim() || typeof description !== 'string' || !description.trim()) {
      res.status(400).json({
        error: 'Complaint title and description are required to generate an AI action plan.',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error: 'Gemini API key is not configured in the server environment. Check Settings > Secrets.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const promptText = [
        'You are the Municipal Operations Dispatch Coordinator for CivicResolve.',
        'Draft an actionable, realistic municipal crew dispatch order and a clear citizen status update message for the following civic complaint.',
        'Keep language direct, professional, and grounded in municipal engineering operations.',
        '',
        `Complaint ID: ${id || 'CR-2026'}`,
        `Title: ${title.trim()}`,
        `Location: ${ward || ''} — ${location || 'City jurisdiction'}`,
        `Category: ${category || 'Municipal Infrastructure'}`,
        `Priority: ${priority || 'Medium'}`,
        `Current Status: ${status || 'Pending'}`,
        `Assigned Department: ${department || 'Municipal Operations'}`,
        `Reported By: ${reportedBy || 'Resident'}`,
        `Description: ${description.trim()}`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: promptText,
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              crewUnit: {
                type: Type.STRING,
                description: 'Specific field crew designation, e.g., "Stormwater Structural Unit #4" or "Traffic Signal Rapid Response Team".',
              },
              equipmentChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 4 concise equipment, material, or vehicle items required onsite.',
              },
              fieldInstructions: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 clear numbered-style operational steps for the field crew to execute.',
              },
              safetyProtocol: {
                type: Type.STRING,
                description: 'Concise 1-sentence onsite traffic, electrical, or public safety precaution.',
              },
              estimatedCrewHours: {
                type: Type.STRING,
                description: 'Estimated onsite repair duration, e.g., "2–3 hours onsite".',
              },
              citizenUpdateMessage: {
                type: Type.STRING,
                description: 'A polite, transparent 2-3 sentence official update addressed to the reporting citizen referencing the ticket ID and next steps.',
              },
            },
            required: [
              'crewUnit',
              'equipmentChecklist',
              'fieldInstructions',
              'safetyProtocol',
              'estimatedCrewHours',
              'citizenUpdateMessage',
            ],
          },
        },
      });

      const rawText = (response.text ?? '').trim();
      if (!rawText) {
        res.status(502).json({ error: 'The AI model returned an empty action plan response.' });
        return;
      }

      const parsed = JSON.parse(rawText) as {
        crewUnit?: string;
        equipmentChecklist?: string[];
        fieldInstructions?: string[];
        safetyProtocol?: string;
        estimatedCrewHours?: string;
        citizenUpdateMessage?: string;
      };

      const now = new Date();
      const pad = (n: number) => String(n).padStart(2, '0');
      const generatedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

      res.json({
        crewUnit: parsed.crewUnit || `${department || 'Municipal'} Field Crew`,
        equipmentChecklist: Array.isArray(parsed.equipmentChecklist) ? parsed.equipmentChecklist.slice(0, 5) : [],
        fieldInstructions: Array.isArray(parsed.fieldInstructions) ? parsed.fieldInstructions.slice(0, 5) : [],
        safetyProtocol: parsed.safetyProtocol || 'Establish high-visibility perimeter cones before beginning repair work.',
        estimatedCrewHours: parsed.estimatedCrewHours || '2–4 hours onsite',
        citizenUpdateMessage:
          parsed.citizenUpdateMessage ||
          `Your report (${id}) has been reviewed by ${department} and scheduled for field inspection.`,
        generatedAt,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unexpected error while generating AI action plan.';
      console.error('AI Action Plan Error:', err);
      res.status(500).json({ error: message });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Production build not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicResolve server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
