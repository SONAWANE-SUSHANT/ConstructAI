import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Profile() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setMessage("");
    setApiError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setApiError("");
    setMessage("");

    try {
      await updateProfile({ name: form.name.trim(), email: form.email.trim() });
      setMessage("Profile updated successfully.");
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-3xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">Account</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-950">Profile settings</h1>
          </div>
          <div className="flex gap-3">
            <Link
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-white"
              to="/dashboard"
            >
              Dashboard
            </Link>
            <button
              className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500"
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>

        <form className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-slate-200" onSubmit={handleSubmit} noValidate>
          {message ? (
            <div className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}
          {apiError ? (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {apiError}
            </div>
          ) : null}

          <div className="grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm font-medium text-slate-700">Full name</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
              />
              {errors.name ? <span className="mt-1 block text-sm text-red-600">{errors.name}</span> : null}
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700">Email</span>
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
              {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email}</span> : null}
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              className="rounded-lg bg-cyan-700 px-5 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-400"
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save profile"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
