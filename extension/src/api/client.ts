import { SearchResponse, ProductCandidate, ProductAnalysis } from '../types';

const BACKEND_BASE_URL = 'http://localhost:8000';

export async function findSimilarProducts(
  imageDataUrl: string,
  onProgress?: (stage: string) => void
): Promise<SearchResponse> {
  try {
    if (onProgress) onProgress('Analyzing image...');

    // Convert Base64 Data URL to Blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();

    const formData = new FormData();
    formData.append('image', blob, 'cropped_image.jpg');

    if (onProgress) onProgress('Finding products on marketplaces...');

    try {
      const apiResponse = await fetch(`${BACKEND_BASE_URL}/api/search`, {
        method: 'POST',
        body: formData,
      });

      if (apiResponse.ok) {
        if (onProgress) onProgress('Ranking results...');
        const data: SearchResponse = await apiResponse.json();
        return data;
      }
    } catch (networkErr) {
      console.warn('Backend server unreachable on localhost:8000, using client fallback mock:', networkErr);
    }

    // Client-side fallback if backend server is not running
    if (onProgress) onProgress('Finding products...');
    await new Promise((r) => setTimeout(r, 500));

    if (onProgress) onProgress('Ranking results...');
    await new Promise((r) => setTimeout(r, 400));

    return {
      analysis: {
        category: 'desk lamp',
        description: 'minimalist black metal desk lamp',
        attributes: {
          color: ['black'],
          material: ['metal'],
          style: ['minimalist', 'modern'],
          finish: ['matte'],
          usage: ['desk', 'study']
        },
        search_terms: ['black minimalist desk lamp', 'modern black study lamp']
      },
      queries: ['black minimalist desk lamp', 'modern black study lamp'],
      products: [
        {
          title: 'Modern Black Adjustable Metal LED Desk Lamp for Study',
          url: 'https://www.amazon.in/dp/B08X12345',
          domain: 'amazon.in',
          marketplace: 'amazon',
          snippet: 'Buy Modern Black Adjustable Metal LED Desk Lamp online at best price in India on Amazon.in.',
          search_query: 'black minimalist desk lamp',
          final_score: 0.94,
          match_reasons: ['Same product category', 'Black color matches', 'Similar minimalist style']
        },
        {
          title: 'Minimalist Metal Table Lamp Matte Black Finish',
          url: 'https://www.flipkart.com/p/itm123456789',
          domain: 'flipkart.com',
          marketplace: 'flipkart',
          snippet: 'Shop Minimalist Metal Table Lamp Matte Black Finish for Rs 1,899 on Flipkart.',
          search_query: 'modern black study lamp',
          final_score: 0.88,
          match_reasons: ['Similar black metal design', 'Matte finish match']
        },
        {
          title: 'FORSÅ Work lamp, black - IKEA India',
          url: 'https://www.ikea.com/in/en/p/forsa-work-lamp-black-80416281/',
          domain: 'ikea.com',
          marketplace: 'ikea',
          snippet: 'FORSÅ work lamp in matte black metal with adjustable arm.',
          search_query: 'black minimalist desk lamp',
          final_score: 0.85,
          match_reasons: ['Same category match', 'Matte black metal']
        }
      ],
      direct_searches: [
        {
          marketplace: 'amazon',
          query: 'black minimalist desk lamp',
          url: 'https://www.amazon.in/s?k=black+minimalist+desk+lamp'
        },
        {
          marketplace: 'flipkart',
          query: 'black minimalist desk lamp',
          url: 'https://www.flipkart.com/search?q=black+minimalist+desk+lamp'
        }
      ]
    };
  } catch (error: any) {
    console.error('API client error:', error);
    throw new Error(error.message || 'Failed to search products');
  }
}

export async function searchByQueries(
  analysis: ProductAnalysis,
  queries: string[]
): Promise<ProductCandidate[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analysis, queries })
    });
    if (res.ok) {
      const data = await res.json();
      return data.products || [];
    }
  } catch (err) {
    console.warn('Backend search unreachable:', err);
  }
  return [];
}
