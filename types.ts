export interface PortfolioItem {
  symbol: string;
  name: string;
  shares: number;
  purchasePrice: number;
}

export interface StockHistoryPoint {
  price: number;
}

export interface StockData extends PortfolioItem {
  currentPrice: number;
  change: number;
  changePercent: string;
  history: StockHistoryPoint[];
  lastUpdated?: number;
}

export interface StockSearchResult {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

export interface AlphaVantageQuoteResponse {
  'Global Quote': {
    '01. symbol': string;
    '02. open': string;
    '03. high': string;
    '04. low': string;
    '05. price': string;
    '06. volume': string;
    '07. latest trading day': string;
    '08. previous close': string;
    '09. change': string;
    '10. change percent': string;
  };
}

export interface StockQuote {
    price: number;
    change: number;
    changePercent: string;
}

export interface AlphaVantageHistoryResponse {
    [key: string]: {
        [key: string]: {
            '1. open': string;
            '2. high': string;
            '3. low': string;
            '4. close': string;
            '5. volume': string;
        }
    }
}