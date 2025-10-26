import React, { useState } from 'react';

interface SettingsModalProps {
  currentKey: string | null;
  onClose: () => void;
  onSave: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ currentKey, onClose, onSave }) => {
  const [apiKey, setApiKey] = useState(currentKey || '');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 w-full max-w-md m-4 shadow-2xl border border-slate-700 transform transition-all animate-[slide-up_0.3s_ease-out]"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 id="settings-title" className="text-2xl font-bold text-slate-100">Settings</h2>
          <p className="mt-2 text-slate-400">
            Configure your API keys here.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-slate-300 mb-2">
              Alpha Vantage API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
                You can get a free key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">alphavantage.co</a>.
            </p>
          </div>
          
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsModal;
