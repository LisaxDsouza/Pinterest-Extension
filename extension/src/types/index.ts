export interface ProductAttributes {
  color?: string[];
  material?: string[];
  style?: string[];
  shape?: string[];
  usage?: string[];
  [key: string]: string[] | undefined;
}

export interface ProductAnalysis {
  category: string;
  description: string;
  attributes: ProductAttributes;
  search_terms: string[];
}

export interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  currency: string;
  rating: number;
  review_count: number;
  url: string;
  category: string;
}

export interface RankedProduct {
  product: Product;
  similarity_score: number;
  match_reasons: string[];
}

export interface FindProductsResponse {
  analysis: ProductAnalysis;
  products: RankedProduct[];
}

export type ExtensionMessageType =
  | 'OPEN_SIDE_PANEL'
  | 'START_SELECTION_MODE'
  | 'IMAGE_SELECTED'
  | 'ANALYSIS_PROGRESS'
  | 'GET_CURRENT_IMAGE';

export interface ExtensionMessage {
  type: ExtensionMessageType;
  imageDataUrl?: string;
  sourceUrl?: string;
  stage?: string;
  data?: any;
}
