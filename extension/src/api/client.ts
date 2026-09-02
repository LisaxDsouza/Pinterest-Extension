import { FindProductsResponse, ProductAnalysis, RankedProduct } from '../types';

const BACKEND_BASE_URL = 'http://localhost:8000';

export async function findSimilarProducts(
  imageDataUrl: string,
  onProgress?: (stage: string) => void
): Promise<FindProductsResponse> {
  try {
    if (onProgress) onProgress('Analyzing image...');

    // Convert Base64 Data URL to Blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'cropped_image.jpg');

    if (onProgress) onProgress('Understanding object...');

    try {
      const apiResponse = await fetch(`${BACKEND_BASE_URL}/api/find`, {
        method: 'POST',
        body: formData,
      });

      if (apiResponse.ok) {
        if (onProgress) onProgress('Ranking results...');
        const data: FindProductsResponse = await apiResponse.json();
        return data;
      }
    } catch (networkErr) {
      console.warn('Backend server not reachable on localhost:8000 yet. Using client-side mock fallback for UI verification:', networkErr);
    }

    // Fallback Mock Pipeline for UI verification when backend isn't running yet
    if (onProgress) onProgress('Finding products...');
    await new Promise((r) => setTimeout(r, 600));

    if (onProgress) onProgress('Ranking results...');
    await new Promise((r) => setTimeout(r, 500));

    return {
      analysis: {
        category: 'Minimalist Desk Lamp',
        description: 'Modern black metal study table lamp',
        attributes: {
          color: ['black'],
          material: ['metal'],
          style: ['minimalist', 'modern'],
          usage: ['desk', 'study']
        },
        search_terms: ['black minimalist desk lamp', 'modern table lamp amazon']
      },
      products: [
        {
          product: {
            id: 'B08X12345',
            title: 'Modern Black Adjustable LED Desk Lamp for Study & Office',
            image_url: 'https://images.unsplash.com/photo-1534105771160-3a216032e395?w=500&q=80',
            price: 1299,
            currency: 'INR',
            rating: 4.5,
            review_count: 1240,
            url: 'https://www.amazon.in/dp/B08X12345',
            category: 'Desk Lamps'
          },
          similarity_score: 0.94,
          match_reasons: ['Same category', 'Similar black metal finish', 'Modern minimalist style']
        },
        {
          product: {
            id: 'B09Y67890',
            title: 'Minimalist Metal Table Lamp with Warm LED Lighting',
            image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
            price: 1899,
            currency: 'INR',
            rating: 4.3,
            review_count: 850,
            url: 'https://www.amazon.in/dp/B09Y67890',
            category: 'Desk Lamps'
          },
          similarity_score: 0.88,
          match_reasons: ['Similar black metal design', 'Warm lighting']
        },
        {
          product: {
            id: 'B07Z11223',
            title: 'Adjustable Architect Desk Lamp - Matte Black',
            image_url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=500&q=80',
            price: 2499,
            currency: 'INR',
            rating: 4.6,
            review_count: 530,
            url: 'https://www.amazon.in/dp/B07Z11223',
            category: 'Desk Lamps'
          },
          similarity_score: 0.84,
          match_reasons: ['Matching black finish', 'Study & work desk use']
        }
      ]
    };
  } catch (error: any) {
    console.error('API client error:', error);
    throw new Error(error.message || 'Failed to process image');
  }
}

export async function searchByQueries(
  analysis: ProductAnalysis,
  queries: string[]
): Promise<RankedProduct[]> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ analysis, queries }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.products || [];
    }
  } catch (networkErr) {
    console.warn('Backend search unreachable, using fallback results:', networkErr);
  }

  return [
    {
      product: {
        id: 'B08X12345',
        title: `Results for: "${queries[0] || 'desk lamp'}" - Modern Black Desk Lamp`,
        image_url: 'https://images.unsplash.com/photo-1534105771160-3a216032e395?w=500&q=80',
        price: 1299,
        currency: 'INR',
        rating: 4.5,
        review_count: 1240,
        url: 'https://www.amazon.in',
        category: 'Desk Lamps'
      },
      similarity_score: 0.95,
      match_reasons: ['Exact search query match']
    }
  ];
}
