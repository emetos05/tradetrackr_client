// import { auth0 } from "@/app/lib/auth0";
import "./globals.css";

export default async function Home() {
  return (
    <main>
      <a href="/auth/login?screen_hint=signup">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Sign up
        </button>
      </a>
      <a href="/auth/login?returnTo=/dashboard">
        <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Log in
        </button>
      </a>
      <br />
      <br />
      <h1>Welcome, to Tradetrackr!</h1>
      <p>Track your jobs and invoices with ease.</p>
    </main>
  );
}

export const metadata = {
  title: "Tradetrackr",
  description: "A simple app to track jobs and invoices.",
};
