export default function FormField({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-sm text-red-600 dark:text-red-400">{error}</span> : null}
    </label>
  );
}
