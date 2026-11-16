import React from 'react';

const ScoreBadge = ({ score, size = 'md', showLabel = false }) => {
  const numScore = Number(score) || 0;

  let colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  let label = 'High Concern';

  if (numScore >= 85) {
    colorClasses = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    label = 'Optimal';
  } else if (numScore >= 70) {
    colorClasses = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    label = 'Strong';
  } else if (numScore >= 55) {
    colorClasses = 'bg-amber-500/15 text-amber-400 border-amber-500/30';
    label = 'Moderate';
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base font-bold px-3 py-1.5',
    xl: 'text-2xl font-extrabold px-4 py-2',
  }[size] || 'text-sm px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg border backdrop-blur-sm ${colorClasses} ${sizeClasses}`}
    >
      <span>{numScore}</span>
      <span className="text-[10px] opacity-75 font-normal">/100</span>
      {showLabel && <span className="ml-1 text-xs font-medium">({label})</span>}
    </span>
  );
};

export default ScoreBadge;
