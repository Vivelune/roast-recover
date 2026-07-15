export default function StockBadge({
    stockQty,
    threshold,
  }: {
    stockQty: number | null;
    threshold: number | null;
  }) {
    if (stockQty === null) return null; // unlimited, show nothing
  
    const low = threshold ?? 10;
  
    if (stockQty === 0) {
      return (
        <span className="inline-block text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
          Out of stock
        </span>
      );
    }
  
    if (stockQty <= low) {
      return (
        <span className="inline-block text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
          Only {stockQty} left
        </span>
      );
    }
  
    return null; // plenty of stock — show nothing
  }