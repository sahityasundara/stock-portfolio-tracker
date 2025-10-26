import { AlphaVantageQuoteResponse, AlphaVantageHistoryResponse, StockSearchResult, StockQuote, StockHistoryPoint } from '../types';

const BASE_URL = 'https://www.alphavantage.co/query';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

const apiFetch = async <T>(params: Record<string, string>): Promise<T> => {
    const apiKeyJson = window.localStorage.getItem('alpha_vantage_api_key');
    if (!apiKeyJson) {
        throw new Error('Alpha Vantage API key is not set. Please configure it in the application settings.');
    }

    const apiKey = JSON.parse(apiKeyJson);
    if (!apiKey || typeof apiKey !== 'string') {
        throw new Error('Invalid Alpha Vantage API key. Please re-enter it in the application settings.');
    }

    const queryParams = new URLSearchParams({
        apikey: apiKey,
        ...params,
    });
    
    const url = `${BASE_URL}?${queryParams.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message'] || data['Note'] || data['Information']) {
        const message = data['Error Message'] || data['Note'] || data['Information'] || 'API limit likely reached, or the key is invalid.';
        // Standardize the rate limit error message for easy detection
        if (message.toLowerCase().includes('rate limit') || message.toLowerCase().includes('premium')) {
            throw new Error("API Rate Limit Reached");
        }
        throw new Error(message);
    }

    return data as T;
};

export const searchStocks = async (keywords: string): Promise<StockSearchResult[]> => {
    // No caching for real-time search
    const data = await apiFetch<{ bestMatches: StockSearchResult[] }>({
        function: 'SYMBOL_SEARCH',
        keywords: keywords,
    });
    return data.bestMatches || [];
};

export const getStockQuote = async (symbol: string): Promise<StockQuote> => {
    const cacheKey = `quote_${symbol}`;
    const cachedItem = sessionStorage.getItem(cacheKey);

    if (cachedItem) {
        const { timestamp, data } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
            return data;
        }
    }

    const data = await apiFetch<AlphaVantageQuoteResponse>({
        function: 'GLOBAL_QUOTE',
        symbol: symbol,
    });
    const quote = data['Global Quote'];
    if (!quote) {
        throw new Error('Invalid symbol or no quote data returned.');
    }
    const result: StockQuote = {
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
    };
    
    sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
    
    return result;
};

export const getStockHistory = async (symbol: string): Promise<StockHistoryPoint[]> => {
    const cacheKey = `history_${symbol}`;
    const cachedItem = sessionStorage.getItem(cacheKey);

    if (cachedItem) {
        const { timestamp, data } = JSON.parse(cachedItem);
        if (Date.now() - timestamp < CACHE_DURATION_MS) {
            return data;
        }
    }

    const data = await apiFetch<AlphaVantageHistoryResponse>({
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: '60min',
        outputsize: 'compact',
    });

    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    if (!timeSeriesKey) {
        throw new Error('Could not find time series data in API response.');
    }

    const timeSeries = data[timeSeriesKey];
    if (!timeSeries) return [];

    const result = Object.values(timeSeries)
        .map(entry => ({
            price: parseFloat(entry['4. close']),
        }))
        .reverse();
        
    sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: result }));
        
    return result;
};