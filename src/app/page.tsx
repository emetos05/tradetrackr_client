// import { auth0 } from "@/app/lib/auth0";
import "./globals.css";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-b from-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-lg w-full flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-gray-100">
          Welcome to Trade Tracker
        </h1>
        <p className="text-lg text-center text-gray-600 dark:text-gray-300">
          Track your clients, jobs, and invoices with ease. Please log in to
          continue.
        </p>
      </div>
    </main>
  );
}

export const metadata = {
  title: "Tradetrackr",
  description: "A simple app to track jobs and invoices.",
};
