import { useCallback, useMemo, useState } from "react";
import { ToastContext } from "./toastContextValue";

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current, { id, message, type }]);
    window.setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((toast) => (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
              toast.type === "error"
                ? "bg-red-50 text-red-800 ring-red-200"
                : toast.type === "success"
                  ? "bg-emerald-50 text-emerald-800 ring-emerald-200"
                  : "bg-white text-slate-800 ring-slate-200"
            }`}
            key={toast.id}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
