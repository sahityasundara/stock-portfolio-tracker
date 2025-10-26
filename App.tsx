import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PortfolioItem, StockData, StockSearchResult } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { getStockQuote, getStockHistory } from './services/alphaVantageService';
import { samplePortfolioItems, samplePortfolioData } from './data/sampleData';
import Header from './components/Header';
import PortfolioSummary from './components/PortfolioSummary';
import StockSearch from './components/StockSearch';
import PortfolioList from './components/PortfolioList';
import AddStockModal from './components/AddStockModal';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioItem[]>('stock_portfolio', samplePortfolioItems);
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useLocalStorage<string | null>('alpha_vantage_api_key', null);
  
  const [portfolioData, setPortfolioData] = useLocalStorage<StockData[]>('stock_portfolio_data', samplePortfolioData);
  
  const [refreshingSymbols, setRefreshingSymbols] = useState<Set<string>>(new Set());
  const [loadingHistorySymbols, setLoadingHistorySymbols] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  
  const [isApiBannerDismissed, setIsApiBannerDismissed] = useLocalStorage('api_banner_dismissed', false);
  const [isRateLimited, setIsRateLimited] = useLocalStorage<{ limited: boolean; until: number }>('api_rate_limited', { limited: false, until: 0 });

  const isApiKeyMissing = !alphaVantageApiKey;

  useEffect(() => {
    // This effect ensures that if the portfolio has no items (e.g., user clears localStorage),
    // it gets repopulated with sample data on next load.
    if (portfolio.length === 0) {
        setPortfolio(samplePortfolioItems);
        setPortfolioData(samplePortfolioData);
    }
  }, []);

  useEffect(() => {
    // Sync portfolioData if portfolio changes from another tab/window
    if (portfolio.length !== portfolioData.length || portfolio.some((p, i) => p.symbol !== portfolioData[i]?.symbol)) {
      setPortfolioData(
        portfolio.map(item => {
          const existingData = portfolioData.find(d => d.symbol === item.symbol);
          return existingData || {
            ...item,
            currentPrice: item.purchasePrice,
            change: 0,
            changePercent: '0.00%',
            history: [],
          };
        })
      );
    }
  }, [portfolio, portfolioData, setPortfolioData]);

  useEffect(() => {
    if (isRateLimited.limited && Date.now() > isRateLimited.until) {
      setIsRateLimited({ limited: false, until: 0 });
    }
  }, [isRateLimited, setIsRateLimited]);

  const handleApiError = useCallback((err: unknown) => {
    if (err instanceof Error) {
        if (err.message.includes('API Rate Limit Reached')) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(0, 0, 0, 0);
            setIsRateLimited({ limited: true, until: tomorrow.getTime() });
        } else {
             const errorMessage = `Failed to fetch data: ${err.message}`;
             setError(errorMessage);
             setTimeout(() => setError(prev => prev === errorMessage ? null : prev), 5000);
        }
    } else {
        setError('An unknown error occurred.');
    }
  }, [setIsRateLimited]);

  const handleRefreshStock = useCallback(async (symbol: string) => {
    setRefreshingSymbols(prev => new Set(prev).add(symbol));
    try {
        const quote = await getStockQuote(symbol);
        setPortfolioData(prevData => prevData.map(stock => 
            stock.symbol === symbol 
                ? { ...stock, currentPrice: quote.price, change: quote.change, changePercent: quote.changePercent, lastUpdated: Date.now() } 
                : stock
        ));
    } catch (err) {
        handleApiError(err);
    } finally {
        setRefreshingSymbols(prev => {
            const newSet = new Set(prev);
            newSet.delete(symbol);
            return newSet;
        });
    }
  }, [handleApiError, setPortfolioData]);
  
  const handleFetchHistory = useCallback(async (symbol: string) => {
    setLoadingHistorySymbols(prev => new Set(prev).add(symbol));
    try {
        const history = await getStockHistory(symbol);
        setPortfolioData(prevData => prevData.map(stock => 
            stock.symbol === symbol 
                ? { ...stock, history: history } 
                : stock
        ));
    } catch (err) {
        handleApiError(err);
    } finally {
        setLoadingHistorySymbols(prev => {
            const newSet = new Set(prev);
            newSet.delete(symbol);
            return newSet;
        });
    }
  }, [handleApiError, setPortfolioData]);

  const handleSelectStock = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setIsAddStockModalOpen(true);
  };

  const handleAddStock = (symbol: string, name: string, shares: number, purchasePrice: number) => {
    const newItem: PortfolioItem = { symbol, name, shares, purchasePrice };
    const newStockData: StockData = { 
      ...newItem, 
      currentPrice: purchasePrice, 
      change: 0, 
      changePercent: '0.00%', 
      history: [] 
    };
    
    setPortfolio(prev => [...prev.filter(p => p.symbol !== newItem.symbol), newItem]);
    setPortfolioData(prev => [...prev.filter(p => p.symbol !== newStockData.symbol), newStockData]);
    
    setIsAddStockModalOpen(false);
    setSelectedStock(null);
  };

  const handleRemoveStock = (symbol: string) => {
    setPortfolio(prev => prev.filter(item => item.symbol !== symbol));
    setPortfolioData(prev => prev.filter(item => item.symbol !== symbol));
  };
  
  const handleSaveApiKey = (key: string) => {
    setAlphaVantageApiKey(key);
    setIsSettingsModalOpen(false);
  };
  
  const sortedPortfolioData = useMemo(() => {
    return [...portfolioData].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [portfolioData]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {isApiKeyMissing && !isApiBannerDismissed && (
          <div className="mb-6 bg-cyan-900/50 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-lg relative">
            <strong className="font-bold">Showing Sample Data.</strong>
            <span className="block sm:inline ml-2">To get live prices and search for new stocks, add your free Alpha Vantage API key in Settings.</span>
            <button 
              onClick={() => setIsApiBannerDismissed(true)} 
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              aria-label="Dismiss"
            >
              <svg className="fill-current h-6 w-6 text-cyan-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
            </button>
          </div>
        )}
        
        {isRateLimited.limited ? (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                <p className="font-bold">API Rate Limit Reached</p>
                <p className="text-sm">You've reached the daily limit for the free API key. Live data functionality will be restored tomorrow.</p>
            </div>
        ) : error && (
            <div className="mb-6 bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg text-center">
                <p className="font-bold">An Error Occurred</p>
                <p className="text-sm">{error}</p>
            </div>
        )}

        <PortfolioSummary data={sortedPortfolioData} />
        
        <div className="mt-8">
          <StockSearch 
            onSelectStock={handleSelectStock} 
            disabled={isApiKeyMissing || isRateLimited.limited} 
            onError={handleApiError}
          />
        </div>
        
        <div className="mt-8">
          <PortfolioList 
            data={sortedPortfolioData} 
            onRemoveStock={handleRemoveStock}
            onRefreshStock={handleRefreshStock}
            onFetchHistory={handleFetchHistory}
            refreshingSymbols={refreshingSymbols}
            loadingHistorySymbols={loadingHistorySymbols}
            isRateLimited={isRateLimited.limited}
          />
        </div>
      </main>

      {isAddStockModalOpen && selectedStock && (
        <AddStockModal 
          stock={selectedStock}
          onClose={() => setIsAddStockModalOpen(false)}
          onAddStock={handleAddStock}
        />
      )}
      {isSettingsModalOpen && (
        <SettingsModal
          currentKey={alphaVantageApiKey}
          onClose={() => setIsSettingsModalOpen(false)}
          onSave={handleSaveApiKey}
        />
      )}
    </div>
  );
};

export default App;