// Client-Side Analytics & Recommendation Engine for Literary Harbor

export type EventType = 'view' | 'read' | 'save' | 'complete';

export interface BookInteraction {
  bookId: string;
  category?: string;
  score: number;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = "lh_reading_history";
const POPULARITY_STORAGE_KEY = "lh_book_popularity";

/**
 * Track user interactions with books to generate recommendations and popularity scores.
 */
export function trackBookEvent(bookId: string, eventType: EventType, category?: string) {
  if (typeof window === "undefined") return;

  const weights: Record<EventType, number> = {
    view: 1,
    read: 3,
    save: 5,
    complete: 10,
  };

  const score = weights[eventType] || 1;
  const now = Date.now();

  try {
    // 1. Update Personal Reading History
    const rawHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    const history: Record<string, { count: number; lastCategory?: string; lastSeen: number }> = rawHistory ? JSON.parse(rawHistory) : {};

    if (!history[bookId]) {
      history[bookId] = { count: 0, lastCategory: category, lastSeen: now };
    }
    history[bookId].count += score;
    if (category) history[bookId].lastCategory = category;
    history[bookId].lastSeen = now;

    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));

    // 2. Update Global Aggregate Popularity (Simulated on-device + synced)
    const rawPop = localStorage.getItem(POPULARITY_STORAGE_KEY);
    const popularity: Record<string, number> = rawPop ? JSON.parse(rawPop) : {};
    
    // Throttle repeated fast clicks (within 2 seconds)
    const lastClickKey = `lh_last_click_${bookId}_${eventType}`;
    const lastClick = sessionStorage.getItem(lastClickKey);
    if (!lastClick || now - parseInt(lastClick) > 2000) {
      popularity[bookId] = (popularity[bookId] || 0) + score;
      localStorage.setItem(POPULARITY_STORAGE_KEY, JSON.stringify(popularity));
      sessionStorage.setItem(lastClickKey, now.toString());
    }
  } catch (err) {
    console.warn("Failed to update analytics event:", err);
  }
}

/**
 * Get user's top categories based on reading history
 */
export function getUserTopCategories(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const rawHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!rawHistory) return [];

    const history: Record<string, { count: number; lastCategory?: string }> = JSON.parse(rawHistory);
    const categoryScores: Record<string, number> = {};

    Object.values(history).forEach((item) => {
      if (item.lastCategory) {
        categoryScores[item.lastCategory] = (categoryScores[item.lastCategory] || 0) + item.count;
      }
    });

    return Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .map(([cat]) => cat);
  } catch (_) {
    return [];
  }
}

/**
 * Get books sorted by popularity
 */
export function getPopularityScores(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const rawPop = localStorage.getItem(POPULARITY_STORAGE_KEY);
    return rawPop ? JSON.parse(rawPop) : {};
  } catch (_) {
    return {};
  }
}

/**
 * Reset local user reading history
 */
export function clearReadingHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
