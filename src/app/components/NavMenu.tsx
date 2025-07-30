"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Search, User, Briefcase, FileText, X, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import styles from "./NavMenu.module.css";
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

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
                  type="text"
                  placeholder="Search clients, jobs, invoices..."
                  value={search}
                  // onChange={(e) => handleGlobalSearch(e.target.value)}
                  readOnly //for now until global search is fixed
                  className={styles.searchInput}
                  onFocus={() => search.length > 1 && setSearchOpen(true)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" />
                <Dialog.Content className="fixed left-1/2 top-20 max-h-[60vh] w-full max-w-md -translate-x-1/2 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 p-4 shadow-2xl z-50 focus:outline-none border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-gray-700 dark:text-gray-200">
                      Search Results
                    </span>
                    <Dialog.Close asChild>
                      <button
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Close"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </Dialog.Close>
                  </div>
                  <ul className="space-y-1">
                    {searchResults.length === 0 ? (
                      <li className="text-gray-500 px-3 py-4 text-center">
                        No results found
                      </li>
                    ) : (
                      searchResults.map((result) => (
                        <li
                          key={result.type + result.id}
                          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                          onClick={() => {
                            setSearchOpen(false);
                            setSearch("");
                            setSearchResults([]);
                            router.push(result.href);
                          }}
                        >
                          {getIcon(result.type)}
                          <span className="flex-1 font-medium">
                            {result.name}
                          </span>
                          <span className="text-xs text-gray-400 capitalize bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
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
