import { useState, useRef, useCallback } from 'react';
import { askFollowUp, FinancialStats } from '@/services/ai/huggingface';
import { SectionCard } from './InsightsPrimitives';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  loading?: boolean;
}

const SUGGESTED_QUESTIONS = [
  'Why is my spending so high this month?',
  'How can I improve my savings rate?',
  'Which budget category needs most attention?',
  "What's a realistic savings goal for me?",
];

export const AIChatSection = ({ stats }: { stats: FinancialStats }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () =>
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const sendMessage = useCallback(
    async (question: string) => {
      if (!question.trim() || isAsking) return;
      setInput('');
      setIsAsking(true);
      const history = messages
        .filter((m) => !m.loading)
        .map((m) => ({ role: m.role, content: m.content }));
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: '', loading: true },
      ]);
      setTimeout(scrollToBottom, 50);
      try {
        const answer = await askFollowUp(stats, question, history);
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { role: 'assistant', content: answer } : m,
          ),
        );
      } catch {
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1
              ? {
                  role: 'assistant',
                  content: "Sorry, couldn't get a response. Try again.",
                }
              : m,
          ),
        );
      } finally {
        setIsAsking(false);
        setTimeout(scrollToBottom, 50);
      }
    },
    [messages, isAsking, stats],
  );

  return (
    <SectionCard className="flex flex-col overflow-hidden !p-0">
      <div className="flex items-center gap-2 px-6 pt-6 pb-4 border-b border-border-light dark:border-border-dark">
        <span className="material-icons text-indigo-500">forum</span>
        <h2 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
          Ask Your Finance AI
        </h2>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-text-secondary-light dark:text-text-secondary-dark hover:text-red-500 transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      <div className="overflow-y-auto px-6 py-4 space-y-4 min-h-[220px] max-h-[340px]">
        {messages.length === 0 ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              Try one of these:
            </p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <span className="material-icons text-indigo-500 text-base mt-1 flex-shrink-0">
                  auto_awesome
                </span>
              )}
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-text-primary-light dark:text-text-primary-dark rounded-bl-sm'
                }`}
              >
                {msg.loading ? (
                  <span className="flex gap-1 items-center py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                  </span>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-6 pb-6 pt-2">
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-2.5 border border-transparent focus-within:border-indigo-400 dark:focus-within:border-indigo-600 transition-colors">
          <input
            id="ai-chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Type a question…"
            disabled={isAsking}
            className="flex-1 bg-transparent text-sm text-text-primary-light dark:text-text-primary-dark placeholder:text-text-secondary-light dark:placeholder:text-text-secondary-dark outline-none disabled:opacity-50"
          />
          <button
            id="ai-chat-send-btn"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isAsking}
            className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <span className="material-icons text-sm">
              {isAsking ? 'hourglass_empty' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </SectionCard>
  );
};
