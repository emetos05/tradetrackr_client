"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// import Button from "./ui/button"; // Uncomment if using custom button
import styles from "./NavMenu.module.css";

interface NavProps {
  isAuthenticated?: boolean;
}

export default function Nav({ isAuthenticated = false }: NavProps) {
  const pathname = usePathname();
  const [search, setSearch] = useState("");

  return (
    <nav className={styles.navbar}>
      <div className={styles.left}>
        <Link href="/" className={styles.brand}>
          Trade Trackr
        </Link>
        {isAuthenticated && (
          <>
            <Link
              href="/dashboard"
              className={
                styles.dashboardLink +
                (pathname === "/dashboard" ? " " + styles.active : "")
              }
            >
              Dashboard
            </Link>
            <Link
              href="/clients"
              className={
                styles.dashboardLink +
                (pathname === "/clients" ? " " + styles.active : "")
              }
            >
              Clients
            </Link>
            <Link
              href="/jobs"
              className={
                styles.dashboardLink +
                (pathname === "/jobs" ? " " + styles.active : "")
              }
            >
              Jobs
            </Link>
            <Link
              href="/invoices"
              className={
                styles.dashboardLink +
                (pathname === "/invoices" ? " " + styles.active : "")
              }
            >
              Invoices
            </Link>
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
