import React from 'react';
import { Loader2, Sparkles, Search, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  stage: string;
}

const STAGES = [
  'Analyzing image...',
  'Understanding object...',
  'Finding products...',
  'Ranking results...',
];

export const LoadingState: React.FC<LoadingStateProps> = ({ stage }) => {
  const currentStageIndex = STAGES.indexOf(stage);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4 shadow-sm my-4">
      <div className="relative inline-flex items-center justify-center w-14 h-14 bg-pinterest-red/10 rounded-full text-pinterest-red animate-pulse">
        <Loader2 className="w-7 h-7 animate-spin" />
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 text-sm">{stage}</h3>
        <p className="text-xs text-gray-500 mt-1">Finding the best matches on Amazon.in</p>
      </div>

      <div className="space-y-2 text-left max-w-xs mx-auto pt-2">
        {STAGES.map((s, idx) => {
          const isDone = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex || (currentStageIndex === -1 && idx === 0);

          return (
            <div key={s} className="flex items-center gap-2.5 text-xs">
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="w-4 h-4 text-pinterest-red animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-300 flex-shrink-0" />
              )}
              <span className={isCurrent ? 'font-semibold text-gray-900' : isDone ? 'text-gray-600' : 'text-gray-400'}>
                {s}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
