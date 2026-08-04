import { Link } from "react-router-dom";

export default function PageShell({ eyebrow, title, description, action, children }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950">
      <section className="mx-auto w-full max-w-7xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">{eyebrow}</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950 dark:text-slate-50">{title}</h1>
            {description ? <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p> : null}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              to="/projects"
            >
              Projects
            </Link>
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              to="/reports"
            >
              Reports
            </Link>
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-700 hover:bg-white dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-900"
              to="/settings"
            >
              Settings
            </Link>
            {action}
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}
