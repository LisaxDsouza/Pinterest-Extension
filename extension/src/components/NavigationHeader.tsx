import React from 'react';
import { Sparkles, Crop, Search, Clock, Bookmark } from 'lucide-react';
import { SidePanelTab } from '../types';

interface NavigationHeaderProps {
  activeTab: SidePanelTab;
  onTabChange: (tab: SidePanelTab) => void;
  onCropClick: () => void;
  historyCount: number;
  boardsCount: number;
}

export const NavigationHeader: React.FC<NavigationHeaderProps> = ({
  activeTab,
  onTabChange,
  onCropClick,
  historyCount,
  boardsCount,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
      {/* Top Title Bar */}
      <div className="p-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-pinterest-red text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-gray-900 leading-tight">Visual Product Finder</h1>
          </div>
        </div>

        <button
          onClick={onCropClick}
          title="Crop Object on Pinterest Page"
          className="bg-pinterest-red hover:bg-pinterest-hover text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
        >
          <Crop className="w-3.5 h-3.5" />
          <span>Crop Object</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <nav className="flex border-t border-gray-100 px-2 pt-1">
        <button
          onClick={() => onTabChange('search')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'search'
              ? 'border-pinterest-red text-pinterest-red'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </button>

        <button
          onClick={() => onTabChange('history')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'history'
              ? 'border-pinterest-red text-pinterest-red'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>History</span>
          {historyCount > 0 && (
            <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded-full font-bold">
              {historyCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onTabChange('boards')}
          className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
            activeTab === 'boards'
              ? 'border-pinterest-red text-pinterest-red'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          <span>Boards</span>
          {boardsCount > 0 && (
            <span className="text-[10px] bg-red-50 text-pinterest-red px-1.5 py-0.2 rounded-full font-bold">
              {boardsCount}
            </span>
          )}
        </button>
      </nav>
    </header>
  );
};
