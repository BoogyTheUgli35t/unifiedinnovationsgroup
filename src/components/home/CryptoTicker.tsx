import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

// Simulated crypto prices for demo
const initialPrices: CryptoPrice[] = [
  { symbol: "BTC", name: "Bitcoin", price: 67432.18, change24h: 2.34 },
  { symbol: "ETH", name: "Ethereum", price: 3521.45, change24h: -0.87 },
  { symbol: "SOL", name: "Solana", price: 142.67, change24h: 5.21 },
  { symbol: "ADA", name: "Cardano", price: 0.58, change24h: 1.45 },
  { symbol: "USDC", name: "USD Coin", price: 1.00, change24h: 0.01 },
];

export function CryptoTicker() {
  const [prices, setPrices] = useState<CryptoPrice[]>(initialPrices);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices((prev) =>
        prev.map((crypto) => ({
          ...crypto,
          price: crypto.price * (1 + (Math.random() - 0.5) * 0.002),
          change24h: crypto.change24h + (Math.random() - 0.5) * 0.1,
        }))
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const tickerContent = [...prices, ...prices].map((crypto, index) => (
    <div
      key={`${crypto.symbol}-${index}`}
      className="flex items-center gap-4 px-6 py-3 border-r border-navy-800/50"
    >
      <div className="flex items-center gap-2">
        <span className="font-display font-semibold text-foreground">
          {crypto.symbol}
        </span>
        <span className="text-xs text-navy-500">{crypto.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-foreground">
          ${crypto.price.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
        <span
          className={`flex items-center text-sm ${
            crypto.change24h >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {crypto.change24h >= 0 ? (
            <TrendingUp className="w-3 h-3 mr-1" />
          ) : (
            <TrendingDown className="w-3 h-3 mr-1" />
          )}
          {Math.abs(crypto.change24h).toFixed(2)}%
        </span>
      </div>
    </div>
  ));

  return (
    <section className="py-4 bg-navy-950 border-y border-navy-800/50 overflow-hidden">
      <div className="flex items-center">
        <div className="flex-shrink-0 px-6 border-r border-navy-800/50">
          <span className="text-xs font-semibold text-gold uppercase tracking-wider">
            Live Prices
          </span>
        </div>
        <div className="overflow-hidden flex-1">
          <motion.div
            className="flex ticker-scroll"
            style={{ width: "fit-content" }}
          >
            {tickerContent}
          </motion.div>
        </div>
      </div>
      <p className="text-center text-xs text-navy-600 mt-2">
        *Demo data for illustration purposes only
      </p>
    </section>
  );
}