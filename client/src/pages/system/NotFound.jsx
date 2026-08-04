import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">404</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-slate-50">Page not found</h1>
        <Link className="mt-6 inline-flex rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800" to="/dashboard">
          Go to dashboard
        </Link>
      </section>
    </main>
  );
}
