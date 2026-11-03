import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const PORT = 3000;
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'bharat_rasoi_store.json');

interface StoredBackendData {
  users: Array<{
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    avatarUrl: string;
    createdAt: string;
  }>;
  userStates: Record<string, unknown>;
}

function readBackendStore(): StoredBackendData {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as StoredBackendData;
    }
  } catch (err) {
    console.error('Error reading local store:', err);
  }
  return {
    users: [
      {
        id: 'user-ananya-01',
        name: 'Ananya Verma',
        email: 'ananya.verma@bharatrasoi.in',
        passwordHash: 'rasoi123',
        avatarUrl: '',
        createdAt: '2026-09-12T10:00:00Z',
      },
    ],
    userStates: {},
  };
}

function writeBackendStore(data: StoredBackendData) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving local store:', err);
  }
}

function buildFallbackChefReply(
  message: string,
  preferences?: {
    foodPreference?: string;
    favouriteCuisine?: string;
    spicePreference?: string;
    preferredCookingTime?: string;
    allergies?: string[];
  }
): { reply: string; suggestedIngredients: string[] } {
  const q = message.toLowerCase();
  const diet = preferences?.foodPreference || 'Vegetarian';
  const spice = preferences?.spicePreference || 'Medium';
  const time = preferences?.preferredCookingTime || 'Under 30 minutes';
  const allergiesNote =
    preferences?.allergies && preferences.allergies.length > 0
      ? ` (avoiding ${preferences.allergies.join(', ')})`
      : '';

  if (q.includes('paneer') || q.includes('dinner')) {
    return {
      reply: `For a **${diet}**, **${spice}-spice** meal ${time.toLowerCase()}${allergiesNote}, try **Lasooni Palak Paneer** or **Spiced Tawa Paneer Sandwich**.\n\n**Chef's Quick Technique:**\n1. Soak cubed paneer in warm salted water for 10 minutes so it stays cloud-soft.\n2. Bloom whole cumin and finely chopped garlic in 1 tbsp ghee first before folding in blanched spinach or tomatoes.\n3. Finish with crushed *kasuri methi* rubbed between your palms right after turning off the flame.`,
      suggestedIngredients: ['Fresh Paneer', 'Fresh Spinach (Palak)', 'Garlic Cloves', 'Kasuri Methi'],
    };
  }

  if (q.includes('breakfast') || q.includes('morning') || q.includes('quick')) {
    return {
      reply: `Here are two energizing **${diet}** Indian breakfasts tailored to **${time}**${allergiesNote}:\n\n1. **Indori Vegetable Poha (20 mins):** Rinse thick poha in a strainer (never soak!), temper mustard & fennel seeds with curry leaves, and finish with lemon juice.\n2. **Herbed Besan Chilla (18 mins):** Whisk gram flour with ajwain, grated ginger, onion, tomato, and coriander for a protein-packed skillet pancake.`,
      suggestedIngredients: ['Thick Flattened Rice (Poha)', 'Besan (Gram Flour)', 'Curry Leaves', 'Fresh Lemon'],
    };
  }

  if (q.includes('substitute') || q.includes('replace') || q.includes('without')) {
    return {
      reply: `**Indian Kitchen Substitution Guide (${diet}${allergiesNote}):**\n- **No Heavy Cream:** Blend 10 soaked cashews with 3 tbsp warm water or milk for rich makhani silkiness.\n- **No Tomatoes:** Use whisked mild dahi (curd) tempered on low heat with 1 tsp besan so it won't curdle, plus 1/2 tsp amchur for gentle tang.\n- **No Garam Masala:** Toast 2 green cardamoms, 2 cloves, a small cinnamon piece, and 1/2 tsp cumin seeds, then crush fresh in a mortar.`,
      suggestedIngredients: ['Cashew Nuts', 'Amchur (Dry Mango Powder)', 'Green Cardamom Pods'],
    };
  }

  return {
    reply: `Namaste! Keeping your **${diet}** preference, **${spice}** spice level, and **${time}** goal${allergiesNote} in mind:\n\n- **Balanced Thali Idea:** Pair **Homestyle Dal Tadka & Jeera Rice** with a crisp cucumber-mint kachumber salad.\n- **Flavour Tip:** Always let mustard and cumin seeds crackle fully in warm ghee/oil before adding onions—this unlocks deep nutty aroma across the dish.\n\nTell me which 2–3 ingredients are in your fridge right now, or ask about spice adjustments, pressure-cooker timings, or regional dishes!`,
    suggestedIngredients: ['Toor Dal', 'Basmati Rice', 'Cumin Seeds', 'Fresh Coriander Leaves'],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  // Sync user kitchen state
  app.get('/api/state/:userId', (req, res) => {
    const store = readBackendStore();
    const state = store.userStates[req.params.userId] || null;
    res.json({ state });
  });

  app.post('/api/state/:userId', (req, res) => {
    const store = readBackendStore();
    store.userStates[req.params.userId] = req.body.state;
    writeBackendStore(store);
    res.json({ ok: true });
  });

  // Auth routes
  app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required.' });
      return;
    }
    const store = readBackendStore();
    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists. Please sign in.' });
      return;
    }
    const newUser = {
      id: `user-${Date.now()}`,
      name: String(name).trim(),
      email: normalizedEmail,
      passwordHash: String(password),
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };
    store.users.push(newUser);
    writeBackendStore(store);

    res.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt,
      },
    });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const store = readBackendStore();
    const normalizedEmail = String(email).trim().toLowerCase();
    const found = store.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!found || found.passwordHash !== String(password)) {
      res.status(401).json({ error: 'Invalid email or password. Try ananya.verma@bharatrasoi.in / rasoi123 or create a new account.' });
      return;
    }
    res.json({
      user: {
        id: found.id,
        name: found.name,
        email: found.email,
        avatarUrl: found.avatarUrl,
        createdAt: found.createdAt,
      },
    });
  });

  // Server-side Gemini API for Bharat Rasoi AI Chef
  app.post('/api/ai-chef', async (req, res) => {
    const { message, history = [], preferences } = req.body || {};
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Please enter a cooking question or ingredient list.' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
      const fallback = buildFallbackChefReply(message, preferences);
      res.json(fallback);
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

      const prefSummary = preferences
        ? `User Cooking Profile:
- Dietary Preference: ${preferences.foodPreference}
- Favourite Regional Cuisine: ${preferences.favouriteCuisine}
- Spice Preference: ${preferences.spicePreference}
- Allergies to Strictly Avoid: ${(preferences.allergies || []).join(', ') || 'None'}
- Cooking Experience: ${preferences.cookingExperience}
- Preferred Cooking Time: ${preferences.preferredCookingTime}
- Meal Style: ${preferences.mealStyle}`
        : 'User Cooking Profile: General Indian home cooking.';

      const conversationContext = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role: string; content: string }) => `${m.role === 'user' ? 'Home Cook' : 'AI Chef'}: ${m.content}`)
            .join('\n')
        : '';

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `${conversationContext ? `Recent Conversation:\n${conversationContext}\n\n` : ''}Home Cook Question: ${message}`,
        config: {
          systemInstruction: `You are the Bharat Rasoi AI Chef, a warm, knowledgeable master of regional Indian home cooking (North, South, East, West, Central, and Northeast India).
${prefSummary}

Rules:
1. Strictly respect the user's Dietary Preference and Allergies at all times.
2. Give practical, clear, step-by-step Indian culinary guidance with exact timings and spice cues (e.g., tadka, bhunao, soaking).
3. Keep responses concise (around 120-200 words), structured with short bullet points or numbered steps.
4. At the very end, optionally include a line starting with "SHOPPING_ITEMS:" followed by 2-4 comma-separated key ingredients mentioned.`,
        },
      });

      const rawText = response.text || '';
      let cleanReply = rawText.trim();
      let suggestedIngredients: string[] = [];

      const match = cleanReply.match(/SHOPPING_ITEMS:\s*(.+)$/im);
      if (match) {
        suggestedIngredients = match[1]
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
          .slice(0, 5);
        cleanReply = cleanReply.replace(/SHOPPING_ITEMS:\s*(.+)$/im, '').trim();
      }

      res.json({
        reply: cleanReply || buildFallbackChefReply(message, preferences).reply,
        suggestedIngredients,
      });
    } catch (error: unknown) {
      console.error('Gemini AI Chef error:', error);
      const fallback = buildFallbackChefReply(message, preferences);
      res.json(fallback);
    }
  });

  if (process.env.NODE_ENV === 'production') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Bharat Rasoi server running on http://localhost:${PORT}`);
  });
}

startServer();
