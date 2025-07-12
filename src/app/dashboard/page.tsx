export default function DashboardPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Dashboard
        </h1>
        {/* Add dashboard widgets here */}
      </div>
    </main>
  );
}

export const metadata = {
  title: "Dashboard",
  description:
    "Your personal dashboard for managing clients, jobs and invoices.",
};
