export default function Modal({ title, children, footer, onClose }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/50 px-4">
      <section className="w-full max-w-lg rounded-lg bg-white shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">{title}</h2>
          <button className="rounded-lg px-3 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" type="button" onClick={onClose}>
            Close
          </button>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">{children}</div>
        {footer ? <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">{footer}</div> : null}
      </section>
    </div>
  );
}
