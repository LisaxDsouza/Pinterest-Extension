import React from 'react';
import { RankedProduct } from '../types';
import { ProductCard } from './ProductCard';

interface ProductResultsProps {
  products: RankedProduct[];
}

export const ProductResults: React.FC<ProductResultsProps> = ({ products }) => {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No matching products found. Try adjusting your search keywords.
      </div>
    );
  }

  return (
    <div className="space-y-3.5 pb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Matches on Amazon.in ({products.length})
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3.5">
        {products.map((item) => (
          <ProductCard key={item.product.id} rankedProduct={item} />
        ))}
      </div>
    </div>
  );
};
