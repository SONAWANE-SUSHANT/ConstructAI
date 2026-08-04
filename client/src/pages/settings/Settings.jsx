import PageShell from "../../components/PageShell";
import { useTheme } from "../../hooks/useTheme";

export default function Settings() {
  const { theme, setTheme } = useTheme();

  return (
    <PageShell eyebrow="Workspace" title="Settings" description="Manage local application preferences.">
      <section className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">Appearance</h2>
        <div className="mt-4 flex gap-3">
          {["light", "dark"].map((option) => (
            <button
              className={`rounded-lg px-4 py-2 text-sm font-semibold capitalize ${
                theme === option
                  ? "bg-cyan-700 text-white"
                  : "border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              key={option}
              type="button"
              onClick={() => setTheme(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
