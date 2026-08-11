import { useEffect, useState } from "react";
import {
    X,
    ExternalLink,
    Star,
    GitFork,
    Eye,
    Sparkles,
} from "lucide-react";

import githubService from "../../services/github.service";

export default function RepositoryDetailsModal({
    repository,
    onClose,
}) {
    const [details, setDetails] = useState(repository);
    const [loading, setLoading] = useState(true);
    const [enhancing, setEnhancing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);

                const data =
                    await githubService.getRepository(
                        repository._id
                    );

                setDetails(data);
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    "Failed to load repository details."
                );
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [repository._id]);

    const enhance = async () => {
        try {
            setEnhancing(true);
            setError("");

            const updated =
                await githubService.enhanceRepository(
                    repository._id
                );

            setDetails(updated);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to enhance repository."
            );
        } finally {
            setEnhancing(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={onClose}
        >
            <div
                onMouseDown={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface shadow-2xl"
            >
                <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-text-primary">
                            {details.name}
                        </h2>

                        <p className="text-xs text-text-secondary">
                            Repository details
                        </p>
                    </div>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-text-secondary hover:bg-bg-surface-raised hover:text-text-primary"
                    >
                        <X size={19} />
                    </button>
                </div>

                <div className="max-h-[calc(90vh-73px)] overflow-y-auto p-5">
                    {loading ? (
                        <div className="space-y-4">
                            <div className="h-8 animate-pulse rounded bg-bg-surface-raised" />
                            <div className="h-32 animate-pulse rounded bg-bg-surface-raised" />
                            <div className="h-40 animate-pulse rounded bg-bg-surface-raised" />
                        </div>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                                    {error}
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2">
                                {details.htmlUrl && (
                                    <a
                                        href={details.htmlUrl}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-3 py-2 text-sm text-text-primary hover:bg-bg-surface-raised"
                                    >
                                        Open GitHub
                                        <ExternalLink size={14} />
                                    </a>
                                )}

                                <button
                                    onClick={enhance}
                                    disabled={enhancing}
                                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-60"
                                >
                                    <Sparkles size={14} />

                                    {enhancing
                                        ? "Enhancing..."
                                        : "Enhance"}
                                </button>
                            </div>

                            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <Metric
                                    icon={Star}
                                    label="Stars"
                                    value={details.stars}
                                />

                                <Metric
                                    icon={GitFork}
                                    label="Forks"
                                    value={details.forks}
                                />

                                <Metric
                                    icon={Eye}
                                    label="Watchers"
                                    value={details.watchers}
                                />

                                <Metric
                                    label="Language"
                                    value={
                                        details.language ||
                                        "Unknown"
                                    }
                                />
                            </div>

                            <div className="mt-6 grid gap-5 sm:grid-cols-2">
                                <Info
                                    label="Visibility"
                                    value={details.visibility}
                                />

                                <Info
                                    label="Default branch"
                                    value={
                                        details.defaultBranch ||
                                        "—"
                                    }
                                />

                                <Info
                                    label="Fork"
                                    value={
                                        details.isFork
                                            ? "Yes"
                                            : "No"
                                    }
                                />

                                <Info
                                    label="Archived"
                                    value={
                                        details.isArchived
                                            ? "Yes"
                                            : "No"
                                    }
                                />
                            </div>

                            {details.topics?.length > 0 && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-text-primary">
                                        Topics
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {details.topics.map(
                                            (topic) => (
                                                <span
                                                    key={topic}
                                                    className="rounded-full bg-bg-surface-raised px-3 py-1 text-xs text-text-secondary"
                                                >
                                                    {topic}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                            {details.languageBreakdown &&
                                Object.keys(details.languageBreakdown).length > 0 && (
                                    <div className="mt-6">
                                        <h3 className="font-medium text-text-primary">
                                            Language Breakdown
                                        </h3>

                                        <div className="mt-3 space-y-2">
                                            {Object.entries(
                                                details.languageBreakdown
                                            ).map(
                                                ([
                                                    language,
                                                    value,
                                                ]) => (
                                                    <div
                                                        key={language}
                                                        className="flex justify-between text-sm"
                                                    >
                                                        <span className="text-text-primary">
                                                            {
                                                                language
                                                            }
                                                        </span>

                                                        <span className="text-text-secondary">
                                                            {
                                                                value
                                                            }
                                                        </span>
                                                    </div>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}

                            {details.latestCommitSha && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-text-primary">
                                        Latest Commit
                                    </h3>

                                    <p className="mt-2 break-all rounded-lg bg-bg-surface-raised p-3 font-mono text-xs text-text-secondary">
                                        {
                                            details.latestCommitSha
                                        }
                                    </p>
                                </div>
                            )}

                            {details.readme && (
                                <div className="mt-6">
                                    <h3 className="font-medium text-text-primary">
                                        README
                                    </h3>

                                    <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap rounded-lg bg-bg-surface-raised p-4 text-xs leading-6 text-text-secondary">
                                        {details.readme}
                                    </pre>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-lg border border-border-subtle p-3">
            <div className="flex items-center gap-2 text-text-secondary">
                {Icon && <Icon size={14} />}
                <span className="text-xs">{label}</span>
            </div>

            <p className="mt-1 font-semibold text-text-primary">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value || "0"}
            </p>
        </div>
    );
}

function Info({ label, value }) {
    return (
        <div className="rounded-lg border border-border-subtle p-3">
            <p className="text-xs text-text-secondary">
                {label}
            </p>

            <p className="mt-1 text-sm capitalize text-text-primary">
                {value || "—"}
            </p>
        </div>
    );
}