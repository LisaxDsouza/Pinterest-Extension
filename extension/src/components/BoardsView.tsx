import React, { useState, useEffect } from 'react';
import { Bookmark, Plus, Edit2, Trash2, ExternalLink, ArrowLeft, X, Tag } from 'lucide-react';
import { Board, PinnedIdea } from '../types';
import {
  getBoards,
  createBoard,
  updateBoard,
  deleteBoard,
  removeIdeaFromBoard,
} from '../utils/storageManager';

interface BoardsViewProps {
  onRefreshCounts?: () => void;
}

export const BoardsView: React.FC<BoardsViewProps> = ({ onRefreshCounts }) => {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  // Form fields
  const [boardName, setBoardName] = useState<string>('');
  const [boardDesc, setBoardDesc] = useState<string>('');

  const loadBoardsData = async () => {
    setLoading(true);
    try {
      const data = await getBoards();
      setBoards(data);
    } catch (err) {
      console.error('Failed to load boards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardsData();
  }, []);

  const selectedBoard = boards.find((b) => b.id === activeBoardId);

  // Create Board Action
  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    try {
      const created = await createBoard(boardName, boardDesc);
      setBoardName('');
      setBoardDesc('');
      setShowCreateModal(false);
      await loadBoardsData();
      setActiveBoardId(created.id);
      if (onRefreshCounts) onRefreshCounts();
    } catch (err) {
      console.error('Failed to create board:', err);
    }
  };

  // Edit/Rename Board Action
  const handleUpdateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeBoardId || !boardName.trim()) return;

    try {
      await updateBoard(activeBoardId, boardName, boardDesc);
      setShowEditModal(false);
      await loadBoardsData();
    } catch (err) {
      console.error('Failed to update board:', err);
    }
  };

  // Delete Board Action
  const handleDeleteBoard = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this board? All pinned ideas inside it will be deleted.')) {
      try {
        await deleteBoard(id);
        if (activeBoardId === id) setActiveBoardId(null);
        await loadBoardsData();
        if (onRefreshCounts) onRefreshCounts();
      } catch (err) {
        console.error('Failed to delete board:', err);
      }
    }
  };

  // Remove Idea from Board Action
  const handleRemoveIdea = async (ideaId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeBoardId) return;

    try {
      await removeIdeaFromBoard(activeBoardId, ideaId);
      await loadBoardsData();
    } catch (err) {
      console.error('Failed to remove idea from board:', err);
    }
  };

  const openEditModalForSelectedBoard = () => {
    if (selectedBoard) {
      setBoardName(selectedBoard.name);
      setBoardDesc(selectedBoard.description || '');
      setShowEditModal(true);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Detail View of Selected Board */}
      {selectedBoard ? (
        <div className="space-y-4 animate-in fade-in duration-150">
          {/* Board Header & Controls */}
          <div className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setActiveBoardId(null)}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Boards</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={openEditModalForSelectedBoard}
                  title="Rename/Edit Board"
                  className="text-xs font-semibold text-gray-600 hover:text-pinterest-red p-1 rounded-lg hover:bg-gray-100 flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDeleteBoard(selectedBoard.id)}
                  title="Delete Board"
                  className="text-xs font-semibold text-red-600 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-base text-gray-900 leading-snug">{selectedBoard.name}</h2>
              {selectedBoard.description && (
                <p className="text-xs text-gray-500 mt-0.5">{selectedBoard.description}</p>
              )}
              <span className="inline-block mt-2 text-[10px] bg-red-50 text-pinterest-red font-bold px-2 py-0.5 rounded-full">
                {selectedBoard.ideas.length} Pinned Idea(s)
              </span>
            </div>
          </div>

          {/* Pinned Ideas List */}
          <div className="space-y-3">
            {selectedBoard.ideas.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-2">
                <Bookmark className="w-8 h-8 text-gray-300 mx-auto" />
                <h3 className="font-bold text-sm text-gray-900">Board is Empty</h3>
                <p className="text-xs text-gray-500">
                  Click the 📌 Pin button on any search result to save ideas into this board.
                </p>
              </div>
            ) : (
              selectedBoard.ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    {idea.croppedImage && (
                      <img
                        src={idea.croppedImage}
                        alt={idea.title}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50 border border-gray-200 flex-shrink-0"
                      />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize bg-amber-50 text-amber-900 border-amber-200">
                          {idea.domain}
                        </span>
                        <button
                          onClick={(e) => handleRemoveIdea(idea.id, e)}
                          title="Remove idea from board"
                          className="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h3 className="font-semibold text-xs text-gray-900 line-clamp-2 leading-snug">
                        {idea.title}
                      </h3>

                      {idea.snippet && (
                        <p className="text-[11px] text-gray-500 line-clamp-1 mt-1">{idea.snippet}</p>
                      )}
                    </div>
                  </div>

                  <a
                    href={idea.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>View on {idea.domain}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Boards Grid View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Shopping Boards ({boards.length})
            </h2>
            <button
              onClick={() => {
                setBoardName('');
                setBoardDesc('');
                setShowCreateModal(true);
              }}
              className="bg-pinterest-red hover:bg-pinterest-hover text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg flex items-center gap-1 shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Board</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-xs text-gray-400">Loading boards...</div>
          ) : boards.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-gray-300 mx-auto" />
              <h3 className="font-bold text-sm text-gray-900">No Boards Created</h3>
              <p className="text-xs text-gray-500">
                Create custom boards (e.g. Living Room, Gift Ideas) to organize marketplace product finds.
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-pinterest-red text-white text-xs font-semibold px-4 py-2 rounded-lg"
              >
                + Create First Board
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {boards.map((b) => (
                <div
                  key={b.id}
                  onClick={() => setActiveBoardId(b.id)}
                  className="bg-white rounded-xl border border-gray-200 p-3.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-pinterest-red flex items-center justify-center flex-shrink-0 font-bold border border-red-100">
                      <Bookmark className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 text-xs truncate group-hover:text-pinterest-red transition-colors">
                        {b.name}
                      </h3>
                      {b.description && (
                        <p className="text-[11px] text-gray-500 truncate">{b.description}</p>
                      )}
                      <span className="text-[10px] text-gray-400 mt-0.5 block">
                        {b.ideas.length} pinned idea(s)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteBoard(b.id);
                      }}
                      title="Delete Board"
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-4 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-gray-900">Create New Shopping Board</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Board Name *</label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  placeholder="e.g. Bedroom Decor, Study Setup..."
                  required
                  autoFocus
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-pinterest-red focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  placeholder="Short description..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-pinterest-red focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pinterest-red text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-pinterest-hover"
                >
                  Create Board
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Rename Board Modal */}
      {showEditModal && selectedBoard && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-4 shadow-xl border border-gray-200 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-sm text-gray-900">Edit Board Details</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateBoard} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Board Name *</label>
                <input
                  type="text"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-pinterest-red focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description (Optional)</label>
                <input
                  type="text"
                  value={boardDesc}
                  onChange={(e) => setBoardDesc(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-pinterest-red focus:outline-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-pinterest-red text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-pinterest-hover"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
