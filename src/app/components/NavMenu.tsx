"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  Search,
  User,
  Briefcase,
  FileText,
  X,
  Menu,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./NavMenu.module.css";
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { globalSearch, SearchResult } from "@/app/lib/actions";

interface NavProps {
  isAuthenticated?: boolean;
}

export default function Nav({ isAuthenticated = false }: NavProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResultIndex, setSelectedResultIndex] = useState(-1);
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchCacheRef = useRef<Map<string, SearchResult[]>>(new Map());

  // Global keyboard shortcut to focus search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    if (isAuthenticated) {
      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, [isAuthenticated]);

  // Debounced search function with caching
  const performSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      setSearchOpen(false);
      setIsSearching(false);
      setSelectedResultIndex(-1);
      return;
    }

    // Check cache first
    const cacheKey = query.toLowerCase();
    const cachedResults = searchCacheRef.current.get(cacheKey);
    if (cachedResults) {
      setSearchResults(cachedResults);
      setSearchOpen(true);
      setSelectedResultIndex(-1);
      return;
    }

    setIsSearching(true);
    setSelectedResultIndex(-1);
    try {
      const results = await globalSearch(query);
      setSearchResults(results);
      setSearchOpen(true);

      // Cache results
      searchCacheRef.current.set(cacheKey, results);

      // Limit cache size to prevent memory issues
      if (searchCacheRef.current.size > 50) {
        const firstKey = searchCacheRef.current.keys().next().value;
        if (firstKey) {
          searchCacheRef.current.delete(firstKey);
        }
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search.trim()) {
        performSearch(search.trim());
      } else {
        setSearchResults([]);
        setSearchOpen(false);
        setIsSearching(false);
        setSelectedResultIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!searchOpen || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedResultIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedResultIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (
            selectedResultIndex >= 0 &&
            selectedResultIndex < searchResults.length
          ) {
            const selectedResult = searchResults[selectedResultIndex];
            setSearchOpen(false);
            setSearch("");
            setSearchResults([]);
            setSelectedResultIndex(-1);
            router.push(selectedResult.href);
          }
          break;
        case "Escape":
          e.preventDefault();
          setSearchOpen(false);
          setSearch("");
          setSearchResults([]);
          setSelectedResultIndex(-1);
          break;
      }
    },
    [searchOpen, searchResults, selectedResultIndex, router]
  );

  const handleResultClick = useCallback(
    (result: SearchResult) => {
      setSearchOpen(false);
      setSearch("");
      setSearchResults([]);
      setSelectedResultIndex(-1);
      router.push(result.href);
    },
    [router]
  );

  function getIcon(type: string) {
    if (type === "client") return <User className="w-4 h-4 text-blue-500" />;
    if (type === "job") return <Briefcase className="w-4 h-4 text-green-500" />;
    if (type === "invoice")
      return <FileText className="w-4 h-4 text-yellow-500" />;
    return <Search className="w-4 h-4" />;
  }

  const navigationItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Squares2X2Icon,
      isActive: pathname === "/dashboard",
    },
    {
      href: "/clients",
      label: "Clients",
      icon: UserGroupIcon,
      isActive: pathname.startsWith("/clients"),
    },
    {
      href: "/jobs",
      label: "Jobs",
      icon: Briefcase,
      isActive: pathname.startsWith("/jobs"),
    },
    {
      href: "/invoices",
      label: "Invoices",
      icon: DocumentTextIcon,
      isActive: pathname.startsWith("/invoices"),
    },
  ];

  const navLinks = (
    <div className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`${styles.navLink} ${item.isActive ? styles.active : ""}`}
          onClick={() => setMenuOpen(false)}
        >
          <item.icon className="w-5 h-5" />
          <span>{item.label}</span>
        </Link>
      ))}
    </div>
  );

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          <div className={styles.brandIcon}>
            <HomeIcon className="w-6 h-6" />
          </div>
          <span className={styles.brandText}>Trade Tracker</span>
        </Link>
        {isAuthenticated && (
          <>
            <button
              className={styles.hamburger}
              aria-label="Open navigation menu"
              aria-expanded={menuOpen}
              aria-controls="main-nav-links"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <Menu className="w-6 h-6" />
            </button>
            {navLinks}
          </>
        )}
      </div>
      <div className={styles.right}>
        {isAuthenticated && (
          <>
            <Dialog.Root open={searchOpen} onOpenChange={setSearchOpen}>
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search clients, jobs, invoices... (⌘K)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className={styles.searchInput}
                  onFocus={() => search.length > 1 && setSearchOpen(true)}
                />
                {isSearching ? (
                  <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 animate-spin" />
                ) : (
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                )}
              </div>
              <Dialog.Portal>
                <Dialog.Overlay
                  className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
                  onClick={() => setSearchOpen(false)}
                />
                <Dialog.Content className="fixed left-1/2 top-20 max-h-[60vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-4 shadow-2xl z-50 focus:outline-none border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      Search Results
                    </span>
                    <Dialog.Close asChild>
                      <button
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                        onClick={() => {
                          setSearchOpen(false);
                          setSearch("");
                          setSearchResults([]);
                          setSelectedResultIndex(-1);
                        }}
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <ul className="space-y-1">
                    {isSearching ? (
                      <li className="text-gray-500 px-3 py-4 text-center flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </li>
                    ) : searchResults.length === 0 && search.length >= 2 ? (
                      <li className="text-gray-500 px-3 py-4 text-center">
                        No results found for "{search}"
                      </li>
                    ) : search.length < 2 ? (
                      <li className="text-gray-500 px-3 py-4 text-center">
                        Type at least 2 characters to search
                      </li>
                    ) : (
                      searchResults.map((result, index) => (
                        <li
                          key={result.type + result.id}
                          className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                            index === selectedResultIndex
                              ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700"
                              : "hover:bg-gray-50 dark:hover:bg-gray-800"
                          }`}
                          onClick={() => handleResultClick(result)}
                          onMouseEnter={() => setSelectedResultIndex(index)}
                        >
                          {getIcon(result.type)}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">
                              {result.name}
                            </div>
                            {result.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {result.description}
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full flex-shrink-0">
                            {result.type}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                  {searchResults.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                        {searchResults.length} result
                        {searchResults.length !== 1 ? "s" : ""} found
                        {searchResults.length > 0 && (
                          <span className="block mt-1">
                            Use ↑↓ arrows to navigate, Enter to select
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
        <div className={styles.authButtons}>
          {!isAuthenticated ? (
            <>
              <a
                href="/auth/login?returnTo=/dashboard"
                className={styles.loginBtn}
              >
                <span>Log In</span>
              </a>
              <a
                href="/auth/login?screen_hint=signup"
                className={styles.signupBtn}
              >
                <span>Sign Up</span>
              </a>
            </>
          ) : (
            <a href="/auth/logout" className={styles.logoutBtn}>
              <span>Log Out</span>
            </a>
          )}
        </div>
      </div>
    </nav>
  );
}
