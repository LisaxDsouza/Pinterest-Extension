import React, { useState, useEffect } from 'react';
import { X, Bookmark, Plus, Check } from 'lucide-react';
import { ProductCandidate, Board } from '../types';
import { getBoards, createBoard, pinIdeaToBoard } from '../utils/storageManager';

interface PinToBoardModalProps {
  candidate: ProductCandidate;
  croppedImage?: string;
  category?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export const PinToBoardModal: React.FC<PinToBoardModalProps> = ({
  candidate,
  croppedImage,
  category,
  onClose,
  onSuccess,
}) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>([]);
  const [newBoardName, setNewBoardName] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  const loadBoardsData = async () => {
    setLoading(true);
    try {
      const allBoards = await getBoards();
      setBoards(allBoards);

      // Find boards where this product URL is already pinned
      const alreadyPinned = allBoards
        .filter((b) => b.ideas.some((idea) => idea.url === candidate.url))
        .map((b) => b.id);
      setPinnedBoardIds(alreadyPinned);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardsData();
  }, [candidate.url]);

  const handlePinToBoard = async (boardId: string) => {
    try {
      await pinIdeaToBoard(boardId, candidate, croppedImage, category);
      setPinnedBoardIds((prev) => [...prev, boardId]);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to pin idea:', err);
    }
  };

  const handleCreateAndPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;

    try {
      const created = await createBoard(newBoardName.trim());
      await pinIdeaToBoard(created.id, candidate, croppedImage, category);
      setNewBoardName('');
      setShowCreateForm(false);
      await loadBoardsData();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to create and pin board:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-4 shadow-xl border border-gray-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
          <div className="flex items-center gap-1.5 font-bold text-sm text-gray-900">
            <Bookmark className="w-4 h-4 text-pinterest-red" />
            <span>Pin Idea to Board</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Candidate Item Summary */}
        <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-200/60 flex items-center gap-2.5">
          {croppedImage && (
            <img
              src={croppedImage}
              alt="Crop"
              className="w-10 h-10 object-contain rounded bg-white border border-gray-200 flex-shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-gray-900 truncate">{candidate.title}</h4>
            <p className="text-[10px] text-gray-500 capitalize">{candidate.domain}</p>
          </div>
        </div>

        {/* Create Board Form Toggle */}
        {!showCreateForm ? (
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full border border-dashed border-pinterest-red text-pinterest-red hover:bg-red-50 font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Shopping Board</span>
          </button>
        ) : (
          <form onSubmit={handleCreateAndPin} className="space-y-2 bg-red-50/50 p-3 rounded-lg border border-red-200">
            <label className="text-xs font-bold text-gray-900 block">New Board Name</label>
            <input
              type="text"
              value={newBoardName}
              onChange={(e) => setNewBoardName(e.target.value)}
              placeholder="e.g. Living Room Decor, Office Setup..."
              autoFocus
              className="w-full bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-pinterest-red"
            />
            <div className="flex gap-2 justify-end pt-1">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-pinterest-red text-white font-semibold text-xs px-3 py-1 rounded-lg hover:bg-pinterest-hover transition-colors cursor-pointer"
              >
                Create & Pin
              </button>
            </div>
          </form>
        )}

        {/* Existing Boards List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
            Select Board
          </label>

          {loading ? (
            <div className="text-xs text-gray-400 text-center py-4">Loading boards...</div>
          ) : boards.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-4">No boards created yet.</div>
          ) : (
            boards.map((b) => {
              const isPinned = pinnedBoardIds.includes(b.id);
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-gray-200 hover:border-gray-300 bg-white transition-all"
                >
                  <div>
                    <h5 className="font-semibold text-xs text-gray-900">{b.name}</h5>
                    <p className="text-[10px] text-gray-400">{b.ideas.length} pinned idea(s)</p>
                  </div>

                  <button
                    onClick={() => handlePinToBoard(b.id)}
                    disabled={isPinned}
                    className={`text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      isPinned
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                        : 'bg-pinterest-red hover:bg-pinterest-hover text-white'
                    }`}
                  >
                    {isPinned ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>Pinned</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        <span>Pin</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
