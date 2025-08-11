"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Briefcase, Menu } from "lucide-react";
import styles from "./NavMenu.module.css";
import {
  HomeIcon,
  Squares2X2Icon,
  UserGroupIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import { SearchDialog } from "@/app/components/SearchDialog";

interface NavProps {
  isAuthenticated?: boolean;
}

export default function Nav({ isAuthenticated = false }: NavProps) {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Global keyboard shortcut to focus search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    if (isAuthenticated) {
      document.addEventListener("keydown", handleGlobalKeyDown);
      return () => document.removeEventListener("keydown", handleGlobalKeyDown);
    }
  }, [isAuthenticated]);

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
            {/* Search trigger button */}
            <button
              onClick={() => setSearchOpen(true)}
              className={styles.searchTrigger}
              title="Search (⌘K)"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Search...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 text-xs">
                ⌘K
              </kbd>
            </button>

            {/* Enhanced Search Dialog */}
            <SearchDialog
              open={searchOpen}
              onOpenChange={setSearchOpen}
              placeholder="Search clients, jobs, invoices... (⌘K)"
            />
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
