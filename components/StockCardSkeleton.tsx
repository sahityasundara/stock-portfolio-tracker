import React from 'react';

const StockCardSkeleton: React.FC = () => {
  return (
    <div className="bg-slate-800/50 rounded-xl p-4 shadow-lg border border-slate-700 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="h-7 w-20 bg-slate-700 rounded"></div>
          <div className="h-4 w-32 bg-slate-700 rounded mt-2"></div>
        </div>
        <div className="h-6 w-12 bg-slate-700 rounded"></div>
      </div>

      {/* Price Skeleton */}
      <div className="flex justify-between items-baseline my-4">
        <div className="h-9 w-28 bg-slate-700 rounded"></div>
        <div className="text-right">
          <div className="h-5 w-12 bg-slate-700 rounded"></div>
          <div className="h-5 w-16 bg-slate-700 rounded mt-1"></div>
        </div>
      </div>

      {/* Chart Skeleton */}
      <div className="h-20 bg-slate-700 rounded"></div>

      {/* Details Skeleton */}
      <div className="mt-4 pt-4 border-t border-slate-700 space-y-2">
        <div className="flex justify-between">
          <div className="h-4 w-10 bg-slate-700 rounded"></div>
          <div className="h-4 w-20 bg-slate-700 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-8 bg-slate-700 rounded"></div>
          <div className="h-4 w-24 bg-slate-700 rounded"></div>
        </div>
        <div className="flex justify-between">
          <div className="h-4 w-12 bg-slate-700 rounded"></div>
          <div className="h-4 w-28 bg-slate-700 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default StockCardSkeleton;