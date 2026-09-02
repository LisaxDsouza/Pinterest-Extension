import React, { useState, useEffect } from 'react';
import { Clock, Trash2, ExternalLink, RotateCcw, Search, ChevronRight } from 'lucide-react';
import { HistoryItem } from '../types';
import { getHistory, deleteHistoryItem, clearHistory } from '../utils/storageManager';

interface HistoryViewProps {
  onRestoreSession: (item: HistoryItem) => void;
  onRefreshCounts?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({ onRestoreSession, onRefreshCounts }) => {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterQuery, setFilterQuery] = useState<string>('');

  const loadHistoryData = async () => {
    setLoading(true);
    try {
      const items = await getHistory();
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to load search history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoryData();
  }, []);

  const handleDeleteItem = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      await loadHistoryData();
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear your entire search history?')) {
      try {
        await clearHistory();
        await loadHistoryData();
        if (onRefreshCounts) onRefreshCounts();
      } catch (err) {
        console.error('Failed to clear history:', err);
      }
    }
  };

  const filteredItems = historyItems.filter(
    (item) =>
      item.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.queries.some((q) => q.toLowerCase().includes(filterQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-6">
      {/* Search Header Controls */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Search History ({historyItems.length})
        </h2>
        {historyItems.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Filter Search Input */}
      {historyItems.length > 0 && (
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filter history by category or query..."
            className="w-full bg-white border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pinterest-red"
          />
        </div>
      )}

      {/* History Items List */}
      {loading ? (
        <div className="text-center py-8 text-xs text-gray-400">Loading search history...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-2">
          <Clock className="w-8 h-8 text-gray-300 mx-auto" />
          <h3 className="font-bold text-sm text-gray-900">No History Found</h3>
          <p className="text-xs text-gray-500">
            {historyItems.length === 0
              ? 'Cropped image searches will automatically be saved here.'
              : 'No history items match your search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onRestoreSession(item)}
              className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
            >
              <img
                src={item.croppedImage}
                alt={item.category}
                className="w-14 h-14 object-contain bg-gray-50 rounded-lg border border-gray-200 flex-shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <h3 className="font-bold text-gray-900 text-xs truncate capitalize">
                    {item.category}
                  </h3>
                  <span className="text-[10px] text-gray-400 whitespace-nowrap">
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 line-clamp-1 mb-1.5">
                  {item.queries[0] || item.description}
                </p>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-red-50 text-pinterest-red font-bold px-1.5 py-0.5 rounded">
                    {item.products.length} Products
                  </span>
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded truncate max-w-[120px]">
                    {item.queries[0]}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => handleDeleteItem(item.id, e)}
                  title="Delete from history"
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-pinterest-red transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
