import usePriceFlash from '../../hooks/usePriceFlash';

export default function PriceBadge({ price, change, changePercent }) {
  const flashClass = usePriceFlash(price);
  
  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-cse-green' : 'text-cse-red';
  const arrow = isPositive ? '↑' : '↓';
  const sign = isPositive ? '+' : '';

  return (
    <div className={`flex flex-col p-1 rounded transition-colors ${flashClass}`}>
      <span className="font-mono text-lg font-semibold text-white">
        ₹{price.toFixed(2)}
      </span>
      <span className={`font-mono text-sm ${colorClass}`}>
        {arrow} {sign}₹{Math.abs(change).toFixed(2)} ({sign}{changePercent}%)
      </span>
    </div>
  );
}