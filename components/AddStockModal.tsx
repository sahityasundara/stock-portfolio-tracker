import React, { useState } from 'react';
import { StockSearchResult } from '../types';

interface AddStockModalProps {
  stock: StockSearchResult;
  onClose: () => void;
  onAddStock: (symbol: string, name: string, shares: number, purchasePrice: number) => void;
}

const AddStockModal: React.FC<AddStockModalProps> = ({ stock, onClose, onAddStock }) => {
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sharesNum = parseFloat(shares);
    const priceNum = parseFloat(purchasePrice);

    if (isNaN(sharesNum) || sharesNum <= 0 || isNaN(priceNum) || priceNum <= 0) {
      setError('Please enter valid positive numbers for shares and price.');
      return;
    }
    
    setError('');
    onAddStock(stock['1. symbol'], stock['2. name'], sharesNum, priceNum);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-xl p-6 md:p-8 w-full max-w-md m-4 shadow-2xl border border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-100">Add Stock to Portfolio</h2>
          <p className="mt-2 text-slate-400">
            <span className="font-bold text-cyan-400">{stock['1. symbol']}</span> - {stock['2. name']}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="shares" className="block text-sm font-medium text-slate-300 mb-1">
              Number of Shares
            </label>
            <input
              type="number"
              id="shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              placeholder="e.g., 10"
              step="any"
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>
          <div>
            <label htmlFor="purchasePrice" className="block text-sm font-medium text-slate-300 mb-1">
              Purchase Price per Share
            </label>
            <input
              type="number"
              id="purchasePrice"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder="e.g., 150.25"
              step="any"
              className="w-full bg-slate-900 border border-slate-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
              required
            />
          </div>
          
          {error && <p className="text-red-400 text-sm">{error}</p>}
          
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
              Add to Portfolio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStockModal;