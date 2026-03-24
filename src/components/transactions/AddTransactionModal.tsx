import { useState, useRef } from 'react';
import { CreateTransactionInput } from '@/types';
import { transcribeAudio, extractTransactionData } from '../../services/ai/huggingface';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateTransactionInput) => Promise<string | void>;
};

export const AddTransactionModal = ({ isOpen, onClose, onCreate }: Props) => {
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState<string>('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [recurring, setRecurring] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Voice Input State
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioProcessing(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Failed to access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleAudioProcessing = async (blob: Blob) => {
    setIsProcessingAI(true);
    try {
      const text = await transcribeAudio(blob);
      if (!text || text.trim().length === 0) throw new Error("No speech detected.");
      
      const data = await extractTransactionData(text);
      
      if (data.amount) setAmount(data.amount.toString());
      if (data.category) setCategory(data.category);
      if (data.description) setDescription(data.description);
      if (data.type) setType(data.type as 'income' | 'expense');
      
    } catch (err: any) {
      console.error("AI Processing failed:", err);
      alert(`Could not process voice transaction.\nError: ${err.message || 'Unknown error'}\n\nPlease try again.`);
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const amt = Number(amount);
    if (!amt || !category) {
      alert('Please enter amount and category');
      return;
    }
    setSubmitting(true);
    try {
      await onCreate({
        amount: amt,
        description,
        category,
        date: new Date(date),
        type,
      });
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create transaction');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-surface-light dark:bg-surface-dark w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden transform transition-all flex flex-col max-h-[90vh]"
      >
        <div className="flex justify-between items-center p-6 border-b border-border-light dark:border-border-dark sticky top-0 bg-surface-light dark:bg-surface-dark z-10">
          <div>
            <h2 className="text-xl font-bold text-text-main-light dark:text-white flex items-center gap-3">
              Add New Transaction
              <button
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessingAI}
                className={`flex items-center gap-2 px-3 py-1 text-sm rounded-full transition-colors ${
                  isRecording 
                    ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30 animate-pulse' 
                    : isProcessingAI
                    ? 'bg-gray-500/10 text-gray-500 cursor-wait'
                    : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
              >
                <span className="material-icons text-base">
                  {isRecording ? 'stop_circle' : 'mic'}
                </span>
                {isProcessingAI ? 'Processing...' : isRecording ? 'Recording...' : 'Voice Input'}
              </button>
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
              Enter transaction details below or use voice.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-text-muted-light dark:text-text-muted-dark hover:text-text-main-light dark:hover:text-text-main-dark transition-colors rounded-full p-1"
          >
            <span className="material-icons text-xl">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Amount
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted-light dark:text-gray-400">
                $
              </div>
              <input
                className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm pl-7 py-2.5 transition-all"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                type="number"
                step="0.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Category
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="block w-full appearance-none rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3 pr-10 shadow-sm transition-all cursor-pointer"
              >
                <option
                  value=""
                  className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  Select a category
                </option>
                <option>Food &amp; Dining</option>
                <option>Transportation</option>
                <option>Utilities</option>
                <option>Entertainment</option>
                <option>Healthcare</option>
                <option>Misc</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-text-muted-light dark:text-text-muted-dark">
                <span className="material-icons text-lg">expand_more</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Date
            </label>
            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3"
              type="date"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5 text-text-main-light dark:text-white">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="block w-full rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-gray-700 text-text-main-light dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent sm:text-sm py-2.5 px-3 resize-none"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2 text-text-main-light dark:text-white">
              Transaction Type
            </label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center gap-2 text-text-main-light dark:text-white cursor-pointer">
                <input
                  checked={type === 'income'}
                  onChange={() => setType('income')}
                  type="radio"
                  name="tx-type"
                />{' '}
                Income
              </label>
              <label className="flex items-center gap-2 text-text-main-light dark:text-white cursor-pointer">
                <input
                  checked={type === 'expense'}
                  onChange={() => setType('expense')}
                  type="radio"
                  name="tx-type"
                />{' '}
                Expense
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-text-main-light dark:text-white">
              Recurring Transaction
            </label>
            <input
              className="toggle-checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              type="checkbox"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-light dark:border-border-dark bg-white dark:bg-gray-800 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-text-main-light dark:text-white bg-gray-100 dark:bg-gray-700 border border-border-light dark:border-border-dark rounded-lg shadow-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Adding...' : 'Add Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionModal;
