"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// import Button from "./ui/button"; // Uncomment if using custom button
import styles from "./NavMenu.module.css";
import { HomeIcon, Squares2X2Icon } from "@heroicons/react/24/outline";

interface NavProps {
  isAuthenticated?: boolean;
}

export default function Nav({ isAuthenticated = false }: NavProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

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
          Trade Trackr
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
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
        )}
        {!isAuthenticated ? (
          <>
            <Link
              href="/auth/login?returnTo=/dashboard"
              className={styles.loginBtn}
            >
              Log In
            </Link>
            <Link
              href="/auth/login?screen_hint=signup"
              className={styles.signupBtn}
            >
              Sign Up
            </Link>
          </>
        ) : (
          <Link href="/auth/logout" className={styles.logoutBtn}>
            Log Out
          </Link>
        )}
      </div>
    </nav>
  );
}
