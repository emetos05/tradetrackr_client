import Link from "next/link";
import {
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import "./globals.css";

const features = [
  {
    icon: UserGroupIcon,
    title: "Client Management",
    description:
      "Keep track of all your clients with detailed profiles and contact information.",
  },
  {
    icon: ClockIcon,
    title: "Job Tracking",
    description:
      "Monitor project progress, deadlines, and deliverables in real-time.",
  },
  {
    icon: DocumentTextIcon,
    title: "Invoice Generation",
    description:
      "Create professional invoices and track payments effortlessly.",
  },
  {
    icon: CheckCircleIcon,
    title: "Progress Monitoring",
    description:
      "Get insights into your business performance with detailed analytics.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-grid-gray-100/50 dark:bg-grid-gray-800/50" />
        <div className="absolute top-0 right-0 -mt-40 -mr-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-40 -ml-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-400/20 rounded-full blur-3xl" />

        <div className="relative px-6 py-24 mx-auto max-w-7xl lg:px-8 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex justify-center mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-sm font-medium text-blue-600 dark:text-blue-400">
                <SparklesIcon className="w-4 h-4" />
                Professional Business Management
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-7xl lg:text-8xl">
              <span className="block">Trade</span>
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tracker
              </span>
            </h1>
            <p className="mt-8 text-xl leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              The complete solution for managing your clients, tracking jobs,
              and generating invoices. Streamline your business operations with
              our intuitive platform designed for modern professionals.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <a
                href="/auth/login?returnTo=/dashboard"
                className="group relative px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Get Started
                <ArrowRightIcon className="inline w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/auth/login?screen_hint=signup"
                className="px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
              >
                Create Account
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to manage your business
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-400">
              Powerful tools designed to help you stay organized and grow your
              business efficiently.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-6xl">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-lg transition-all duration-300 hover:-translate-y-2"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                    <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative px-6 mx-auto max-w-7xl lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to streamline your business?
            </h2>
            <p className="mt-6 text-lg leading-8 text-blue-100">
              Join thousands of professionals who trust Trade Tracker to manage
              their operations.
            </p>
            <div className="mt-10">
              <Link
                href="/auth/login?screen_hint=signup"
                className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                Start Free Today
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export const metadata = {
  title: "Tradetrackr",
  description: "A simple app to track jobs and invoices.",
};
