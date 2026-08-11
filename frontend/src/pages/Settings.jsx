import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { changePassword } from "../services/auth.service";
import { Sun, Moon, Lock, Shield, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
    const { theme, setTheme } = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmitPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccessMessage("");

        if (!formData.currentPassword || !formData.newPassword) {
            setError("Both current and new passwords are required.");
            return;
        }

        if (formData.currentPassword.length < 8) {
            setError("Current password must be at least 8 characters.");
            return;
        }

        if (formData.newPassword.length < 8) {
            setError("New password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        try {
            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setSuccessMessage(
                response?.message || "Password changed successfully. Please sign in again with your new password."
            );
            setFormData({
                currentPassword: "",
                newPassword: "",
            });
            setTimeout(() => {
                window.location.href = "/login";
            }, 1000);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to change password. Please try again."
            );
            setFormData({
                currentPassword: "",
                newPassword: "",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
            <div>
                <h1 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                    Settings
                </h1>
                <p className="mt-1 font-body text-sm text-text-secondary">
                    Manage your application preferences and security settings.
                </p>
            </div>

            <section className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-canvas text-brand-400">
                        {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary">
                            Appearance
                        </h2>
                        <p className="font-body text-xs text-text-secondary sm:text-sm">
                            Select your preferred visual theme for BeyondZenith.
                        </p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <button
                        type="button"
                        onClick={() => setTheme("dark")}
                        className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${theme === "dark"
                            ? "border-brand-500 bg-bg-surface-raised ring-1 ring-brand-500"
                            : "border-border-subtle bg-bg-canvas hover:border-brand-500/40"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Moon size={20} className={theme === "dark" ? "text-brand-400" : "text-text-secondary"} />
                            <div>
                                <p className="font-body text-sm font-medium text-text-primary">Dark Mode</p>
                                <p className="font-body text-xs text-text-secondary">Default dark developer interface</p>
                            </div>
                        </div>
                        {theme === "dark" && <CheckCircle2 size={18} className="text-brand-400" />}
                    </button>

                    <button
                        type="button"
                        onClick={() => setTheme("light")}
                        className={`flex items-center justify-between rounded-lg border p-4 text-left transition ${theme === "light"
                            ? "border-brand-500 bg-bg-surface-raised ring-1 ring-brand-500"
                            : "border-border-subtle bg-bg-canvas hover:border-brand-500/40"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <Sun size={20} className={theme === "light" ? "text-brand-400" : "text-text-secondary"} />
                            <div>
                                <p className="font-body text-sm font-medium text-text-primary">Light Mode</p>
                                <p className="font-body text-xs text-text-secondary">Clean high-contrast theme</p>
                            </div>
                        </div>
                        {theme === "light" && <CheckCircle2 size={18} className="text-brand-400" />}
                    </button>
                </div>
            </section>

            <section className="rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-canvas text-brand-400">
                        <Shield size={18} />
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary">
                            Security
                        </h2>
                        <p className="font-body text-xs text-text-secondary sm:text-sm">
                            Update your account password.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmitPassword} className="mt-6 space-y-5 max-w-md">
                    {error && (
                        <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                            <CheckCircle2 size={16} className="shrink-0" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="mb-2 block text-sm font-medium text-text-primary"
                        >
                            Current Password
                        </label>
                        <div className="relative">
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-text-primary outline-none transition focus:border-brand-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-2 block text-sm font-medium text-text-primary"
                        >
                            New Password
                        </label>
                        <div className="relative">
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                value={formData.newPassword}
                                onChange={handleChange}
                                required
                                minLength={8}
                                placeholder="••••••••"
                                className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-text-primary outline-none transition focus:border-brand-500"
                            />
                        </div>
                        <p className="mt-1.5 text-xs text-text-secondary">
                            Must be at least 8 characters long.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-5 py-2.5 font-body text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-bg-canvas"
                    >
                        <Lock size={16} />
                        <span>{loading ? "Changing Password..." : "Change Password"}</span>
                    </button>
                </form>
            </section>
        </div>
    );
}

export default Settings;