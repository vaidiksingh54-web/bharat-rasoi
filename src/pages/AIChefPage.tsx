import React, { useState } from 'react';
import { ChefHat, Plus, Send, Sparkles } from 'lucide-react';
import { ChatMessage, PageId, UserPreferences } from '../types';

interface AIChefPageProps {
  preferences: UserPreferences;
  onAddSuggestedShoppingItems: (itemNames: string[]) => void;
  onNavigate: (page: PageId) => void;
}

const STARTER_PROMPTS = [
  'Suggest a 20-minute vegetarian dinner with paneer and capsicum',
  'How do I prevent yogurt from curdling in an Indian curry?',
  'Give me a high-protein Indian breakfast under 20 minutes',
  'What can I substitute for heavy cream in Paneer Butter Masala?',
];

export const AIChefPage: React.FC<AIChefPageProps> = ({
  preferences,
  onAddSuggestedShoppingItems,
  onNavigate,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Namaste! I am your Bharat Rasoi AI Chef. I have your taste profile loaded (${preferences.foodPreference} · ${preferences.favouriteCuisine} · ${preferences.spicePreference} spice · ${preferences.preferredCookingTime}). Ask me for custom dish ideas, spice-balancing rescues, pressure cooker timings, or ingredient substitutions!`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedMsgId, setAddedMsgId] = useState<string | null>(null);

  const sendPrompt = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai-chef', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          preferences,
        }),
      });
      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `chef-${Date.now()}`,
        role: 'assistant',
        content:
          data.reply ||
          'Let us build a quick tadka with cumin, garlic, and seasonal vegetables!',
        timestamp: new Date().toISOString(),
        suggestedIngredients: Array.isArray(data.suggestedIngredients)
          ? data.suggestedIngredients
          : [],
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'I encountered a brief connection hiccup in the kitchen. Please try asking your cooking question again.',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendPrompt(input);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-orange-700 dark:text-orange-400 mb-1">
            Personalized Culinary Assistant
          </p>
          <h1 className="font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
            Bharat Rasoi AI Chef
          </h1>
          <p className="text-sm text-stone-600 dark:text-stone-400 mt-1">
            Active taste context: <strong>{preferences.foodPreference}</strong> ·{' '}
            <strong>{preferences.spicePreference} Spice</strong> ·{' '}
            <strong>{preferences.preferredCookingTime}</strong>
            {preferences.allergies.length > 0 && (
              <span> · Allergies avoided: {preferences.allergies.join(', ')}</span>
            )}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="text-xs font-semibold text-orange-700 dark:text-orange-400 hover:underline whitespace-nowrap cursor-pointer"
        >
          Update Taste Profile →
        </button>
      </div>

      {/* Starter Prompt Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {STARTER_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() => sendPrompt(prompt)}
            disabled={loading}
            className="text-left p-3.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-orange-700/60 text-xs font-medium text-stone-700 dark:text-stone-300 transition-colors cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Thread */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden flex flex-col min-h-[440px]">
        <div className="flex-1 p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[520px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-orange-700 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <ChefHat className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-2xl rounded-xl p-4 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900'
                    : 'bg-stone-50 dark:bg-stone-800/80 text-stone-800 dark:text-stone-200 border border-stone-200/70 dark:border-stone-700'
                }`}
              >
                <div>{msg.content}</div>

                {msg.suggestedIngredients && msg.suggestedIngredients.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-700 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      Key items: {msg.suggestedIngredients.join(' · ')}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        onAddSuggestedShoppingItems(msg.suggestedIngredients!);
                        setAddedMsgId(msg.id);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-orange-700 hover:bg-orange-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>
                        {addedMsgId === msg.id
                          ? 'Added to Shopping List'
                          : 'Add to Shopping List'}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
              <div className="w-8 h-8 rounded-lg bg-orange-700/90 text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <span>AI Chef is preparing your culinary advice...</span>
            </div>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50/70 dark:bg-stone-900 flex gap-2.5"
        >
          <label htmlFor="ai-chef-prompt-input" className="sr-only">
            Ask AI Chef a cooking question
          </label>
          <input
            id="ai-chef-prompt-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about recipes, spice substitutions, tadka tips, or leftover ingredients..."
            className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-orange-700"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 disabled:opacity-50 text-white text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Ask Chef</span>
          </button>
        </form>
      </div>
    </div>
  );
};
