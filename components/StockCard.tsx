import React from 'react';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { StockData } from '../types';
import { TrashIcon, RefreshIcon, SparklesIcon } from './icons';

interface StockCardProps {
  stock: StockData;
  onRemove: (symbol: string) => void;
  onRefresh: (symbol: string) => void;
  onFetchHistory: (symbol: string) => void;
  onAnalyze: (stock: StockData) => void;
  isRefreshing: boolean;
  isLoadingHistory: boolean;
  isRateLimited: boolean;
}

const StockCard: React.FC<StockCardProps> = ({ stock, onRemove, onRefresh, onFetchHistory, onAnalyze, isRefreshing, isLoadingHistory, isRateLimited }) => {
  const isPriceLoaded = !!stock.lastUpdated;
  const hasHistory = stock.history && stock.history.length > 0;

  const change = isPriceLoaded ? stock.change : 0;
  const currentPrice = isPriceLoaded ? stock.currentPrice : stock.purchasePrice;
  const changePercent = isPriceLoaded ? stock.changePercent : '0%';

  const changeColor = change >= 0 ? 'text-green-400' : 'text-red-400';
  const totalValue = currentPrice * stock.shares;
  const totalCost = stock.purchasePrice * stock.shares;
  const pl = totalValue - totalCost;
  const plPercent = totalCost > 0 ? (pl/totalCost) * 100 : 0;
  const plColor = pl >= 0 ? 'text-green-400' : 'text-red-400';

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  return (
    <div className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700 flex flex-col justify-between transition-all hover:border-cyan-500/50 hover:shadow-cyan-500/10">
      <div>
        <div className="flex justify-between items-start">
          <div className="flex-1 overflow-hidden">
            <h3 className="text-2xl font-bold text-slate-100 truncate">{stock.symbol}</h3>
            <p className="text-sm text-slate-400 truncate">{stock.name}</p>
          </div>
          <div className="flex items-center space-x-1">
            <button onClick={() => onRefresh(stock.symbol)} disabled={isRefreshing || isRateLimited} className="p-1 text-slate-500 hover:text-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label={`Refresh ${stock.symbol}`}>
              <RefreshIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            <button onClick={() => onRemove(stock.symbol)} className="p-1 text-slate-500 hover:text-red-400 transition" aria-label={`Remove ${stock.symbol}`}>
              <TrashIcon className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-baseline my-4">
          <p className="text-3xl font-semibold text-slate-50">${currentPrice.toFixed(2)}</p>
          {isPriceLoaded && (
            <div className={`text-right font-medium ${changeColor}`}>
              <p>{change.toFixed(2)}</p>
              <p>({parseFloat(changePercent).toFixed(2)}%)</p>
            </div>
          )}
        </div>

        <div className="h-20 -mx-4">
          {hasHistory ? (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stock.history}>
                    <defs>
                        <linearGradient id={`color-${stock.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={change >= 0 ? '#22c55e' : '#ef4444'} stopOpacity={0.4}/>
                            <stop offset="95%" stopColor={change >= 0 ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Tooltip
                        contentStyle={{ 
                            backgroundColor: 'rgba(23, 32, 51, 0.8)',
                            borderColor: '#334155',
                            color: '#cbd5e1',
                            fontSize: '12px',
                            padding: '4px 8px',
                            borderRadius: '4px'
                         }}
                        itemStyle={{ color: '#cbd5e1' }}
                        labelFormatter={() => ''}
                        formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
                    />
                    <Line type="monotone" dataKey="price" stroke={change >= 0 ? '#22c55e' : '#ef4444'} strokeWidth={2} dot={false} />
                </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              {!isPriceLoaded && !isRateLimited && <p className="text-slate-400 text-sm">Click refresh for live price.</p>}
              {isPriceLoaded && !isRateLimited && (
                <button 
                  onClick={() => onFetchHistory(stock.symbol)} 
                  disabled={isLoadingHistory}
                  className="bg-slate-700/50 hover:bg-slate-700 text-cyan-300 text-xs font-semibold py-1.5 px-3 rounded-md transition disabled:opacity-50 disabled:cursor-wait"
                >
                  {isLoadingHistory ? 'Loading...' : 'Load Chart'}
                </button>
              )}
              {isRateLimited && <p className="text-slate-400 text-sm">API limit reached.</p>}
            </div>
          )}
        </div>
        <div className="mt-4">
            <button
                onClick={() => onAnalyze(stock)}
                className="w-full flex items-center justify-center gap-2 bg-cyan-600/80 hover:bg-cyan-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105"
                aria-label={`Analyze ${stock.symbol} with AI`}
            >
                <SparklesIcon className="h-5 w-5" />
                <span>Analyze with AI</span>
            </button>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-700 text-xs">
         <div className="flex justify-between text-slate-400">
            <span>Value</span>
            <span className="font-semibold text-slate-200">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
         </div>
         <div className="flex justify-between mt-1 text-slate-400">
            <span>P/L</span>
            <span className={`font-semibold ${plColor}`}>
                ${pl.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({plPercent.toFixed(2)}%)
            </span>
         </div>
         <div className="flex justify-between mt-1 text-slate-400">
            <span>Shares</span>
            <span className="font-semibold text-slate-200">{stock.shares} @ ${stock.purchasePrice.toFixed(2)}</span>
         </div>
         {isPriceLoaded && (
            <div className="flex justify-end text-slate-500 mt-2">
                <span>Last updated: {formatTimestamp(stock.lastUpdated!)}</span>
            </div>
         )}
      </div>
    </div>
  );
};

export default StockCard;