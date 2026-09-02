import React from 'react';
import { ProductCandidate, DirectSearchLink } from '../types';
import { ProductCard } from './ProductCard';
import { ExternalLink, Search } from 'lucide-react';

interface ProductResultsProps {
  products: ProductCandidate[];
  directSearches?: DirectSearchLink[];
  croppedImage?: string;
  category?: string;
  onPinnedSuccess?: () => void;
}

export const ProductResults: React.FC<ProductResultsProps> = ({
  products,
  directSearches = [],
  croppedImage,
  category,
  onPinnedSuccess,
}) => {
  return (
    <div className="space-y-4 pb-6">
      {/* Direct Search Fallback Banners */}
      {directSearches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
            <Search className="w-3.5 h-3.5 text-amber-600" />
            <span>Search Marketplaces Directly</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {directSearches.map((ds) => (
              <a
                key={ds.marketplace}
                href={ds.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-white hover:bg-amber-100/50 border border-amber-300 text-amber-950 font-semibold text-xs py-1.5 px-3 rounded-lg flex items-center justify-between transition-colors shadow-2xs"
              >
                <span>Search <strong>{ds.marketplace.toUpperCase()}</strong> for "{ds.query}"</span>
                <ExternalLink className="w-3 h-3 text-amber-700" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Web Candidate Results */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Matched Products ({products.length})
        </h2>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No matching products found. Try adjusting your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {products.map((candidate, idx) => (
            <ProductCard
              key={candidate.url || idx}
              candidate={candidate}
              croppedImage={croppedImage}
              category={category}
              onPinnedSuccess={onPinnedSuccess}
            />
          ))}
        </div>
      )}
    </div>
  );
};
