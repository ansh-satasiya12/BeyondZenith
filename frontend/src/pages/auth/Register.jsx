import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            await register(formData);

            navigate("/login");
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-bg-canvas px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 text-center">
                    <h1 className="font-display text-3xl font-bold text-text-primary">
                        BeyondZenith
                    </h1>

                    <p className="mt-2 font-body text-sm text-text-secondary">
                        Create your developer account
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-border-subtle bg-bg-surface p-6"
                >
                    {error && (
                        <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-2 block text-sm font-medium text-text-primary"
                            >
                                Name
                            </label>

                            <input
                                id="name"
                                name="name"
                                type="text"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-text-primary outline-none transition focus:border-brand-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="mb-2 block text-sm font-medium text-text-primary"
                            >
                                Email
                            </label>

                            <input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-text-primary outline-none transition focus:border-brand-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="mb-2 block text-sm font-medium text-text-primary"
                            >
                                Password
                            </label>

                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={8}
                                className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-text-primary outline-none transition focus:border-brand-500"
                            />

                            <p className="mt-1.5 text-xs text-text-secondary">
                                Minimum 8 characters
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-brand-500 px-4 py-2.5 font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? "Creating account..." : "Create account"}
                        </button>

                        <p className="text-center text-sm text-text-secondary">
                            Already have an account?{" "}
                            <Link
                                to="/login"
                                className="text-brand-500 hover:text-brand-400"
                            >
                                Sign in
                            </Link>
                        </p>
                        <p className="mt-2 text-center text-xs text-text-secondary">
                            Want to know about us more?{" "}
                            <Link
                                to="/"
                                className="text-brand-500 hover:text-brand-400"
                            >
                                Back to home
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </main>
    );
}

export default Register;