export default function StockBadge({
  stockQty,
  threshold,
}: {
  stockQty: number | null;
  threshold: number | null;
}) {
  if (stockQty === null) return null;

  const low = threshold ?? 10;

  if (stockQty === 0) {
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200/50 px-2 py-0.5 rounded-md">
        Out of stock
      </span>
    );
  }

  if (stockQty <= low) {
    return (
      <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 rounded-md">
        Only {stockQty} left
      </span>
    );
  }

  return null;
}