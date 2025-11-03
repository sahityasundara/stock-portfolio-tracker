import React from 'react';
import { StockData } from '../types';
import StockCard from './StockCard';
import StockCardSkeleton from './StockCardSkeleton';

interface PortfolioListProps {
  data: StockData[];
  onRemoveStock: (symbol: string) => void;
  onRefreshStock: (symbol: string) => void;
  onFetchHistory: (symbol: string) => void;
  onAnalyzeStock: (stock: StockData) => void;
  refreshingSymbols: Set<string>;
  loadingHistorySymbols: Set<string>;
  isRateLimited: boolean;
}

const PortfolioList: React.FC<PortfolioListProps> = ({ 
  data, 
  onRemoveStock, 
  onRefreshStock,
  onFetchHistory,
  onAnalyzeStock,
  refreshingSymbols, 
  loadingHistorySymbols,
  isRateLimited 
}) => {

  if (data.length === 0) {
    return (
      <div className="text-center py-10 bg-slate-800/50 rounded-lg border-2 border-dashed border-slate-700">
        <h3 className="text-lg font-semibold text-slate-300">Your portfolio is empty</h3>
        <p className="mt-2 text-slate-400">Use the search bar above to find and add stocks to track.</p>
      </div>
    );
  }

  return (
    <div>
        <h2 className="text-xl font-bold text-slate-200 mb-4">My Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {data.map(stock => (
                refreshingSymbols.has(stock.symbol) ? (
                  <StockCardSkeleton key={`${stock.symbol}-loading`} />
                ) : (
                  <StockCard 
                    key={stock.symbol} 
                    stock={stock} 
                    onRemove={onRemoveStock}
                    onRefresh={onRefreshStock}
                    onFetchHistory={onFetchHistory}
                    onAnalyze={onAnalyzeStock}
                    isRefreshing={refreshingSymbols.has(stock.symbol)}
                    isLoadingHistory={loadingHistorySymbols.has(stock.symbol)}
                    isRateLimited={isRateLimited}
                  />
                )
            ))}
        </div>
    </div>
  );
};

export default PortfolioList;