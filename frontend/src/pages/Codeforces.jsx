import { useEffect, useState } from "react";
import {
    Code2,
    RefreshCw,
    Unlink,
    Trophy,
    Target,
    Activity,
    TrendingUp,
    X,
    ExternalLink,
} from "lucide-react";

import codeforcesService from "../services/codeforces.service";
import { useAuth } from "../context/AuthContext";

export default function Codeforces() {
    const { user, refreshUser } = useAuth();
    const connected = Boolean(user?.codeforces?.handle);

    const [dashboard, setDashboard] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const [submissions, setSubmissions] = useState([]);
    const [contests, setContests] = useState([]);
    const [allContests, setAllContests] = useState([]);
    const [allSubmissions, setAllSubmissions] = useState([]);

    const [handle, setHandle] = useState("");

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [unlinking, setUnlinking] = useState(false);
    const [loadingAllContests, setLoadingAllContests] = useState(false);
    const [loadingAllSubmissions, setLoadingAllSubmissions] =
        useState(false);

    const [error, setError] = useState("");

    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [selectedContest, setSelectedContest] = useState(null);

    const [showAllContests, setShowAllContests] = useState(false);
    const [showAllSubmissions, setShowAllSubmissions] = useState(false);
    const [showAllRatingHistory, setShowAllRatingHistory] =
        useState(false);

    useEffect(() => {
        if (connected) {
            loadDashboard();
        } else {
            setDashboard(null);
            setAnalytics(null);
            setSubmissions([]);
            setContests([]);
            setAllContests([]);
            setAllSubmissions([]);
            setError("");
            setLoading(false);
        }
    }, [user?.codeforces?.handle]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await codeforcesService.getDashboard();

            setDashboard(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load Codeforces data."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const data = await codeforcesService.getAnalytics();
            setAnalytics(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load analytics."
            );
        }
    };

    const loadSubmissions = async () => {
        try {
            const result = await codeforcesService.getSubmissions({
                page: 1,
                limit: 10,
            });

            setSubmissions(result?.data || result?.submissions || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load submissions."
            );
        }
    };

    const loadAllSubmissions = async () => {
        try {
            setLoadingAllSubmissions(true);
            setError("");

            const firstResult =
                await codeforcesService.getSubmissions({
                    page: 1,
                    limit: 100,
                });

            const firstSubmissions =
                firstResult?.data ||
                firstResult?.submissions ||
                [];

            const totalPages =
                firstResult?.pagination?.totalPages || 1;

            let completeSubmissions = [...firstSubmissions];

            if (totalPages > 1) {
                const requests = [];

                for (let page = 2; page <= totalPages; page++) {
                    requests.push(
                        codeforcesService.getSubmissions({
                            page,
                            limit: 100,
                        })
                    );
                }

                const results = await Promise.all(requests);

                results.forEach((result) => {
                    const pageSubmissions =
                        result?.data ||
                        result?.submissions ||
                        [];

                    completeSubmissions.push(...pageSubmissions);
                });
            }

            setAllSubmissions(completeSubmissions);
            setShowAllSubmissions(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load submission history."
            );
        } finally {
            setLoadingAllSubmissions(false);
        }
    };

    const loadContests = async () => {
        try {
            const result = await codeforcesService.getContests({
                page: 1,
                limit: 15,
                sortBy: "contestTime",
                order: "desc",
            });

            setContests(result?.data || result?.contests || []);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load contests."
            );
        }
    };

    const loadAllContests = async () => {
        try {
            setLoadingAllContests(true);
            setError("");

            const firstResult =
                await codeforcesService.getContests({
                    page: 1,
                    limit: 100,
                    sortBy: "contestTime",
                    order: "desc",
                });

            const firstContests =
                firstResult?.data ||
                firstResult?.contests ||
                [];

            const totalPages =
                firstResult?.pagination?.totalPages || 1;

            let completeContests = [...firstContests];

            if (totalPages > 1) {
                const requests = [];

                for (let page = 2; page <= totalPages; page++) {
                    requests.push(
                        codeforcesService.getContests({
                            page,
                            limit: 100,
                            sortBy: "contestTime",
                            order: "desc",
                        })
                    );
                }

                const results = await Promise.all(requests);

                results.forEach((result) => {
                    const pageContests =
                        result?.data ||
                        result?.contests ||
                        [];

                    completeContests.push(...pageContests);
                });
            }

            setAllContests(completeContests);
            setShowAllContests(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load contest history."
            );
        } finally {
            setLoadingAllContests(false);
        }
    };

    useEffect(() => {
        if (!loading && connected) {
            loadAnalytics();
            loadSubmissions();
            loadContests();
        }
    }, [loading, connected]);

    const connect = async (e) => {
        e.preventDefault();

        if (!handle.trim()) return;

        try {
            setConnecting(true);
            setLoading(true);
            setError("");

            await codeforcesService.connect(handle.trim());

            await codeforcesService.sync();

            const dashboardData = await codeforcesService.getDashboard();
            setDashboard(dashboardData);

            const analyticsData = await codeforcesService.getAnalytics();
            setAnalytics(analyticsData);

            await loadSubmissions();
            await loadContests();

            await refreshUser();

            setHandle("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to connect Codeforces."
            );
        } finally {
            setConnecting(false);
            setLoading(false);
        }
    };

    const sync = async () => {
        try {
            setSyncing(true);
            setError("");

            await codeforcesService.sync();

            await loadDashboard();
            await loadAnalytics();
            await loadSubmissions();
            await loadContests();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to sync Codeforces data."
            );
        } finally {
            setSyncing(false);
        }
    };

    const unlink = async () => {
        const confirmed = window.confirm(
            "Unlink your Codeforces account? Your synced Codeforces data will also be removed."
        );

        if (!confirmed) return;

        try {
            setUnlinking(true);
            setError("");

            await codeforcesService.unlink();
            await refreshUser();

            setDashboard(null);
            setAnalytics(null);
            setSubmissions([]);
            setContests([]);
            setAllContests([]);
            setAllSubmissions([]);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to unlink Codeforces."
            );
        } finally {
            setUnlinking(false);
        }
    };

    const openSubmission = async (id) => {
        try {
            const data =
                await codeforcesService.getSubmission(id);

            setSelectedSubmission(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load submission."
            );
        }
    };

    const openContest = async (id) => {
        try {
            const data =
                await codeforcesService.getContest(id);

            setSelectedContest(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load contest."
            );
        }
    };

    const openCodeforcesProfile = () => {
        const username = dashboard?.profile?.username;

        if (!username) return;

        window.open(
            `https://codeforces.com/profile/${encodeURIComponent(username)}`,
            "_blank",
            "noopener,noreferrer"
        );
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-bg-surface-raised" />

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((item) => (
                        <div
                            key={item}
                            className="h-28 animate-pulse rounded-xl bg-bg-surface-raised"
                        />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Code2 size={26} />

                        <h1 className="text-2xl font-bold text-text-primary">
                            Codeforces
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                        Track your competitive programming
                        progress.
                    </p>
                </div>

                {connected && dashboard?.profile && (
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={`https://codeforces.com/profile/${encodeURIComponent(
                                dashboard.profile?.handle || user?.codeforces?.handle || ""
                            )}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-bg-surface-raised cursor-pointer"
                        >
                            <ExternalLink size={15} />
                            CF Profile
                        </a>
                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-bg-surface-raised disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    syncing ? "animate-spin" : ""
                                }
                            />

                            {syncing ? "Syncing..." : "Sync"}
                        </button>

                        <button
                            onClick={unlink}
                            disabled={unlinking}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Unlink size={15} />
                            Unlink
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {!connected && (
                <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
                    <div className="flex items-center gap-3">
                        <Target size={22} />

                        <div>
                            <h2 className="font-semibold text-text-primary">
                                Connect Codeforces
                            </h2>

                            <p className="text-sm text-text-secondary">
                                Enter your Codeforces handle to
                                connect your account.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={connect}
                        className="mt-5 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            value={handle}
                            onChange={(e) =>
                                setHandle(e.target.value)
                            }
                            placeholder="Codeforces handle"
                            className="flex-1 rounded-lg border border-border-subtle bg-bg-surface-raised px-3 py-2 text-sm outline-none"
                        />

                        <button
                            disabled={connecting}
                            className="rounded-lg bg-brand-500 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
                        >
                            {connecting
                                ? "Connecting..."
                                : "Connect"}
                        </button>
                    </form>
                </div>
            )}

            {connected && dashboard && (
                <>
                    {/* PROFILE */}
                    <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
                        <div className="flex flex-wrap items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                {dashboard.profile?.avatar ? (
                                    <img
                                        src={
                                            dashboard.profile?.avatar
                                        }
                                        alt=""
                                        className="h-16 w-16 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-raised text-xl font-bold">
                                        {dashboard.profile?.handle?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-xl font-semibold text-text-primary">
                                        {dashboard.profile?.handle}
                                    </h2>

                                    <p className="text-sm text-text-secondary">
                                        {dashboard.profile?.rank ||
                                            "Unrated"}
                                    </p>

                                    {dashboard.profile?.organization && (
                                        <p className="mt-1 text-xs text-text-secondary">
                                            {
                                                dashboard.profile
                                                    ?.organization
                                            }
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* RATING MOVED HERE */}
                            <div className="rounded-xl border border-border-subtle bg-bg-surface-raised px-5 py-4">
                                <div className="mt-1 flex items-end gap-3">
                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {
                                                dashboard.overview
                                                    .currentRating
                                            }
                                        </p>

                                        <p className="text-xs text-text-secondary">
                                            Current
                                        </p>
                                    </div>

                                    <div className="mb-1 h-8 w-px bg-border-subtle" />

                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {
                                                dashboard.overview
                                                    .maxRating
                                            }
                                        </p>

                                        <p className="text-xs text-text-secondary pl-2">
                                            Max
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* OVERVIEW */}
                    <section>
                        <h2 className="mb-3 font-semibold text-text-primary">
                            Overview
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Stat
                                icon={Target}
                                label="Solved"
                                value={
                                    dashboard.overview
                                        .totalSolved
                                }
                            />

                            <Stat
                                icon={Activity}
                                label="Submissions"
                                value={
                                    dashboard.overview
                                        .totalSubmissions
                                }
                            />

                            <Stat
                                icon={Trophy}
                                label="Contests"
                                value={
                                    dashboard.overview
                                        .totalContests
                                }
                            />

                            <Stat
                                label="Best Rank"
                                value={
                                    dashboard.overview?.bestRank ||
                                    "—"
                                }
                            />
                        </div>
                    </section>

                    {/* ANALYTICS */}
                    {analytics && (
                        <AnalyticsSection
                            analytics={analytics}
                            onShowAllRatingHistory={() =>
                                setShowAllRatingHistory(true)
                            }
                        />
                    )}

                    {/* RECENT SUBMISSIONS */}
                    <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-text-primary">
                                    Recent Submissions
                                </h2>

                                <p className="mt-1 text-xs text-text-secondary">
                                    Your latest 10 Codeforces
                                    submissions.
                                </p>
                            </div>

                            {(dashboard.overview
                                ?.totalSubmissions ?? 0) > 10 && (
                                    <button
                                        onClick={loadAllSubmissions}
                                        disabled={
                                            loadingAllSubmissions
                                        }
                                        className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-surface-raised disabled:opacity-50"
                                    >
                                        {loadingAllSubmissions
                                            ? "Loading..."
                                            : "View All Submissions"}
                                    </button>
                                )}
                        </div>

                        <div className="space-y-2">
                            {submissions.length === 0 ? (
                                <p className="text-sm text-text-secondary">
                                    No submissions found.
                                </p>
                            ) : (
                                submissions.map((submission) => (
                                    <button
                                        key={submission._id}
                                        onClick={() =>
                                            openSubmission(
                                                submission._id
                                            )
                                        }
                                        className="flex w-full items-center justify-between rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-surface-raised"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-text-primary">
                                                {submission.problemName ||
                                                    "Unknown problem"}
                                            </p>

                                            <p className="mt-1 text-xs text-text-secondary">
                                                {submission.language ||
                                                    submission.programmingLanguage ||
                                                    "Unknown"}
                                            </p>
                                        </div>

                                        <span
                                            className={`text-xs font-medium ${submission.verdict ===
                                                "OK"
                                                ? "text-green-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {submission.verdict}
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>

                    {/* RECENT CONTESTS */}
                    <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-text-primary">
                                    Recent Contests
                                </h2>

                                <p className="mt-1 text-xs text-text-secondary">
                                    Showing your latest 15 contests.
                                </p>
                            </div>

                            {(dashboard.overview?.totalContests ?? 0) >
                                15 && (
                                    <button
                                        onClick={loadAllContests}
                                        disabled={
                                            loadingAllContests
                                        }
                                        className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-surface-raised disabled:opacity-50"
                                    >
                                        {loadingAllContests
                                            ? "Loading..."
                                            : "View All History"}
                                    </button>
                                )}
                        </div>

                        <div className="space-y-2">
                            {contests.length === 0 ? (
                                <p className="text-sm text-text-secondary">
                                    No contests found.
                                </p>
                            ) : (
                                contests.map((contest) => (
                                    <button
                                        key={contest._id}
                                        onClick={() =>
                                            openContest(
                                                contest._id
                                            )
                                        }
                                        className="flex w-full items-center justify-between rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-surface-raised"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-text-primary">
                                                {
                                                    contest.contestName
                                                }
                                            </p>

                                            <p className="mt-1 text-xs text-text-secondary">
                                                Rank:{" "}
                                                {contest.rank ??
                                                    "—"}{" "}
                                                • Solved:{" "}
                                                {contest
                                                    .solvedProblems
                                                    ?.length || 0}
                                            </p>
                                        </div>

                                        <span
                                            className={`ml-4 text-sm font-medium ${contest.ratingChange >=
                                                0
                                                ? "text-green-400"
                                                : "text-red-400"
                                                }`}
                                        >
                                            {contest.ratingChange >
                                                0
                                                ? "+"
                                                : ""}
                                            {
                                                contest.ratingChange
                                            }
                                        </span>
                                    </button>
                                ))
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* SUBMISSION MODAL */}
            {selectedSubmission && (
                <DetailsModal
                    title={
                        selectedSubmission.problemName ||
                        "Submission"
                    }
                    onClose={() =>
                        setSelectedSubmission(null)
                    }
                >
                    <Detail
                        label="Verdict"
                        value={selectedSubmission.verdict}
                    />

                    <Detail
                        label="Language"
                        value={
                            selectedSubmission.programmingLanguage ||
                            selectedSubmission.language
                        }
                    />

                    <Detail
                        label="Rating"
                        value={
                            selectedSubmission.rating || "—"
                        }
                    />

                    <Detail
                        label="Time"
                        value={
                            selectedSubmission
                                .timeConsumedMillis != null
                                ? `${selectedSubmission.timeConsumedMillis} ms`
                                : "—"
                        }
                    />

                    <Detail
                        label="Memory"
                        value={
                            selectedSubmission
                                .memoryConsumedBytes != null
                                ? `${selectedSubmission.memoryConsumedBytes} bytes`
                                : "—"
                        }
                    />

                    <Detail
                        label="Passed tests"
                        value={
                            selectedSubmission.passedTestCount
                        }
                    />

                    {selectedSubmission.tags?.length > 0 && (
                        <Detail
                            label="Tags"
                            value={selectedSubmission.tags.join(
                                ", "
                            )}
                        />
                    )}
                </DetailsModal>
            )}

            {/* CONTEST MODAL */}
            {selectedContest && (
                <DetailsModal
                    title={selectedContest.contestName}
                    onClose={() =>
                        setSelectedContest(null)
                    }
                >
                    <Detail
                        label="Rank"
                        value={selectedContest.rank}
                    />

                    <Detail
                        label="Old rating"
                        value={selectedContest.oldRating}
                    />

                    <Detail
                        label="New rating"
                        value={selectedContest.newRating}
                    />

                    <Detail
                        label="Rating change"
                        value={selectedContest.ratingChange}
                    />

                    <Detail
                        label="Solved"
                        value={
                            selectedContest.solvedProblems
                                ?.length || 0
                        }
                    />

                    <Detail
                        label="Attempted"
                        value={
                            selectedContest.attemptedProblems
                                ?.length || 0
                        }
                    />

                    {selectedContest.solvedProblems?.length >
                        0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs text-text-secondary">
                                    Solved Problems
                                </p>

                                <div className="space-y-1">
                                    {selectedContest.solvedProblems.map(
                                        (problem) => (
                                            <div
                                                key={problem.index}
                                                className="rounded-lg bg-bg-surface-raised p-2 text-sm"
                                            >
                                                {problem.index}.{" "}
                                                {problem.name}
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                </DetailsModal>
            )}

            {/* ALL SUBMISSIONS */}
            {showAllSubmissions && (
                <DetailsModal
                    title="Complete Submission History"
                    onClose={() =>
                        setShowAllSubmissions(false)
                    }
                >
                    <div className="space-y-2">
                        {allSubmissions.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                                No submission history found.
                            </p>
                        ) : (
                            allSubmissions.map((submission) => (
                                <button
                                    key={submission._id}
                                    onClick={() =>
                                        openSubmission(
                                            submission._id
                                        )
                                    }
                                    className="flex w-full items-center justify-between rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-surface-raised"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-text-primary">
                                            {submission.problemName ||
                                                "Unknown problem"}
                                        </p>

                                        <p className="mt-1 text-xs text-text-secondary">
                                            {submission.language ||
                                                submission.programmingLanguage ||
                                                "Unknown"}
                                        </p>
                                    </div>

                                    <span
                                        className={`ml-4 text-xs font-medium ${submission.verdict ===
                                            "OK"
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {submission.verdict}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </DetailsModal>
            )}

            {/* ALL CONTESTS */}
            {showAllContests && (
                <DetailsModal
                    title="Complete Contest History"
                    onClose={() =>
                        setShowAllContests(false)
                    }
                >
                    <div className="space-y-2">
                        {allContests.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                                No contest history found.
                            </p>
                        ) : (
                            allContests.map((contest) => (
                                <button
                                    key={contest._id}
                                    onClick={() =>
                                        openContest(
                                            contest._id
                                        )
                                    }
                                    className="flex w-full items-center justify-between rounded-lg border border-border-subtle p-3 text-left hover:bg-bg-surface-raised"
                                >
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium text-text-primary">
                                            {
                                                contest.contestName
                                            }
                                        </p>

                                        <p className="mt-1 text-xs text-text-secondary">
                                            {contest.contestTime
                                                ? new Date(
                                                    contest.contestTime
                                                ).toLocaleDateString()
                                                : "—"}{" "}
                                            • Rank:{" "}
                                            {contest.rank ?? "—"}
                                        </p>
                                    </div>

                                    <span
                                        className={`ml-4 text-sm font-medium ${contest.ratingChange >=
                                            0
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {contest.ratingChange > 0
                                            ? "+"
                                            : ""}
                                        {
                                            contest.ratingChange
                                        }
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                </DetailsModal>
            )}

            {/* ALL RATING HISTORY */}
            {showAllRatingHistory && (
                <DetailsModal
                    title="Complete Rating History"
                    onClose={() =>
                        setShowAllRatingHistory(false)
                    }
                >
                    <div className="space-y-2">
                        {analytics?.contests?.ratingHistory
                            ?.length === 0 ? (
                            <p className="text-sm text-text-secondary">
                                No rating history found.
                            </p>
                        ) : (
                            [
                                ...(analytics?.contests
                                    ?.ratingHistory || []),
                            ]
                                .reverse()
                                .map((item, index) => (
                                    <div
                                        key={`${item.contestTime}-${index}`}
                                        className="flex items-center justify-between rounded-lg border border-border-subtle p-3"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-medium text-text-primary">
                                                {item.contestName ||
                                                    "Codeforces Contest"}
                                            </p>

                                            <p className="mt-1 text-xs text-text-secondary">
                                                {item.contestTime
                                                    ? new Date(
                                                        item.contestTime
                                                    ).toLocaleDateString()
                                                    : "—"}
                                            </p>
                                        </div>

                                        <div className="ml-4 text-right">
                                            <p
                                                className={`text-sm font-medium ${item.newRating >=
                                                    item.oldRating
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {item.oldRating}{" "}
                                                →{" "}
                                                {item.newRating}
                                            </p>

                                            <p
                                                className={`text-xs ${item.newRating >=
                                                    item.oldRating
                                                    ? "text-green-400"
                                                    : "text-red-400"
                                                    }`}
                                            >
                                                {item.newRating -
                                                    item.oldRating >=
                                                    0
                                                    ? "+"
                                                    : ""}
                                                {item.newRating -
                                                    item.oldRating}
                                            </p>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </DetailsModal>
            )}
        </div>
    );
}

function Stat({ icon: Icon, label, value }) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-secondary">
                {Icon && <Icon size={15} />}
                <span className="text-xs">{label}</span>
            </div>

            <p className="mt-2 text-xl font-bold text-text-primary">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value}
            </p>
        </div>
    );
}

function AnalyticsSection({
    analytics,
    onShowAllRatingHistory,
}) {
    const submissions = analytics.submissions;
    const contests = analytics.contests;

    return (
        <section className="space-y-4">
            <h2 className="font-semibold text-text-primary">
                Analytics
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <AnalyticsCard title="Verdicts">
                    {submissions.verdictDistribution?.map(
                        (item) => (
                            <Row
                                key={item.verdict}
                                label={item.verdict}
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>

                <AnalyticsCard title="Languages">
                    {submissions.languageDistribution?.map(
                        (item) => (
                            <Row
                                key={item.language}
                                label={item.language}
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>

                <AnalyticsCard title="Top Tags">
                    {submissions.topProblemTags?.map(
                        (item) => (
                            <Row
                                key={item.tag}
                                label={item.tag}
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>

                <AnalyticsCard title="Solved By Rating">
                    {submissions.problemsSolvedByRating?.map(
                        (item) => (
                            <Row
                                key={item.rating}
                                label={`Rating ${item.rating}`}
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>
            </div>

            {/* RATING HISTORY */}
            <AnalyticsCard
                title="Rating History"
                action={
                    contests.ratingHistory?.length > 10 && (
                        <button
                            onClick={onShowAllRatingHistory}
                            className="rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-surface-raised"
                        >
                            View All History
                        </button>
                    )
                }
            >
                <div className="space-y-2">
                    {contests.ratingHistory?.length === 0 ? (
                        <p className="text-sm text-text-secondary">
                            No rating history found.
                        </p>
                    ) : (
                        contests.ratingHistory
                            ?.slice(-10)
                            .reverse()
                            .map((item, index) => (
                                <div
                                    key={`${item.contestTime}-${index}`}
                                    className="flex items-center justify-between rounded-lg bg-bg-surface-raised p-3"
                                >
                                    <span className="text-sm text-text-secondary">
                                        {new Date(
                                            item.contestTime
                                        ).toLocaleDateString()}
                                    </span>

                                    <span
                                        className={`text-sm font-medium ${item.newRating >=
                                            item.oldRating
                                            ? "text-green-400"
                                            : "text-red-400"
                                            }`}
                                    >
                                        {item.oldRating} →{" "}
                                        {item.newRating}
                                    </span>
                                </div>
                            ))
                    )}
                </div>
            </AnalyticsCard>

            {/* ACTIVITY HEATMAP */}
            <ActivityHeatmap
                activity={submissions.recentActivity || []}
            />
        </section>
    );
}

function ActivityHeatmap({ activity }) {
    const activityMap = new Map(
        activity.map((item) => [item.date, item.count])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);

        const key = formatDate(date);

        days.push({
            date,
            key,
            count: activityMap.get(key) || 0,
        });
    }

    const maxCount = Math.max(
        ...days.map((day) => day.count),
        1
    );

    return (
        <AnalyticsCard title="Activity">
            <div className="overflow-x-auto pb-1">
                <div className="min-w-[520px]">
                    <div className="mb-3 flex justify-between text-xs text-text-secondary">
                        <span>Last 30 days</span>

                        <span>
                            {days.reduce(
                                (total, day) =>
                                    total + day.count,
                                0
                            )}{" "}
                            submissions
                        </span>
                    </div>

                    <div className="grid grid-cols-10 gap-1.5 sm:grid-cols-15">
                        {days.map((day) => {
                            const intensity =
                                day.count === 0
                                    ? 0
                                    : Math.max(
                                        1,
                                        Math.ceil(
                                            (day.count /
                                                maxCount) *
                                            4
                                        )
                                    );

                            return (
                                <div
                                    key={day.key}
                                    title={`${day.key}: ${day.count} submission${day.count === 1
                                        ? ""
                                        : "s"
                                        }`}
                                    className={`h-5 w-5 rounded-sm ${intensity === 0
                                        ? "bg-bg-surface-raised"
                                        : intensity === 1
                                            ? "bg-brand-500/20"
                                            : intensity === 2
                                                ? "bg-brand-500/40"
                                                : intensity === 3
                                                    ? "bg-brand-500/60"
                                                    : "bg-brand-500"
                                        }`}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-text-secondary">
                        <span>Less</span>

                        <span className="h-3 w-3 rounded-sm bg-bg-surface-raised" />
                        <span className="h-3 w-3 rounded-sm bg-brand-500/20" />
                        <span className="h-3 w-3 rounded-sm bg-brand-500/40" />
                        <span className="h-3 w-3 rounded-sm bg-brand-500/60" />
                        <span className="h-3 w-3 rounded-sm bg-brand-500" />

                        <span>More</span>
                    </div>
                </div>
            </div>
        </AnalyticsCard>
    );
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(
        2,
        "0"
    );
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function AnalyticsCard({ title, action, children }) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-medium text-text-primary">
                    {title}
                </h3>

                {action}
            </div>

            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function Row({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-bg-surface-raised px-3 py-2">
            <span className="text-sm text-text-secondary">
                {label}
            </span>

            <span className="text-sm font-semibold text-text-primary">
                {value}
            </span>
        </div>
    );
}

function DetailsModal({ title, children, onClose }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onMouseDown={onClose}
        >
            <div
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
                className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border-subtle bg-bg-surface p-5 shadow-2xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 className="font-semibold text-text-primary">
                        {title}
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-text-secondary hover:bg-bg-surface-raised"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
}

function Detail({ label, value }) {
    return (
        <div className="rounded-lg border border-border-subtle p-3">
            <p className="text-xs text-text-secondary">
                {label}
            </p>

            <p className="mt-1 break-words text-sm text-text-primary">
                {value ?? "—"}
            </p>
        </div>
    );
}