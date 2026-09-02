import React, { useState } from 'react';
import { ProductCandidate } from '../types';
import { ExternalLink, Tag, Bookmark } from 'lucide-react';
import { PinToBoardModal } from './PinToBoardModal';

interface ProductCardProps {
  candidate: ProductCandidate;
  croppedImage?: string;
  category?: string;
  onPinnedSuccess?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  candidate,
  croppedImage,
  category,
  onPinnedSuccess,
}) => {
  const [showPinModal, setShowPinModal] = useState<boolean>(false);
  const matchPercentage = candidate.final_score ? Math.round(candidate.final_score * 100) : null;

  const getMarketplaceBadgeColor = (marketplace: string) => {
    switch (marketplace.toLowerCase()) {
      case 'amazon':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'flipkart':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'ikea':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'myntra':
        return 'bg-pink-100 text-pink-800 border-pink-300';
      case 'pepperfry':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border capitalize ${getMarketplaceBadgeColor(candidate.marketplace)}`}>
              {candidate.marketplace === 'other' ? candidate.domain : candidate.domain}
            </span>
            {matchPercentage !== null && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                {matchPercentage}% Match
              </span>
            )}
          </div>

          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 leading-snug">
            {candidate.title}
          </h3>

          {candidate.snippet && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-2.5 leading-relaxed">
              {candidate.snippet}
            </p>
          )}

          {candidate.match_reasons && candidate.match_reasons.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {candidate.match_reasons.slice(0, 2).map((reason, idx) => (
                <span key={idx} className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Tag className="w-2.5 h-2.5" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <button
            onClick={() => setShowPinModal(true)}
            title="Pin idea to board"
            className="bg-red-50 hover:bg-red-100 text-pinterest-red border border-red-200 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1 transition-colors cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Pin</span>
          </button>

          <a
            href={candidate.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>View on {candidate.domain}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {showPinModal && (
        <PinToBoardModal
          candidate={candidate}
          croppedImage={croppedImage}
          category={category}
          onClose={() => setShowPinModal(false)}
          onSuccess={() => {
            setShowPinModal(false);
            if (onPinnedSuccess) onPinnedSuccess();
          }}
        />
      )}
    </>
  );
};
