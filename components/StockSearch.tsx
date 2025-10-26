import React, { useState, useEffect, useCallback } from 'react';
import { StockSearchResult } from '../types';
import { searchStocks } from '../services/alphaVantageService';
import { SearchIcon, PlusIcon } from './icons';

interface StockSearchProps {
  onSelectStock: (stock: StockSearchResult) => void;
  disabled?: boolean;
  onError: (error: Error) => void;
}

const StockSearch: React.FC<StockSearchProps> = ({ onSelectStock, disabled = false, onError }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await searchStocks(searchQuery);
      setResults(data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An unknown error occurred during search.');
      setError(error.message); // Keep local error message for immediate feedback
      onError(error); // Notify parent component
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [onError]);

  useEffect(() => {
    if (disabled) {
      setQuery('');
      setResults([]);
      return;
    }
    const handler = setTimeout(() => {
      performSearch(query);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [query, performSearch, disabled]);

  const handleSelect = (stock: StockSearchResult) => {
    onSelectStock(stock);
    setQuery('');
    setResults([]);
  }

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={disabled ? "API rate limit reached or key not set" : "Search for a stock (e.g., AAPL, MSFT)"}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition disabled:bg-slate-800/50 disabled:cursor-not-allowed disabled:placeholder:text-slate-500"
          disabled={disabled}
        />
        {isLoading && <div className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 border-t-2 border-slate-400 rounded-full animate-spin"></div>}
      </div>
      {error && !disabled && <p className="text-red-400 text-sm mt-2">{error}</p>}
      {results.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.map((stock) => (
            <li key={stock['1. symbol']} className="border-b border-slate-700 last:border-b-0">
              <button 
                onClick={() => handleSelect(stock)}
                className="w-full flex justify-between items-center px-4 py-3 text-left hover:bg-slate-700/50 transition duration-150"
              >
                <div>
                  <p className="font-bold text-slate-100">{stock['1. symbol']}</p>
                  <p className="text-sm text-slate-400">{stock['2. name']}</p>
                </div>
                <PlusIcon className="h-6 w-6 text-cyan-400"/>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StockSearch;