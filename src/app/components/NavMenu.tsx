"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, User, Briefcase, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";
// import Button from "./ui/button"; // Uncomment if using custom button
import styles from "./NavMenu.module.css";
import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface NavProps {
  isAuthenticated?: boolean;
}

type SearchResult = {
  type: "client" | "job" | "invoice";
  id: string;
  name: string;
  href: string;
};

export default function Nav({ isAuthenticated = false }: NavProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  // Simulate global search (replace with real API call if available)
  // async function handleGlobalSearch(query: string) {
  //   setSearch(query);
  //   if (query.length < 2) {
  //     setSearchResults([]);
  //     setSearchOpen(false);
  //     return;
  //   }
  // TODO: Replace with real API call
  // Example: const res = await fetch(`/api/global-search?q=${query}`)
  // setSearchResults(await res.json());
  // For now, just show dummy results
  //   setSearchResults([
  //     { type: "client", id: "1", name: "Jane Doe", href: "/clients/1" },
  //     { type: "job", id: "2", name: "Kitchen Remodel", href: "/jobs/2" },
  //     { type: "invoice", id: "3", name: "Invoice #1234", href: "/invoices/3" },
  //   ]);
  //   setSearchOpen(true);
  // }

  function getIcon(type: string) {
    if (type === "client") return <User className="w-4 h-4 text-blue-500" />;
    if (type === "job") return <Briefcase className="w-4 h-4 text-green-500" />;
    if (type === "invoice")
      return <FileText className="w-4 h-4 text-yellow-500" />;
    return <Search className="w-4 h-4" />;
  }

  const navLinks = (
    <div className={`${styles.navLinks} ${menuOpen ? styles.open : ""}`}>
      <Link
        href="/dashboard"
        className={
          styles.dashboardLink +
          (pathname === "/dashboard" ? " " + styles.active : "")
        }
        onClick={() => setMenuOpen(false)}
      >
        <Squares2X2Icon className="inline h-5 w-5 mr-1 align-text-bottom" />{" "}
        Dashboard
      </Link>
      <Link
        href="/clients"
        className={
          styles.dashboardLink +
          (pathname === "/clients" ? " " + styles.active : "")
        }
        onClick={() => setMenuOpen(false)}
      >
        Clients
      </Link>
      <Link
        href="/jobs"
        className={
          styles.dashboardLink +
          (pathname === "/jobs" ? " " + styles.active : "")
        }
        onClick={() => setMenuOpen(false)}
      >
        Jobs
      </Link>
      <Link
        href="/invoices"
        className={
          styles.dashboardLink +
          (pathname === "/invoices" ? " " + styles.active : "")
        }
        onClick={() => setMenuOpen(false)}
      >
        Invoices
      </Link>
    </div>
  );

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          <HomeIcon className="inline h-6 w-6 mr-1 align-text-bottom text-blue-600 dark:text-blue-300" />
          <span className={styles.brandText}>Trade Trackr</span>
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
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
              <span className={styles.hamburgerBar}></span>
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
                  type="text"
                  placeholder="Search..."
                  value={search}
                  // onChange={(e) => handleGlobalSearch(e.target.value)}
                  readOnly //for now until global search is fixed
                  className={styles.searchInput + " pl-8"}
                  onFocus={() => search.length > 1 && setSearchOpen(true)}
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/10 z-40" />
                <Dialog.Content className="fixed left-1/2 top-20 max-h-[60vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded bg-white dark:bg-gray-900 p-2 shadow-lg z-50 focus:outline-none">
                  <div className="flex items-center justify-between mb-2 px-2">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      Search Results
                    </span>
                    <Dialog.Close asChild>
                      <button
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <ul>
                    {searchResults.length === 0 ? (
                      <li className="text-gray-500 px-4 py-2">No results</li>
                    ) : (
                      searchResults.map((result) => (
                        <li
                          key={result.type + result.id}
                          className="flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearch("");
                            setSearchResults([]);
                            router.push(result.href);
                          }}
                        >
                          {getIcon(result.type)}
                          <span className="flex-1">{result.name}</span>
                          <span className="text-xs text-gray-400 capitalize">
                            {result.type}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          </>
        )}
        {!isAuthenticated ? (
          <>
            <a
              href="/auth/login?returnTo=/dashboard"
              className={styles.loginBtn}
            >
              <span className="text-sm sm:text-base">Log In</span>
            </a>
            <a
              href="/auth/login?screen_hint=signup"
              className={styles.signupBtn}
            >
              <span className="text-sm sm:text-base">Sign Up</span>
            </a>
          </>
        ) : (
          <a href="/auth/logout" className={styles.logoutBtn}>
            <span className="text-sm sm:text-base">Log Out</span>
          </a>
        )}
      </div>
    </nav>
  );
}
