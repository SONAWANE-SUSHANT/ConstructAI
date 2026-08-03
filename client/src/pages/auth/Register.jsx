import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const Register = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const nextErrors = {};
    if (form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setApiError("");

    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setApiError(error.response?.data?.message || "Unable to create your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-md rounded-lg bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-cyan-700">ConstructAi</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Start managing project data in one secure workspace.</p>
        </div>

        {apiError ? (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {apiError}
          </div>
        ) : null}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">Full name</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              name="name"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
              placeholder="Aarav Sharma"
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
              placeholder="you@example.com"
            />
            {errors.email ? <span className="mt-1 block text-sm text-red-600">{errors.email}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Password</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Minimum 8 characters"
            />
            {errors.password ? <span className="mt-1 block text-sm text-red-600">{errors.password}</span> : null}
          </label>

          <label className="block">
            <span className="text-sm font-medium text-slate-700">Confirm password</span>
            <input
              className="mt-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-950 outline-none transition focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Repeat your password"
            />
            {errors.confirmPassword ? (
              <span className="mt-1 block text-sm text-red-600">{errors.confirmPassword}</span>
            ) : null}
          </label>

          <button
            className="w-full rounded-lg bg-cyan-700 px-4 py-3 font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:bg-cyan-400"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Already have an account?{" "}
          <Link className="font-semibold text-cyan-700 hover:text-cyan-800" to="/">
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
};

export default Register;
