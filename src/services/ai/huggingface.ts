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
