import React, { useState, useEffect } from 'react';
import { StockData } from '../types';
import { SparklesIcon } from './icons';

interface AnalysisModalProps {
  stock: StockData;
  onClose: () => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ stock, onClose }) => {
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await getStockAnalysis(stock.symbol, stock.name);
        setAnalysis(result);
      } catch (e) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalysis();
  }, [stock]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-10">
          <div className="h-8 w-8 mx-auto border-t-2 border-cyan-400 rounded-full animate-spin"></div>
          <p className="mt-4 text-slate-400">Generating AI analysis...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-left">
          <p className="font-bold">Analysis Failed</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      );
    }
    return (
        <div 
          className="text-slate-300 whitespace-pre-wrap prose prose-invert prose-sm max-w-none prose-headings:text-cyan-400 prose-strong:text-slate-100"
          dangerouslySetInnerHTML={{ __html: analysis.replace(/### (.*)/g, '<h3>$1</h3>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
        />
    );
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity animate-[fade-in_0.2s_ease-out]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="analysis-title"
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 w-full max-w-2xl m-4 shadow-2xl border border-slate-700 transform transition-all animate-[slide-up_0.3s_ease-out] flex flex-col"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '85vh' }}
      >
        <div className="text-center pb-4 border-b border-slate-700">
            <SparklesIcon className="h-8 w-8 mx-auto text-cyan-400 mb-2" />
          <h2 id="analysis-title" className="text-2xl font-bold text-slate-100">AI-Powered Analysis</h2>
          <p className="mt-1 text-slate-400">
            <span className="font-bold text-cyan-400">{stock.symbol}</span> - {stock.name}
          </p>
        </div>
        
        <div className="mt-6 flex-1 overflow-y-auto pr-2">
          {renderContent()}
        </div>
          
        <div className="flex justify-end gap-4 pt-6 mt-2 border-t border-slate-700">
            <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg transition"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisModal;
