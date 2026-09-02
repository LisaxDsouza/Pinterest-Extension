import { HistoryItem, Board, PinnedIdea, SearchResponse, ProductCandidate } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'app_search_history',
  BOARDS: 'app_shopping_boards',
};

// Helper: Safely access chrome.storage.local
async function getStorageData<T>(key: string, defaultValue: T): Promise<T> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] ? (result[key] as T) : defaultValue);
      });
    } else {
      // LocalStorage fallback for non-extension preview environment
      try {
        const stored = localStorage.getItem(key);
        resolve(stored ? JSON.parse(stored) : defaultValue);
      } catch {
        resolve(defaultValue);
      }
    }
  });
}

async function setStorageData<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
      resolve();
    }
  });
}

// --- HISTORY MANAGEMENT ---

export async function getHistory(): Promise<HistoryItem[]> {
  const items = await getStorageData<HistoryItem[]>(STORAGE_KEYS.HISTORY, []);
  // Sort newest first
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export async function saveToHistory(
  response: SearchResponse,
  croppedImage: string
): Promise<HistoryItem> {
  const history = await getHistory();

  // Create new history item
  const newItem: HistoryItem = {
    id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: Date.now(),
    croppedImage,
    category: response.analysis?.category || 'Cropped Product',
    description: response.analysis?.description || '',
    queries: response.queries || [],
    products: response.products || [],
    directSearches: response.direct_searches || [],
  };

  // Deduplicate recent identical searches within 5 seconds if image is same
  const updatedHistory = [newItem, ...history.filter((h) => h.croppedImage !== croppedImage)].slice(0, 50); // Keep max 50 items
  await setStorageData(STORAGE_KEYS.HISTORY, updatedHistory);
  return newItem;
}

export async function deleteHistoryItem(id: string): Promise<void> {
  const history = await getHistory();
  const filtered = history.filter((item) => item.id !== id);
  await setStorageData(STORAGE_KEYS.HISTORY, filtered);
}

export async function clearHistory(): Promise<void> {
  await setStorageData(STORAGE_KEYS.HISTORY, []);
}

// --- BOARDS MANAGEMENT ---

export async function getBoards(): Promise<Board[]> {
  const boards = await getStorageData<Board[]>(STORAGE_KEYS.BOARDS, []);
  if (boards.length === 0) {
    // Create default starter board
    const defaultBoard: Board = {
      id: 'board_default',
      name: 'My Saved Ideas',
      description: 'Favorite marketplace product finds',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      ideas: [],
    };
    await setStorageData(STORAGE_KEYS.BOARDS, [defaultBoard]);
    return [defaultBoard];
  }
  return boards.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function createBoard(name: string, description?: string): Promise<Board> {
  const boards = await getBoards();
  const newBoard: Board = {
    id: `board_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim(),
    description: description?.trim() || '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ideas: [],
  };

  const updatedBoards = [newBoard, ...boards];
  await setStorageData(STORAGE_KEYS.BOARDS, updatedBoards);
  return newBoard;
}

export async function updateBoard(id: string, name: string, description?: string): Promise<Board> {
  const boards = await getBoards();
  const targetIndex = boards.findIndex((b) => b.id === id);

  if (targetIndex === -1) {
    throw new Error('Board not found');
  }

  boards[targetIndex] = {
    ...boards[targetIndex],
    name: name.trim(),
    description: description?.trim() || '',
    updatedAt: Date.now(),
  };

  await setStorageData(STORAGE_KEYS.BOARDS, boards);
  return boards[targetIndex];
}

export async function deleteBoard(id: string): Promise<void> {
  const boards = await getBoards();
  const filtered = boards.filter((b) => b.id !== id);
  await setStorageData(STORAGE_KEYS.BOARDS, filtered);
}

export async function pinIdeaToBoard(
  boardId: string,
  candidate: ProductCandidate,
  croppedImage?: string,
  category?: string
): Promise<Board> {
  const boards = await getBoards();
  const targetIndex = boards.findIndex((b) => b.id === boardId);

  if (targetIndex === -1) {
    throw new Error('Board not found');
  }

  const board = boards[targetIndex];
  // Check if idea is already pinned in this board
  const existingIndex = board.ideas.findIndex((i) => i.url === candidate.url);

  if (existingIndex === -1) {
    const newIdea: PinnedIdea = {
      id: `idea_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: candidate.title,
      url: candidate.url,
      domain: candidate.domain,
      marketplace: candidate.marketplace,
      snippet: candidate.snippet,
      croppedImage,
      category,
      addedAt: Date.now(),
    };
    board.ideas.unshift(newIdea);
  }

  board.updatedAt = Date.now();
  boards[targetIndex] = board;
  await setStorageData(STORAGE_KEYS.BOARDS, boards);
  return board;
}

export async function removeIdeaFromBoard(boardId: string, ideaId: string): Promise<Board> {
  const boards = await getBoards();
  const targetIndex = boards.findIndex((b) => b.id === boardId);

  if (targetIndex === -1) {
    throw new Error('Board not found');
  }

  const board = boards[targetIndex];
  board.ideas = board.ideas.filter((i) => i.id !== ideaId);
  board.updatedAt = Date.now();
  boards[targetIndex] = board;
  await setStorageData(STORAGE_KEYS.BOARDS, boards);
  return board;
}
