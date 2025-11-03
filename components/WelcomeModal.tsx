import React, { useState } from 'react';
import { ChartBarIcon } from './icons';

interface WelcomeModalProps {
  onSaveApiKey: (key: string) => void;
  onContinueWithSampleData: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onSaveApiKey, onContinueWithSampleData }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSaveApiKey(apiKey.trim());
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-[fade-in_0.3s_ease-out]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 w-full max-w-lg m-4 shadow-2xl border border-slate-700 transform transition-all animate-[slide-up_0.4s_ease-out]"
      >
        <div className="text-center">
            <ChartBarIcon className="h-12 w-12 mx-auto text-cyan-400 mb-4" />
          <h2 id="welcome-title" className="text-3xl font-bold text-slate-100">Welcome to Stock Tracker</h2>
          <p className="mt-3 text-slate-400 max-w-md mx-auto">
            To get started with live data and stock searching, please enter your free Alpha Vantage API key.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div>
            <label htmlFor="apiKeyWelcome" className="block text-sm font-medium text-slate-300 mb-2">
              Alpha Vantage API Key
            </label>
            <input
              type="text"
              id="apiKeyWelcome"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
                Get a free key from <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300">alphavantage.co</a>.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onContinueWithSampleData}
              className="w-full bg-slate-600 hover:bg-slate-500 text-white font-bold py-2.5 px-4 rounded-lg transition"
            >
              Continue with Sample Data
            </button>
            <button
              type="submit"
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 px-4 rounded-lg transition disabled:bg-cyan-800/50 disabled:cursor-not-allowed"
              disabled={!apiKey.trim()}
            >
              Save and Start Tracking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WelcomeModal;