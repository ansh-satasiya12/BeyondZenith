import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { changePassword } from "../services/auth.service";
import {
    unlinkGitHub,
    connectCodeforces,
    unlinkCodeforces,
    connectLeetCode,
    unlinkLeetCode,
    getGitHubConnectUrl,
} from "../services/account.service";
import {
    Sun, Moon, Lock, Shield, CheckCircle2, AlertCircle,
    GitBranch, Code2, Code, Link2, Unlink, Loader2, X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Settings() {
    const { theme, setTheme } = useTheme();
    const { user, refreshUser } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [accountLoading, setAccountLoading] = useState("");
    const [accountError, setAccountError] = useState("");
    const [accountSuccess, setAccountSuccess] = useState("");
    const [confirmUnlink, setConfirmUnlink] = useState("");
    const [connectModalPlatform, setConnectModalPlatform] = useState("");
    const [connectInput, setConnectInput] = useState("");

    const isGitHubConnected = Boolean(user?.github?.id);
    const isCodeforcesConnected = Boolean(user?.codeforces?.handle);
    const isLeetCodeConnected = Boolean(user?.leetcode?.username);

    const handleConnect = async (platform) => {
        if (platform === "github") {
            try {
                const response = await api.get("/github/connect");

                window.location.href = response.data.authUrl;
            } catch (error) {
                console.error("GitHub connection failed:", error);
                setAccountError("Failed to connect GitHub");
            }

            return;
        }

        setConnectModalPlatform(platform);
        setConnectInput("");
        setAccountError("");
    };

    const handleConnectSubmit = async () => {
        if (!connectInput.trim()) {
            setAccountError(`Please enter your ${connectModalPlatform === "codeforces" ? "Codeforces handle" : "LeetCode username"}.`);
            return;
        }

        setAccountLoading(connectModalPlatform);
        setAccountError("");
        setAccountSuccess("");

        try {
            if (connectModalPlatform === "codeforces") {
                await connectCodeforces(connectInput.trim());
            } else {
                await connectLeetCode(connectInput.trim());
            }
            await refreshUser();
            setAccountSuccess(`${connectModalPlatform === "codeforces" ? "Codeforces" : "LeetCode"} connected successfully.`);
            setConnectModalPlatform("");
            setConnectInput("");
        } catch (err) {
            setAccountError(err.response?.data?.message || `Failed to connect. Please check the ${connectModalPlatform === "codeforces" ? "handle" : "username"} and try again.`);
        } finally {
            setAccountLoading("");
        }
    };

    const handleUnlink = async (platform) => {
        setAccountLoading(platform);
        setAccountError("");
        setAccountSuccess("");

        try {
            if (platform === "github") {
                await unlinkGitHub();
            } else if (platform === "codeforces") {
                await unlinkCodeforces();
            } else {
                await unlinkLeetCode();
            }
            await refreshUser();
            const name = platform === "github" ? "GitHub" : platform === "codeforces" ? "Codeforces" : "LeetCode";
            setAccountSuccess(`${name} account unlinked successfully.`);
            setConfirmUnlink("");
        } catch (err) {
            setAccountError(err.response?.data?.message || "Failed to unlink account. Please try again.");
            setConfirmUnlink("");
        } finally {
            setAccountLoading("");
        }
    };

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
                        <Link2 size={18} />
                    </div>
                    <div>
                        <h2 className="font-display text-lg font-semibold text-text-primary">
                            Connected Accounts
                        </h2>
                        <p className="font-body text-xs text-text-secondary sm:text-sm">
                            Link your developer platform profiles to BeyondZenith.
                        </p>
                    </div>
                </div>

                {accountError && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{accountError}</span>
                    </div>
                )}

                {accountSuccess && (
                    <div className="mt-4 flex items-center gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                        <CheckCircle2 size={16} className="shrink-0" />
                        <span>{accountSuccess}</span>
                    </div>
                )}

                <div className="mt-6 space-y-4">
                    {/* GitHub */}
                    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-emerald-400">
                                <GitBranch size={20} />
                            </div>
                            <div>
                                <p className="font-body text-sm font-semibold text-text-primary">GitHub</p>
                                {isGitHubConnected ? (
                                    <p className="font-mono text-xs text-emerald-400">
                                        Connected{user.github?.username ? ` — @${user.github.username}` : ""}
                                    </p>
                                ) : (
                                    <p className="font-body text-xs text-text-secondary">
                                        Track repositories, contributions, and open-source activity.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isGitHubConnected ? (
                                confirmUnlink === "github" ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleUnlink("github")}
                                            disabled={accountLoading === "github"}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            {accountLoading === "github" ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                                            <span>Confirm</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmUnlink("")}
                                            className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-bg-surface-raised"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setConfirmUnlink("github"); setAccountError(""); setAccountSuccess(""); }}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-red-500/30 hover:text-red-400"
                                    >
                                        <Unlink size={13} />
                                        <span>Unlink</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect("github")}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-brand-400"
                                >
                                    <Link2 size={13} />
                                    <span>Connect</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Codeforces */}
                    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-amber-400">
                                <Code2 size={20} />
                            </div>
                            <div>
                                <p className="font-body text-sm font-semibold text-text-primary">Codeforces</p>
                                {isCodeforcesConnected ? (
                                    <p className="font-mono text-xs text-amber-400">
                                        Connected — @{user.codeforces.handle}
                                    </p>
                                ) : (
                                    <p className="font-body text-xs text-text-secondary">
                                        Monitor ratings, contests, and competitive programming progress.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isCodeforcesConnected ? (
                                confirmUnlink === "codeforces" ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleUnlink("codeforces")}
                                            disabled={accountLoading === "codeforces"}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            {accountLoading === "codeforces" ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                                            <span>Confirm</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmUnlink("")}
                                            className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-bg-surface-raised"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setConfirmUnlink("codeforces"); setAccountError(""); setAccountSuccess(""); }}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-red-500/30 hover:text-red-400"
                                    >
                                        <Unlink size={13} />
                                        <span>Unlink</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect("codeforces")}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-brand-400"
                                >
                                    <Link2 size={13} />
                                    <span>Connect</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* LeetCode */}
                    <div className="flex flex-col gap-4 rounded-lg border border-border-subtle bg-bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-surface text-yellow-400">
                                <Code size={20} />
                            </div>
                            <div>
                                <p className="font-body text-sm font-semibold text-text-primary">LeetCode</p>
                                {isLeetCodeConnected ? (
                                    <p className="font-mono text-xs text-yellow-400">
                                        Connected — @{user.leetcode.username}
                                    </p>
                                ) : (
                                    <p className="font-body text-xs text-text-secondary">
                                        Track problems solved, difficulty breakdown, and contest rankings.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {isLeetCodeConnected ? (
                                confirmUnlink === "leetcode" ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleUnlink("leetcode")}
                                            disabled={accountLoading === "leetcode"}
                                            className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                                        >
                                            {accountLoading === "leetcode" ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
                                            <span>Confirm</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setConfirmUnlink("")}
                                            className="rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:bg-bg-surface-raised"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => { setConfirmUnlink("leetcode"); setAccountError(""); setAccountSuccess(""); }}
                                        className="inline-flex items-center gap-1.5 rounded-md border border-border-subtle px-3 py-1.5 text-xs font-medium text-text-secondary transition hover:border-red-500/30 hover:text-red-400"
                                    >
                                        <Unlink size={13} />
                                        <span>Unlink</span>
                                    </button>
                                )
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => handleConnect("leetcode")}
                                    className="inline-flex items-center gap-1.5 rounded-md bg-brand-500 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-brand-400"
                                >
                                    <Link2 size={13} />
                                    <span>Connect</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Connect Handle/Username Modal */}
            {connectModalPlatform && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-xl border border-border-subtle bg-bg-surface p-6 shadow-xl">
                        <div className="flex items-center justify-between border-b border-border-subtle pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle bg-bg-canvas text-brand-400">
                                    {connectModalPlatform === "codeforces" ? <Code2 size={18} /> : <Code size={18} />}
                                </div>
                                <h3 className="font-display text-lg font-bold text-text-primary">
                                    Connect {connectModalPlatform === "codeforces" ? "Codeforces" : "LeetCode"}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => { setConnectModalPlatform(""); setAccountError(""); }}
                                className="rounded-lg p-1 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary transition"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-5 space-y-4">
                            {accountError && (
                                <div className="flex items-center gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
                                    <AlertCircle size={15} className="shrink-0" />
                                    <span>{accountError}</span>
                                </div>
                            )}

                            <div>
                                <label
                                    htmlFor="connectInput"
                                    className="mb-2 block text-xs font-medium text-text-primary"
                                >
                                    {connectModalPlatform === "codeforces" ? "Codeforces Handle" : "LeetCode Username"}
                                </label>
                                <input
                                    id="connectInput"
                                    type="text"
                                    value={connectInput}
                                    onChange={(e) => setConnectInput(e.target.value)}
                                    placeholder={connectModalPlatform === "codeforces" ? "e.g. tourist" : "e.g. neal_wu"}
                                    className="w-full rounded-md border border-border-subtle bg-bg-canvas px-3 py-2.5 text-sm text-text-primary outline-none transition focus:border-brand-500"
                                    onKeyDown={(e) => { if (e.key === "Enter") handleConnectSubmit(); }}
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { setConnectModalPlatform(""); setAccountError(""); }}
                                    disabled={Boolean(accountLoading)}
                                    className="rounded-md border border-border-subtle px-4 py-2 text-xs font-medium text-text-secondary transition hover:bg-bg-surface-raised"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConnectSubmit}
                                    disabled={Boolean(accountLoading)}
                                    className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-4 py-2 text-xs font-medium text-white transition hover:bg-brand-400 disabled:opacity-50"
                                >
                                    {accountLoading ? (
                                        <>
                                            <Loader2 size={14} className="animate-spin" />
                                            <span>Connecting...</span>
                                        </>
                                    ) : (
                                        <span>Connect</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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