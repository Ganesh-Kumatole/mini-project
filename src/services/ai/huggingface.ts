export interface FinancialStats {
  totalIncome: number;
  totalExpense: number;
  savingsRate: number; // percentage
  monthOverMonthChange: number; // percentage, positive = spending increased
  topCategories: { name: string; amount: number }[];
  budgetAlerts: { category: string; percentUsed: number }[];
  biggestExpense: { description: string; amount: number } | null;
}

export interface AIInsightsResult {
  summary: string;
  tips: string[];
}

export const generateFinancialInsights = async (
  stats: FinancialStats
): Promise<AIInsightsResult> => {
  const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key is missing');
  }

  const topCatText = stats.topCategories
    .map((c, i) => `${i + 1}. ${c.name}: $${c.amount.toFixed(2)}`)
    .join(', ');

  const budgetAlertText =
    stats.budgetAlerts.length > 0
      ? stats.budgetAlerts
          .map((b) => `${b.category} (${b.percentUsed}% used)`)
          .join(', ')
      : 'None';

  const prompt = `You are a concise, friendly personal finance advisor AI.
Analyze the following financial summary and provide advice.

FINANCIAL SUMMARY:
- Total Income: $${stats.totalIncome.toFixed(2)}
- Total Expenses: $${stats.totalExpense.toFixed(2)}
- Savings Rate: ${stats.savingsRate.toFixed(1)}%
- Month-over-month spending change: ${stats.monthOverMonthChange >= 0 ? '+' : ''}${stats.monthOverMonthChange.toFixed(1)}%
- Top Spending Categories: ${topCatText || 'No data'}
- Budget Alerts (near/over limit): ${budgetAlertText}
- Biggest Single Expense: ${stats.biggestExpense ? `${stats.biggestExpense.description} ($${stats.biggestExpense.amount.toFixed(2)})` : 'None'}

Respond ONLY with a strictly valid JSON object (no markdown, no explanation outside JSON):
{
  "summary": "<2-3 sentence friendly narrative about the user's financial health>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}`;

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-7B-Instruct:together',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('AI insights error:', err);
    throw new Error('Failed to generate insights: ' + response.statusText);
  }

  const result = await response.json();
  const generatedText = result.choices?.[0]?.message?.content || '';

  const tryParse = (text: string): AIInsightsResult | null => {
    try {
      const parsed = JSON.parse(text.trim());
      if (typeof parsed.summary === 'string' && Array.isArray(parsed.tips)) {
        return parsed as AIInsightsResult;
      }
    } catch {
      /* fall through */
    }
    return null;
  };

  const direct = tryParse(generatedText);
  if (direct) return direct;

  const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const fromMatch = tryParse(jsonMatch[0]);
    if (fromMatch) return fromMatch;
  }

  // Graceful fallback — AI responded but we couldn't parse it
  return {
    summary:
      'Your financial snapshot has been analysed. Keep tracking your spending to unlock more personalised insights.',
    tips: [
      'Review your top spending categories regularly.',
      'Aim to save at least 20% of your monthly income.',
      'Set budget limits for categories where spending is highest.',
    ],
  };
};

// ── AI Chat Follow-up ────────────────────────────────────────────────────────

export const askFollowUp = async (
  stats: FinancialStats,
  question: string,
  conversationHistory: { role: 'user' | 'assistant'; content: string }[] = []
): Promise<string> => {
  const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) throw new Error('Hugging Face API key is missing');

  const topCatText = stats.topCategories
    .map((c, i) => `${i + 1}. ${c.name}: $${c.amount.toFixed(2)}`)
    .join(', ');

  const systemPrompt = `You are a friendly, concise personal finance advisor AI.
The user's current financial context (this month):
- Income: $${stats.totalIncome.toFixed(2)}, Expenses: $${stats.totalExpense.toFixed(2)}
- Savings Rate: ${stats.savingsRate.toFixed(1)}%
- Month-over-month spending change: ${stats.monthOverMonthChange >= 0 ? '+' : ''}${stats.monthOverMonthChange.toFixed(1)}%
- Top categories: ${topCatText || 'No data'}
- Budget alerts: ${stats.budgetAlerts.length > 0 ? stats.budgetAlerts.map(b => `${b.category} (${b.percentUsed}% used)`).join(', ') : 'None'}

Answer the user's question concisely in 2-4 sentences. Use plain text, no markdown.`;

  const messages = [
    { role: 'system' as const, content: systemPrompt },
    ...conversationHistory,
    { role: 'user' as const, content: question },
  ];

  const response = await fetch('https://router.huggingface.co/v1/chat/completions', {
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      model: 'Qwen/Qwen2.5-7B-Instruct:together',
      messages,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('AI chat error:', err);
    throw new Error('Failed to get AI response: ' + response.statusText);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content?.trim() || 'Sorry, I could not generate a response.';
};

export const transcribeAudio = async (audioBlob: Blob): Promise<string> => {
  const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key is missing');
  }

  // Using whisper-large-v3 which is fully supported on the free tier
  const response = await fetch(
    'https://router.huggingface.co/hf-inference/models/openai/whisper-large-v3',
    {
      headers: { Authorization: `Bearer ${HF_API_KEY}` },
      method: 'POST',
      body: audioBlob,
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Transcription error:', err);
    throw new Error('Failed to transcribe audio: ' + response.statusText);
  }

  const result = await response.json();
  return result.text || '';
};

export const extractTransactionData = async (text: string) => {
  const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
  if (!HF_API_KEY) {
    throw new Error('Hugging Face API key is missing');
  }

  const prompt = `
  You are a financial assistant. 
  Extract the transaction details from the following text.
  Return ONLY a strictly valid JSON object. Do not include any explanation or markdown formatting outside the JSON block.
  Keys to extract:
  - "amount" (number)
  - "category" (string, choose best match from: "Food & Dining", "Transportation", "Utilities", "Entertainment", "Healthcare", "Misc")
  - "description" (short string describing the purchase)
  - "type" (string: either "income" or "expense")
  Text: "${text}"`;

  // Sending request directly to HF Router (OpenAI compatible endpoint)
  const response = await fetch(
    'https://router.huggingface.co/v1/chat/completions',
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct:together",
        messages: [{ role: 'user', content: prompt }]
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    console.error('Data extraction error:', err);
    throw new Error('Failed to extract data: ' + response.statusText);
  }

  const result = await response.json();
  const generatedText = result.choices?.[0]?.message?.content || '';

  try {
    // Try parsing directly
    return JSON.parse(generatedText.trim());
  } catch (e) {
    // Fallback: search for JSON block within response if it returned extra text
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerErr) {
        console.error('Could not parse matched block', jsonMatch[0]);
      }
    }
    console.error('Failed to parse JSON from AI response:', generatedText);
    throw new Error('Failed to parse AI response into JSON');
  }
};
