import { useEffect, useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

import githubService from "../services/github.service";

import GitHubProfile from "../components/github/GitHubProfile";
import GitHubStats from "../components/github/GitHubStats";
import GitHubAnalytics from "../components/github/GitHubAnalytics";
import GitHubRepositories from "../components/github/GitHubRepositories";

export default function GitHub() {
    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const result =
                await githubService.getDashboard();

            setData(result);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load GitHub."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboard();
    }, []);

    const syncEverything = async () => {
        try {
            setSyncing(true);
            setError("");

            await githubService.syncProfile();
            await githubService.syncRepositories();

            await loadDashboard();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to synchronize GitHub."
            );
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <GitHubLoading />;
    }

    if (error && !data) {
        return (
            <div className="mx-auto max-w-7xl p-6">
                <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
                    <p className="text-sm text-red-400">
                        {error}
                    </p>

                    <button
                        onClick={loadDashboard}
                        className="mt-4 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    if (!data?.profile?.id) {
        return (
            <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
                <div className="rounded-2xl border border-border-subtle bg-bg-surface p-8 text-center sm:p-12">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-raised">
                        <GitBranch
                            size={32}
                            className="text-text-primary"
                        />
                    </div>

                    <h1 className="mt-6 text-2xl font-bold text-text-primary">
                        Connect GitHub
                    </h1>

                    <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-text-secondary">
                        Connect your GitHub account to see your
                        repositories, profile statistics, languages
                        and development activity in BeyondZenith.
                    </p>

                    <Link
                        to="/settings"
                        className="mt-6 inline-flex rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-400"
                    >
                        Connect GitHub
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <GitBranch
                            size={28}
                            className="text-text-primary"
                        />

                        <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
                            GitHub
                        </h1>
                    </div>

                    <p className="mt-2 text-sm text-text-secondary">
                        Your GitHub profile, repositories and analytics.
                    </p>
                </div>

                <button
                    onClick={syncEverything}
                    disabled={syncing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        className={
                            syncing
                                ? "animate-spin"
                                : ""
                        }
                    />

                    {syncing
                        ? "Syncing..."
                        : "Sync GitHub"}
                </button>
            </header>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <GitHubProfile
                profile={data.profile}
                onSync={syncEverything}
                syncing={syncing}
            />

            <GitHubStats
                summary={data.summary}
                metrics={data.metrics}
            />

            <GitHubAnalytics
                summary={data.summary}
                metrics={data.metrics}
                languageDistribution={
                    data.languageDistribution || []
                }
            />

            <GitHubRepositories />
        </div>
    );
}

function GitHubLoading() {
    return (
        <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="h-10 w-40 animate-pulse rounded bg-bg-surface" />

            <div className="h-48 animate-pulse rounded-2xl bg-bg-surface" />

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {Array.from({ length: 6 }).map(
                    (_, index) => (
                        <div
                            key={index}
                            className="h-28 animate-pulse rounded-xl bg-bg-surface"
                        />
                    )
                )}
            </div>

            <div className="h-72 animate-pulse rounded-2xl bg-bg-surface" />

            <div className="h-80 animate-pulse rounded-2xl bg-bg-surface" />
        </div>
    );
}