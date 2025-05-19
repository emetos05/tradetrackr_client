import { auth0 } from "@/app/lib/auth0";
import './globals.css';

export default async function Home() {
  // Fetch the user session
  const session = await auth0.getSession();
  // If no session, show sign-up and login buttons
  if (!session) {
    return (
      <main>
        <a href="/auth/login?screen_hint=signup">
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Sign up</button>
        </a>
        <a href="/auth/login">
          <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Log in</button>
        </a>
      </main>
    );
  }
  // If session exists, show a welcome message and logout button
  return (
    <main>
      <h1>Welcome, {session.user.name}!</h1>
      <p>
        <a href="/auth/logout">
          <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Log out</button>
        </a>        
      </p>
    </main>
  );
}
