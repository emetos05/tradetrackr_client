export default async function Dashboard() {
  return (
    <main>
      <a href="/auth/logout">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Log out
        </button>
      </a>
      <h1>Dashboard</h1>
      <p>Welcome to your dashboard!</p>
    </main>
  );
}

export const metadata = {
  title: "Dashboard",
  description: "Your personal dashboard for managing jobs and invoices.",
};
