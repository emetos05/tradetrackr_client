import { Metadata } from "next";
import { getClients, getJobs, getInvoices } from "@/app/lib/actions";
import { InvoiceStatus } from "@/app/invoices/types/invoice";
import {
  ArrowTrendingUpIcon,
  UsersIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { getJobTitle } from "../helpers/getLabel";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your business overview, recent activities, and key metrics",
};

function formatCurrency(amount: number) {
  return amount.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function formatDate(date: string) {
  if (!date) return "-";
  return date.slice(0, 10); // Format as YYYY-MM-DD
}

export default async function DashboardPage() {
  // Fetch all data in parallel
  const [clients, jobs, invoices] = await Promise.all([
    getClients(),
    getJobs(),
    getInvoices(),
  ]);

  // Summary stats
  const totalClients = clients.length;
  const totalJobs = jobs.length;
  const totalInvoices = invoices.length;
  const outstandingBalance = invoices
    .filter(
      (inv) =>
        inv.status !== InvoiceStatus.Paid &&
        inv.status !== InvoiceStatus.Cancelled
    )
    .reduce((sum, inv) => sum + inv.amount, 0);

  // Recent activity (last 10 by date)
  const activities: Array<{
    type: "client" | "job" | "invoice";
    id?: string;
    date: string;
    title: string;
    description: string;
    icon: React.ReactNode;
  }> = [
    ...clients.map((c) => ({
      type: "client" as const,
      id: c.id,
      date: c.createdAt,
      title: c.name,
      description: `New client: ${c.name}`,
      icon: <UsersIcon className="h-5 w-5 text-blue-500" />, // shadcn style
    })),
    ...jobs.map((j) => ({
      type: "job" as const,
      id: j.id,
      date: j.createdAt,
      title: j.title,
      description: `Job: ${j.title} (${
        j.status === 2 ? "Completed" : "In Progress"
      })`,
      icon: <BriefcaseIcon className="h-5 w-5 text-green-500" />,
    })),
    ...invoices.map((inv) => ({
      type: "invoice" as const,
      id: inv.id,
      date: inv.issueDate,
      title: `Invoice for ${getJobTitle(jobs, inv.jobId) || "Unknown Job"}`,
      description: `Invoice for $${inv.amount} (${InvoiceStatus[inv.status]})`,
      icon: <DocumentTextIcon className="h-5 w-5 text-yellow-500" />,
    })),
  ];
  // Sort by date descending, fallback to string sort if missing
  const sortedActivities = activities
    .filter((a) => a.date)
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 10);

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-white dark:bg-gray-900">
      <div className="w-full max-w-4xl flex flex-col gap-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Dashboard
        </h1>
        {/* Summary Widgets */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-xl shadow bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 p-6 flex flex-col items-start">
            <UsersIcon className="h-8 w-8 mb-2 text-blue-600 dark:text-blue-300" />
            <div className="text-2xl font-bold">{totalClients}</div>
            <div className="text-gray-600 dark:text-gray-300">Clients</div>
          </div>
          <div className="rounded-xl shadow bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-6 flex flex-col items-start">
            <BriefcaseIcon className="h-8 w-8 mb-2 text-green-600 dark:text-green-300" />
            <div className="text-2xl font-bold">{totalJobs}</div>
            <div className="text-gray-600 dark:text-gray-300">Jobs</div>
          </div>
          <div className="rounded-xl shadow bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800 p-6 flex flex-col items-start">
            <DocumentTextIcon className="h-8 w-8 mb-2 text-yellow-600 dark:text-yellow-300" />
            <div className="text-2xl font-bold">{totalInvoices}</div>
            <div className="text-gray-600 dark:text-gray-300">Invoices</div>
          </div>
          <div className="rounded-xl shadow bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 p-6 flex flex-col items-start">
            <CurrencyDollarIcon className="h-8 w-8 mb-2 text-purple-600 dark:text-purple-300" />
            <div className="text-2xl font-bold">
              {formatCurrency(outstandingBalance)}
            </div>
            <div className="text-gray-600 dark:text-gray-300">Outstanding</div>
          </div>
        </div>
        {/* Recent Activity Feed */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ArrowTrendingUpIcon className="h-6 w-6 text-indigo-500" /> Recent
            Activity
          </h2>
          <ul className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-xl shadow">
            {sortedActivities.length === 0 ? (
              <li className="py-6 text-center text-gray-500">
                No recent activity.
              </li>
            ) : (
              sortedActivities.map((activity, idx) => (
                <li key={idx} className="flex items-center gap-4 px-6 py-4">
                  <span>{activity.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {activity.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.description}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatDate(activity.date)}
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </main>
  );
}
