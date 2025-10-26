import React, { useMemo } from 'react';
import { StockData } from '../types';

interface PortfolioSummaryProps {
  data: StockData[];
}

const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({ data }) => {
  const { totalValue, totalCost, totalPL, totalPLPercent } = useMemo(() => {
    const totalValue = data.reduce((acc, stock) => acc + stock.currentPrice * stock.shares, 0);
    const totalCost = data.reduce((acc, stock) => acc + stock.purchasePrice * stock.shares, 0);
    const totalPL = totalValue - totalCost;
    const totalPLPercent = totalCost > 0 ? (totalPL / totalCost) * 100 : 0;
    return { totalValue, totalCost, totalPL, totalPLPercent };
  }, [data]);

  const plColor = totalPL >= 0 ? 'text-green-400' : 'text-red-400';

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 md:p-6 shadow-lg border border-slate-700">
      <h2 className="text-xl font-bold text-slate-200 mb-4">Portfolio Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p className="text-sm text-slate-400">Total Value</p>
          <p className="text-2xl font-semibold text-slate-50">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Total Cost</p>
          <p className="text-2xl font-semibold text-slate-50">${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Total P/L</p>
          <p className={`text-2xl font-semibold ${plColor}`}>${totalPL.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div>
          <p className="text-sm text-slate-400">Total P/L %</p>
          <p className={`text-2xl font-semibold ${plColor}`}>{totalPLPercent.toFixed(2)}%</p>
        </div>
      </div>
    </div>
  );
};

export default PortfolioSummary;