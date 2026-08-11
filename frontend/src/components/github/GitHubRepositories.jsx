import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

import githubService from "../../services/github.service";
import RepositoryFilters from "./RepositoryFilters";
import RepositoryCard from "./RepositoryCard";
import RepositoryDetailsModal from "./RepositoryDetailsModal";

export default function GitHubRepositories() {
    const [repositories, setRepositories] = useState([]);
    const [pagination, setPagination] = useState(null);

    const [search, setSearch] = useState("");
    const [language, setLanguage] = useState("");
    const [visibility, setVisibility] = useState("");
    const [sortBy, setSortBy] =
        useState("updatedAtGithub");
    const [order, setOrder] = useState("desc");

    const [page, setPage] = useState(1);

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");

    const [selectedRepository, setSelectedRepository] =
        useState(null);

    const loadRepositories = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await githubService.getRepositories({
                    page,
                    limit: 10,
                    search: search || undefined,
                    language: language || undefined,
                    visibility:
                        visibility || undefined,
                    sortBy,
                    order,
                });

            setRepositories(data?.repositories || []);
            setPagination(data?.pagination || null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load repositories."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeout = setTimeout(
            loadRepositories,
            search ? 350 : 0
        );

        return () => clearTimeout(timeout);
    }, [
        page,
        search,
        language,
        visibility,
        sortBy,
        order,
    ]);

    const handleFilterChange = (key, value) => {
        setPage(1);

        if (key === "search") {
            setSearch(value);
        }

        if (key === "language") {
            setLanguage(value);
        }

        if (key === "visibility") {
            setVisibility(value);
        }

        if (key === "sort") {
            setSortBy(value.sortBy);
            setOrder(value.order);
        }
    };

    const syncRepositories = async () => {
        try {
            setSyncing(true);
            setError("");

            await githubService.syncRepositories();

            setPage(1);
            await loadRepositories();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to synchronize repositories."
            );
        } finally {
            setSyncing(false);
        }
    };

    return (
        <section className="space-y-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Repositories
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Search, filter and explore your repositories.
                    </p>
                </div>

                <button
                    onClick={syncRepositories}
                    disabled={syncing}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-raised disabled:opacity-60"
                >
                    <RefreshCw
                        size={15}
                        className={
                            syncing ? "animate-spin" : ""
                        }
                    />

                    {syncing
                        ? "Syncing..."
                        : "Sync Repositories"}
                </button>
            </div>

            <RepositoryFilters
                search={search}
                language={language}
                visibility={visibility}
                sortBy={sortBy}
                order={order}
                onChange={handleFilterChange}
            />

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {Array.from({ length: 6 }).map(
                        (_, index) => (
                            <div
                                key={index}
                                className="h-36 animate-pulse rounded-xl bg-bg-surface"
                            />
                        )
                    )}
                </div>
            ) : repositories.length === 0 ? (
                <div className="rounded-xl border border-border-subtle bg-bg-surface p-10 text-center">
                    <p className="font-medium text-text-primary">
                        No repositories found
                    </p>

                    <p className="mt-1 text-sm text-text-secondary">
                        Try changing your filters or sync GitHub.
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2">
                    {repositories.map((repository) => (
                        <RepositoryCard
                            key={repository._id}
                            repository={repository}
                            onClick={() =>
                                setSelectedRepository(
                                    repository
                                )
                            }
                        />
                    ))}
                </div>
            )}

            {pagination &&
                pagination.totalPages > 1 && (
                    <Pagination
                        page={pagination.page}
                        totalPages={pagination.totalPages}
                        onChange={setPage}
                    />
                )}

            {selectedRepository && (
                <RepositoryDetailsModal
                    repository={selectedRepository}
                    onClose={() =>
                        setSelectedRepository(null)
                    }
                />
            )}
        </section>
    );
}

function Pagination({
    page,
    totalPages,
    onChange,
}) {
    return (
        <div className="flex items-center justify-between border-t border-border-subtle pt-4">
            <span className="text-sm text-text-secondary">
                Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
                <button
                    disabled={page === 1}
                    onClick={() => onChange(page - 1)}
                    className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-primary disabled:opacity-40"
                >
                    Previous
                </button>

                <button
                    disabled={page === totalPages}
                    onClick={() => onChange(page + 1)}
                    className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-primary disabled:opacity-40"
                >
                    Next
                </button>
            </div>
        </div>
    );
}