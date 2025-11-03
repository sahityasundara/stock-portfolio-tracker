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
import AnalysisModal from './components/AnalysisModal';
import WelcomeModal from './components/WelcomeModal';

const App: React.FC = () => {
  const [portfolio, setPortfolio] = useLocalStorage<PortfolioItem[]>('stock_portfolio', samplePortfolioItems);
  const [alphaVantageApiKey, setAlphaVantageApiKey] = useLocalStorage<string | null>('alpha_vantage_api_key', null);
  
  const [portfolioData, setPortfolioData] = useLocalStorage<StockData[]>('stock_portfolio_data', samplePortfolioData);
  
  const [refreshingSymbols, setRefreshingSymbols] = useState<Set<string>>(new Set());
  const [loadingHistorySymbols, setLoadingHistorySymbols] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  const [isAddStockModalOpen, setIsAddStockModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [stockForAnalysis, setStockForAnalysis] = useState<StockData | null>(null);
  
  const [hasOnboarded, setHasOnboarded] = useLocalStorage('has_onboarded', false);
  const [isRateLimited, setIsRateLimited] = useLocalStorage<{ limited: boolean; until: number }>('api_rate_limited', { limited: false, until: 0 });

  const isApiKeyMissing = !alphaVantageApiKey;
  const showWelcomeModal = isApiKeyMissing && !hasOnboarded;

  useEffect(() => {
    // This effect ensures that if the portfolio has no items (e.g., user clears localStorage),
    // it gets repopulated with sample data on next load.
    if (portfolio.length === 0) {
        setPortfolio(samplePortfolioItems);
        setPortfolioData(samplePortfolioData);
    }
  }, []);

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
    setHasOnboarded(true);
  };

  const handleContinueWithSample = () => {
    setHasOnboarded(true);
  };
  
  const handleOpenAnalysisModal = (stock: StockData) => {
    setStockForAnalysis(stock);
    setIsAnalysisModalOpen(true);
  };

  const sortedPortfolioData = useMemo(() => {
    return [...portfolioData].sort((a, b) => a.symbol.localeCompare(b.symbol));
  }, [portfolioData]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans">
      <Header onSettingsClick={() => setIsSettingsModalOpen(true)} />
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        {isApiKeyMissing && hasOnboarded && (
          <div className="mb-6 bg-cyan-900/50 border border-cyan-700 text-cyan-200 px-4 py-3 rounded-lg flex justify-between items-center">
            <div>
              <strong className="font-bold">Viewing Sample Data.</strong>
              <span className="block sm:inline ml-2">To get live prices, add your free Alpha Vantage API key.</span>
            </div>
            <button 
              onClick={() => setIsSettingsModalOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition text-sm whitespace-nowrap"
            >
              Add API Key
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
            onAnalyzeStock={handleOpenAnalysisModal}
            refreshingSymbols={refreshingSymbols}
            loadingHistorySymbols={loadingHistorySymbols}
            isRateLimited={isRateLimited.limited}
          />
        </div>
      </main>

      {showWelcomeModal && (
        <WelcomeModal 
          onSaveApiKey={handleSaveApiKey}
          onContinueWithSampleData={handleContinueWithSample}
        />
      )}

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
      {isAnalysisModalOpen && stockForAnalysis && (
        <AnalysisModal
            stock={stockForAnalysis}
            onClose={() => setIsAnalysisModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;