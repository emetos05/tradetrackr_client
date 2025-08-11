"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, X, Loader2, User, Briefcase, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSearch } from "@/app/hooks/useSearch";
import { SearchResult, SearchType } from "@/app/types/search";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
}

export function SearchDialog({
  open,
  onOpenChange,
  placeholder = "Search clients, jobs, invoices...",
}: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { search, isSearching } = useSearch({
    enableCache: true,
    debounceDelay: 200,
    maxResults: 20,
  });

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSearchResults([]);
      setSelectedIndex(-1);
    }
  }, [open]);

  // Perform search
  const handleSearch = useCallback(
    async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        setSelectedIndex(-1);
        return;
      }

      try {
        const results = await search(searchQuery);
        setSearchResults(results);
        setSelectedIndex(-1);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      }
    },
    [search]
  );

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch(query.trim());
      } else {
        setSearchResults([]);
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, handleSearch]);

  // Get all results for keyboard navigation
  const allResults = searchResults;

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < allResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : allResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < allResults.length) {
            const selectedResult = allResults[selectedIndex];
            onOpenChange(false);
            router.push(selectedResult.href);
          }
          break;
        case "Escape":
          e.preventDefault();
          onOpenChange(false);
          break;
      }
    },
    [allResults, selectedIndex, onOpenChange, router]
  );

  const handleResultClick = (result: SearchResult) => {
    onOpenChange(false);
    router.push(result.href);
  };

  const getIcon = (type: SearchType) => {
    switch (type) {
      case "client":
        return <User className="w-4 h-4 text-blue-500" />;
      case "job":
        return <Briefcase className="w-4 h-4 text-green-500" />;
      case "invoice":
        return <FileText className="w-4 h-4 text-yellow-500" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: SearchType) => {
    switch (type) {
      case "client":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "job":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "invoice":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const renderResult = (
    result: SearchResult,
    index: number,
    isSelected: boolean
  ) => (
    <li
      key={`${result.type}-${result.id}`}
      className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all duration-150 ${
        isSelected
          ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 shadow-sm"
          : "hover:bg-gray-50 dark:hover:bg-gray-800"
      }`}
      onClick={() => handleResultClick(result)}
      onMouseEnter={() => setSelectedIndex(index)}
    >
      {getIcon(result.type)}
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-gray-900 dark:text-gray-100">
          {result.highlight ? (
            <span dangerouslySetInnerHTML={{ __html: result.highlight }} />
          ) : (
            result.name
          )}
        </div>
        {result.description && (
          <div className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
            {result.description}
          </div>
        )}
      </div>
      <span
        className={`text-xs px-2 py-1 rounded-full capitalize flex-shrink-0 ${getTypeColor(
          result.type
        )}`}
      >
        {result.type}
      </span>
    </li>
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-16 max-h-[70vh] w-full max-w-2xl -translate-x-1/2 overflow-hidden rounded-xl bg-white dark:bg-gray-900 shadow-2xl z-50 focus:outline-none border border-gray-200 dark:border-gray-700">
          <div className="p-4">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-12 pr-4 py-3 text-lg border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
              {isSearching ? (
                <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
              ) : (
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              )}
              <Dialog.Close asChild>
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Close search"
                >
                  <X className="w-5 h-5" />
                </button>
              </Dialog.Close>
            </div>

            {/* View Mode Toggle */}
            {/* {query.length >= 2 && !isSearching && allResults.length > 0 && (
              <div className="flex justify-between items-center mt-4 mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {allResults.length} result{allResults.length !== 1 ? "s" : ""}{" "}
                  found
                </span>
              </div>
            )} */}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto px-4 pb-4">
            {isSearching ? (
              <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Searching...
              </div>
            ) : query.length < 2 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Type at least 2 characters to search</p>
              </div>
            ) : allResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for &quot;{query}&quot;</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div>
                {
                  <ul className="space-y-1">
                    {searchResults.map((result, index) =>
                      renderResult(result, index, selectedIndex === index)
                    )}
                  </ul>
                }
              </div>
            )}
          </div>

          {/* Footer */}
          {allResults.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                  Use ↑↓ arrows to navigate, Enter to select, Esc to close
                </span>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SearchDialog;
