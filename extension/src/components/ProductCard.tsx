import React from 'react';
import { RankedProduct } from '../types';
import { ExternalLink, Star } from 'lucide-react';

interface ProductCardProps {
  rankedProduct: RankedProduct;
}

export const ProductCard: React.FC<ProductCardProps> = ({ rankedProduct }) => {
  const { product, similarity_score, match_reasons } = rankedProduct;
  const matchPercentage = Math.round(similarity_score * 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
      <div>
        <div className="relative w-full h-36 bg-gray-100 rounded-lg overflow-hidden mb-3.5 flex items-center justify-center">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-contain p-2"
            onError={(e) => {
              // Fallback placeholder image
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=300&q=80';
            }}
          />
          <div className="absolute top-2 right-2 bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full shadow-sm">
            {matchPercentage}% Match
          </div>
        </div>

        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1.5 leading-snug">
          {product.title}
        </h3>

        <div className="flex items-center gap-2 mb-2">
          <span className="text-base font-bold text-gray-900">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 font-medium bg-amber-50 px-1.5 py-0.5 rounded">
              <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
              <span>{product.rating}</span>
              <span className="text-gray-400">({product.review_count})</span>
            </div>
          )}
        </div>

        {match_reasons && match_reasons.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {match_reasons.slice(0, 2).map((reason, idx) => (
              <span key={idx} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                {reason}
              </span>
            ))}
          </div>
        )}
      </div>

      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full bg-amazon-orange hover:bg-amber-600 text-gray-950 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
      >
        <span>View on Amazon.in</span>
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
};
