import { PortfolioItem, StockData } from '../types';

export const samplePortfolioItems: PortfolioItem[] = [
  { symbol: 'AAPL', name: 'Apple Inc', shares: 10, purchasePrice: 150.25 },
  { symbol: 'MSFT', name: 'Microsoft Corporation', shares: 15, purchasePrice: 305.50 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', shares: 5, purchasePrice: 135.80 },
  { symbol: 'AMZN', name: 'Amazon.com, Inc.', shares: 8, purchasePrice: 130.45 },
];

const generateSampleHistory = (basePrice: number) => {
    let history = [];
    let currentPrice = basePrice * (0.9 + Math.random() * 0.1);
    for (let i = 0; i < 30; i++) {
        history.push({ price: currentPrice });
        currentPrice *= (0.98 + Math.random() * 0.04);
    }
    return history;
};

export const samplePortfolioData: StockData[] = [
  {
    symbol: 'AAPL',
    name: 'Apple Inc',
    shares: 10,
    purchasePrice: 150.25,
    currentPrice: 172.50,
    change: 2.25,
    changePercent: '1.32%',
    history: generateSampleHistory(172.50),
    lastUpdated: Date.now() - 60000, // 1 minute ago
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    shares: 15,
    purchasePrice: 305.50,
    currentPrice: 334.75,
    change: -1.45,
    changePercent: '-0.43%',
    history: generateSampleHistory(334.75),
    lastUpdated: Date.now() - 120000, // 2 minutes ago
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc',
    shares: 5,
    purchasePrice: 135.80,
    currentPrice: 138.20,
    change: 1.10,
    changePercent: '0.80%',
    history: generateSampleHistory(138.20),
    lastUpdated: Date.now() - 30000, // 30 seconds ago
  },
    {
    symbol: 'AMZN',
    name: 'Amazon.com, Inc.',
    shares: 8,
    purchasePrice: 130.45,
    currentPrice: 128.90,
    change: -2.15,
    changePercent: '-1.64%',
    history: generateSampleHistory(128.90),
    lastUpdated: Date.now() - 180000, // 3 minutes ago
  },
];