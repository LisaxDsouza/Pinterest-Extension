import React, { useEffect, useState, useRef } from 'react';
import { Sparkles, Search, Crop, Image as ImageIcon, X, RefreshCw } from 'lucide-react';
import { FindProductsResponse, ProductAnalysis, RankedProduct } from '../types';
import { findSimilarProducts, searchByQueries } from '../api/client';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { ProductResults } from '../components/ProductResults';

export const SidePanel: React.FC = () => {
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [stage, setStage] = useState<string>('Analyzing image...');
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [products, setProducts] = useState<RankedProduct[]>([]);
  const [searchQueryInput, setSearchQueryInput] = useState<string>('');

  const currentProcessingId = useRef<number>(0);

  const handleClearImage = () => {
    chrome.storage?.local?.remove(['currentCroppedImage', 'sourcePageUrl', 'cropTimestamp'], () => {
      setCroppedImage(null);
      setAnalysis(null);
      setProducts([]);
      setError(null);
      setLoading(false);
    });
  };

  const processImage = async (imgDataUrl: string) => {
    const requestId = ++currentProcessingId.current;

    // Reset UI states immediately for fresh crop
    setCroppedImage(imgDataUrl);
    setLoading(true);
    setError(null);
    setProducts([]);
    setAnalysis(null);
    setSearchQueryInput('');

    try {
      const data: FindProductsResponse = await findSimilarProducts(imgDataUrl, (currentStage) => {
        if (requestId === currentProcessingId.current) {
          setStage(currentStage);
        }
      });

      if (requestId === currentProcessingId.current) {
        setAnalysis(data.analysis);
        setProducts(data.products || []);
        if (data.analysis?.search_terms?.length) {
          setSearchQueryInput(data.analysis.search_terms[0]);
        } else if (data.analysis?.category) {
          setSearchQueryInput(data.analysis.category);
        }
      }
    } catch (err: any) {
      console.error('Failed to process image:', err);
      if (requestId === currentProcessingId.current) {
        setError(err.message || 'Could not find matching products. Try selecting a larger portion of the object.');
      }
    } finally {
      if (requestId === currentProcessingId.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    // 1. Initial check from storage
    chrome.storage?.local?.get(['currentCroppedImage'], (result) => {
      if (result.currentCroppedImage) {
        processImage(result.currentCroppedImage);
      }
    });

    // 2. Runtime message listener
    const messageHandler = (message: any) => {
      if (message.type === 'IMAGE_SELECTED' && message.imageDataUrl) {
        processImage(message.imageDataUrl);
      }
    };

    // 3. Storage change listener
    const storageHandler = (changes: any, areaName: string) => {
      if (areaName === 'local') {
        if (changes.currentCroppedImage?.newValue) {
          processImage(changes.currentCroppedImage.newValue);
        } else if (changes.currentCroppedImage && !changes.currentCroppedImage.newValue) {
          // Cleared from storage
          setCroppedImage(null);
          setAnalysis(null);
          setProducts([]);
          setError(null);
          setLoading(false);
        }
      }
    };

    chrome.runtime?.onMessage?.addListener(messageHandler);
    chrome.storage?.onChanged?.addListener(storageHandler);

    return () => {
      chrome.runtime?.onMessage?.removeListener(messageHandler);
      chrome.storage?.onChanged?.removeListener(storageHandler);
    };
  }, []);

  const handleManualTriggerSelection = async () => {
    try {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab?.id) {
        setError('Please click on your Pinterest tab in Chrome first.');
        return;
      }

      chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION_MODE' }, (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Tab message failed, injecting content script:', chrome.runtime.lastError.message);
          chrome.scripting.executeScript({
            target: { tabId: tab.id! },
            files: ['content/pinterest.js']
          }).then(() => {
            chrome.scripting.insertCSS({
              target: { tabId: tab.id! },
              files: ['assets/styles.css']
            }).catch(() => {});

            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id!, { type: 'START_SELECTION_MODE' });
            }, 200);
          }).catch((err) => {
            console.error('Script injection failed:', err);
            setError('Please open a Pinterest pin page (pinterest.com/pin/...) to crop an object.');
          });
        }
      });
    } catch (err: any) {
      console.error('Error triggering selection:', err);
      setError('Unable to trigger selection mode. Make sure you are on a Pinterest page.');
    }
  };

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQueryInput.trim() || !analysis) return;

    setLoading(true);
    setError(null);
    setStage('Searching Amazon.in...');

    try {
      const customAnalysis: ProductAnalysis = {
        ...analysis,
        search_terms: [searchQueryInput.trim()],
      };
      const updatedProducts = await searchByQueries(customAnalysis, [searchQueryInput.trim()]);
      setProducts(updatedProducts);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-pinterest-red text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-base text-gray-900 leading-tight">Product Finder</h1>
            <p className="text-[11px] text-gray-500">Find products similar to anything you see</p>
          </div>
        </div>

        <button
          onClick={handleManualTriggerSelection}
          title="Crop Object on Pinterest Page"
          className="bg-pinterest-red hover:bg-pinterest-hover text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-transform active:scale-95 cursor-pointer"
        >
          <Crop className="w-3.5 h-3.5" />
          <span>Crop Object</span>
        </button>
      </header>

      {/* Main Content */}
      {croppedImage ? (
        <div className="space-y-4">
          {/* Selected Image Preview Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm flex items-center gap-3">
            <img
              src={croppedImage}
              alt="Selected Pinterest Crop"
              className="w-20 h-20 object-contain bg-gray-950/5 rounded-lg border border-gray-200 flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400 block mb-0.5">Selected Object</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleManualTriggerSelection}
                    className="text-[11px] text-pinterest-red font-semibold hover:underline flex items-center gap-0.5 cursor-pointer"
                  >
                    <Crop className="w-3 h-3" />
                    <span>Re-crop</span>
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleClearImage}
                    title="Remove picture & clear results"
                    className="text-[11px] text-gray-500 hover:text-red-600 font-semibold flex items-center gap-0.5 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
              {analysis ? (
                <>
                  <h3 className="font-bold text-gray-900 text-sm capitalize truncate">
                    {analysis.category}
                  </h3>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {analysis.attributes.color?.slice(0, 2).map((c) => (
                      <span key={c} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {c}
                      </span>
                    ))}
                    {analysis.attributes.material?.slice(0, 1).map((m) => (
                      <span key={m} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {m}
                      </span>
                    ))}
                    {analysis.attributes.style?.slice(0, 1).map((s) => (
                      <span key={s} className="text-[10px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>
                </>
              ) : (
                <div className="animate-pulse space-y-2 pt-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              )}
            </div>
          </div>

          {/* Search Controls (when analysis available) */}
          {analysis && !loading && (
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={searchQueryInput}
                  onChange={(e) => setSearchQueryInput(e.target.value)}
                  placeholder="Modify query..."
                  className="w-full bg-white border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pinterest-red"
                />
              </div>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
              >
                <span>Search Again</span>
              </button>
            </form>
          )}

          {/* Loading, Error or Results */}
          {loading ? (
            <LoadingState stage={stage} />
          ) : error ? (
            <ErrorState message={error} onRetry={() => processImage(croppedImage)} />
          ) : (
            <ProductResults products={products} />
          )}
        </div>
      ) : (
        /* Empty / Onboarding State */
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-4 my-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-pinterest-red mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm">No Object Selected</h2>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Select an item directly from Pinterest to find matching products on Amazon.in.
            </p>
          </div>

          <button
            onClick={handleManualTriggerSelection}
            className="w-full bg-pinterest-red hover:bg-pinterest-hover text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 cursor-pointer"
          >
            <Crop className="w-4 h-4" />
            <span>Select Object on Page</span>
          </button>

          <div className="pt-3 text-left border-t border-gray-100 space-y-2">
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">1</div>
              <span>Open Pinterest image page</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">2</div>
              <span>Click <strong>Select Object on Page</strong> or hover on image</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px]">3</div>
              <span>Drag selection box & view Amazon matches</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
