import { useState } from 'react';
import { PiggyBank, AlertCircle, ChevronUp, ChevronDown, Rocket, Loader2, Sparkles, TrendingUp, Target } from 'lucide-react';

export default function BudgetTracker({ budgetSummary, onOptimize, isOptimizing }) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (!budgetSummary) return null;

  const {
    totalCost,
    budget,
    originalBudget,
    currency = 'INR',
    overBudget,
    difference,
    percentageOver,
    dayBreakdown = [],
    isConverted
  } = budgetSummary;

  const percentage = budget > 0 ? Math.min((totalCost / budget) * 100, 100) : 0;
  
  const getProgressColor = () => {
    if (percentage < 85) return 'bg-emerald';
    if (percentage <= 100) return 'bg-white/20';
    return 'bg-rose-500';
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="sticky bottom-0 bg-vintage_grape-300 border-t border-white/10 px-6 py-5 shadow-glass z-20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PiggyBank size={18} strokeWidth={2.5} className="text-emerald" />
          <span className="text-[10px] font-black text-parchment-100/40 uppercase tracking-[0.4em]">Budget Status</span>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-sm font-black text-parchment-100 tabular-nums tracking-tighter uppercase">
            {formatCurrency(totalCost)} <span className="opacity-10 mx-1">/</span> <span className="opacity-40">{formatCurrency(budget)}</span>
          </div>
          {isConverted && (
            <div className="text-[8px] font-black text-emerald/40 uppercase tracking-widest mt-1">
              Converted from ₹{new Intl.NumberFormat('en-IN').format(originalBudget)}
            </div>
          )}
        </div>
      </div>

      <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden shadow-inner relative">
         <div 
           className={`h-full rounded-full transition-all duration-1000 ease-out shadow-sm ${getProgressColor()}`}
           style={{ width: `${percentage}%` }}
         />
      </div>

      <button 
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full mt-4 flex items-center justify-between group/btn"
      >
        <div className="flex items-center gap-2">
           <TrendingUp size={12} className="text-emerald/40 group-hover/btn:text-emerald transition-colors" />
           <span className="text-[9px] font-black text-parchment-100/30 uppercase tracking-[0.2em] group-hover/btn:text-parchment-100 transition-colors">Spending Intensity</span>
        </div>
        {showBreakdown ? <ChevronDown size={14} className="text-parchment-100/20" /> : <ChevronUp size={14} className="text-parchment-100/20" />}
      </button>

      {showBreakdown && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-3 animate-reveal">
          <div className="grid grid-cols-2 gap-3">
            <div className="surface-nested p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black text-parchment-100/20 uppercase tracking-widest block mb-1">Utilization</span>
              <div className="flex items-end gap-1">
                <span className="text-sm font-black text-parchment-100">{percentage.toFixed(0)}%</span>
                <span className="text-[8px] text-parchment-100/40 mb-1 font-bold">Planned</span>
              </div>
            </div>
            <div className="surface-nested p-3 rounded-2xl border border-white/5">
              <span className="text-[8px] font-black text-parchment-100/20 uppercase tracking-widest block mb-1">Safety Buffer</span>
              <div className="flex items-end gap-1">
                <span className="text-sm font-black text-emerald">{difference > 0 ? "EXCEEDED" : formatCurrency(Math.abs(difference))}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between items-center mb-2">
               <span className="text-[8px] font-black text-parchment-100/40 uppercase tracking-widest">Efficiency Wave</span>
               <div className="flex gap-0.5">
                  {[1,2,3,4,5,6].map(i => (
                    <div key={i} className={`w-1 h-3 rounded-full ${i <= (percentage/16) ? 'bg-emerald' : 'bg-white/5'}`} />
                  ))}
               </div>
            </div>
            
            <button 
              onClick={onOptimize}
              disabled={isOptimizing}
              className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-2 transition-all group/opt active:scale-[0.98]"
            >
              {isOptimizing ? (
                <Loader2 size={12} className="animate-spin text-emerald" />
              ) : (
                <Target size={12} className="text-emerald group-hover/opt:scale-125 transition-transform" />
              )}
              <span className="text-[9px] font-black text-parchment-100 uppercase tracking-widest">Optimize Daily Allocations</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
