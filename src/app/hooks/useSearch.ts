"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { globalSearch } from "@/app/lib/actions";
import { SearchResult, SearchType, SearchCacheEntry } from "@/app/types/search";

interface UseSearchOptions {
  enableCache?: boolean;
  cacheTimeout?: number; // milliseconds
  debounceDelay?: number;
  maxResults?: number;
}

interface UseSearchReturn {
  search: (query: string, types?: SearchType[]) => Promise<SearchResult[]>;
  isSearching: boolean;
  clearCache: () => void;
  cacheSize: number;
}

const DEFAULT_OPTIONS: Required<UseSearchOptions> = {
  enableCache: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  debounceDelay: 300,
  maxResults: 20,
};

export function useSearch(options: UseSearchOptions = {}): UseSearchReturn {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);
  const [isSearching, setIsSearching] = useState(false);
  const cacheRef = useRef<Map<string, SearchCacheEntry>>(new Map());
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getCacheKey = useCallback((query: string, types?: SearchType[]) => {
    return `${query.toLowerCase()}:${types?.sort().join(",") || "all"}`;
  }, []);

  const isValidCacheEntry = useCallback(
    (entry: SearchCacheEntry) => {
      return Date.now() - entry.timestamp < opts.cacheTimeout;
    },
    [opts.cacheTimeout]
  );

  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  const cleanExpiredCache = useCallback(() => {
    const entries = Array.from(cacheRef.current.entries());
    entries.forEach(([key, entry]) => {
      if (!isValidCacheEntry(entry)) {
        cacheRef.current.delete(key);
      }
    });
  }, [isValidCacheEntry]);

  const search = useCallback(
    async (query: string, types?: SearchType[]): Promise<SearchResult[]> => {
      if (!query || query.length < 2) {
        return [];
      }

      const cacheKey = getCacheKey(query, types);

      // Check cache first
      if (opts.enableCache) {
        const cached = cacheRef.current.get(cacheKey);
        if (cached && isValidCacheEntry(cached)) {
          return cached.results;
        }
      }

      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(async () => {
          setIsSearching(true);
          try {
            const results = await globalSearch(query, types, opts.maxResults);

            // Cache results
            if (opts.enableCache) {
              cacheRef.current.set(cacheKey, {
                results,
                timestamp: Date.now(),
                query,
              });

              // Limit cache size
              if (cacheRef.current.size > 100) {
                cleanExpiredCache();
                // If still too large, remove oldest entries
                if (cacheRef.current.size > 100) {
                  const entries = Array.from(cacheRef.current.entries());
                  entries
                    .sort((a, b) => a[1].timestamp - b[1].timestamp)
                    .slice(0, cacheRef.current.size - 50)
                    .forEach(([key]) => cacheRef.current.delete(key));
                }
              }
            }

            resolve(results);
          } catch (error) {
            console.error("Search error:", error);
            resolve([]);
          } finally {
            setIsSearching(false);
          }
        }, opts.debounceDelay);
      });
    },
    [opts, getCacheKey, isValidCacheEntry, cleanExpiredCache]
  );

  const cacheSize = useMemo(() => cacheRef.current.size, []);

  return {
    search,
    isSearching,
    clearCache,
    cacheSize,
  };
}

export default useSearch;
