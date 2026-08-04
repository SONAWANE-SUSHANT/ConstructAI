import Modal from "./Modal";

export default function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <Modal
      title={title}
      onClose={onCancel}
      footer={
        <>
          <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" type="button" onClick={onCancel}>
            Cancel
          </button>
          <button
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white ${tone === "danger" ? "bg-red-700 hover:bg-red-800" : "bg-cyan-700 hover:bg-cyan-800"}`}
            type="button"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      {message}
    </Modal>
  );
}
