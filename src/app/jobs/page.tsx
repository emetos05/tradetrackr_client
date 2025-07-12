export default function JobsPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Jobs
        </h1>
        {/* Jobs list and actions here */}
      </div>
    </main>
  );
}

export const metadata = {
  title: "Jobs",
  description: "Manage your jobs.",
};
