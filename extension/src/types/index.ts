export interface ProductAttributes {
  color?: string[];
  material?: string[];
  style?: string[];
  shape?: string[];
  finish?: string[];
  usage?: string[];
  [key: string]: string[] | undefined;
}

export interface ProductAnalysis {
  category: string;
  description: string;
  attributes: ProductAttributes;
  search_terms: string[];
}

export interface ProductCandidate {
  title: string;
  url: string;
  domain: string;
  marketplace: string;
  snippet?: string;
  search_query: string;
  relevance_score?: number;
  visual_similarity_score?: number;
  attribute_score?: number;
  final_score?: number;
  match_reasons: string[];
}

export interface DirectSearchLink {
  marketplace: string;
  query: string;
  url: string;
}

export interface SearchResponse {
  analysis: ProductAnalysis;
  queries: string[];
  products: ProductCandidate[];
  direct_searches: DirectSearchLink[];
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
