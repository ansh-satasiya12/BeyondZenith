import { useEffect, useState } from "react";

import {
    Code2,
    RefreshCw,
    Unlink,
    Trophy,
    Target,
    Activity,
    X,
    ExternalLink,
} from "lucide-react";

import leetcodeService from "../services/leetcode.service";
import { useAuth } from "../context/AuthContext";

export default function LeetCode() {
    const { user, refreshUser } = useAuth();
    const connected = Boolean(user?.leetcode?.username);

    const [dashboard, setDashboard] = useState(null);
    const [analytics, setAnalytics] = useState(null);

    const [contests, setContests] = useState([]);
    const [allContests, setAllContests] = useState([]);

    const [username, setUsername] = useState("");

    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [unlinking, setUnlinking] = useState(false);
    const [loadingAllContests, setLoadingAllContests] = useState(false);

    const [error, setError] = useState("");

    const [selectedContest, setSelectedContest] = useState(null);
    const [showAllContests, setShowAllContests] = useState(false);
    const [showRatingHistory, setShowRatingHistory] = useState(false);

    useEffect(() => {
        if (connected) {
            loadDashboard();
        } else {
            setDashboard(null);
            setAnalytics(null);
            setContests([]);
            setAllContests([]);
            setError("");
            setLoading(false);
        }
    }, [user?.leetcode?.username]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data =
                await leetcodeService.getDashboard();

            setDashboard(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load LeetCode data."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadAnalytics = async () => {
        try {
            const data =
                await leetcodeService.getAnalytics();

            setAnalytics(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load analytics."
            );
        }
    };

    const loadContests = async () => {
        try {
            const result =
                await leetcodeService.getContests({
                    page: 1,
                    limit: 15,
                    sortBy: "contestTime",
                    order: "desc",
                });

            setContests(
                result?.data ||
                result?.contests ||
                []
            );
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
                await leetcodeService.getContests({
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

            let completeContests = [
                ...firstContests,
            ];

            if (totalPages > 1) {
                const requests = [];

                for (
                    let page = 2;
                    page <= totalPages;
                    page++
                ) {
                    requests.push(
                        leetcodeService.getContests({
                            page,
                            limit: 100,
                            sortBy: "contestTime",
                            order: "desc",
                        })
                    );
                }

                const results =
                    await Promise.all(requests);

                results.forEach((result) => {
                    const pageContests =
                        result?.data ||
                        result?.contests ||
                        [];

                    completeContests.push(
                        ...pageContests
                    );
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
            loadContests();
        }
    }, [loading, connected]);

    const connect = async (e) => {
        e.preventDefault();

        if (!username.trim()) return;

        try {
            setConnecting(true);
            setError("");

            await leetcodeService.connect(
                username.trim()
            );

            await refreshUser();
            setUsername("");
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to connect LeetCode."
            );
        } finally {
            setConnecting(false);
        }
    };

    const sync = async () => {
        try {
            setSyncing(true);
            setError("");

            await leetcodeService.sync();

            await loadDashboard();
            await loadAnalytics();
            await loadContests();
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to sync LeetCode data."
            );
        } finally {
            setSyncing(false);
        }
    };

    const unlink = async () => {
        const confirmed = window.confirm(
            "Unlink your LeetCode account? Your synced LeetCode data will also be removed."
        );

        if (!confirmed) return;

        try {
            setUnlinking(true);
            setError("");

            await leetcodeService.unlink();
            await refreshUser();

            setDashboard(null);
            setAnalytics(null);
            setContests([]);
            setAllContests([]);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to unlink LeetCode."
            );
        } finally {
            setUnlinking(false);
        }
    };

    const openContest = async (id) => {
        try {
            const data =
                await leetcodeService.getContest(id);

            setSelectedContest(data);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load contest."
            );
        }
    };

    const openLeetCodeProfile = () => {
        const username = dashboard?.profile?.username;

        if (!username) return;

        window.open(
            `https://leetcode.com/u/${encodeURIComponent(username)}/`,
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
            {/* HEADER */}

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <Code2 size={26} />

                        <h1 className="text-2xl font-bold text-text-primary">
                            LeetCode
                        </h1>
                    </div>

                    <p className="mt-1 text-sm text-text-secondary">
                        Track your problem solving and competitive
                        programming progress.
                    </p>
                </div>

                {connected && (
                    <div className="flex flex-wrap gap-2">
                        <a
                            href={`https://leetcode.com/u/${encodeURIComponent(
                                dashboard.profile.username
                            )}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-bg-surface-raised cursor-pointer"
                        >
                            <ExternalLink size={15} />
                            LC Profile
                        </a>

                        <button
                            onClick={sync}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm hover:bg-bg-surface-raised disabled:opacity-50"
                        >
                            <RefreshCw
                                size={15}
                                className={
                                    syncing
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                            {syncing
                                ? "Syncing..."
                                : "Sync"}
                        </button>

                        <button
                            onClick={unlink}
                            disabled={unlinking}
                            className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10"
                        >
                            <Unlink size={15} />

                            {unlinking
                                ? "Unlinking..."
                                : "Unlink"}
                        </button>
                    </div>
                )}
            </div>

            {/* ERROR */}

            {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {/* CONNECT */}

            {!connected && (
                <div className="rounded-2xl border border-border-subtle bg-bg-surface p-6">
                    <div className="flex items-center gap-3">
                        <Target size={22} />

                        <div>
                            <h2 className="font-semibold text-text-primary">
                                Connect LeetCode
                            </h2>

                            <p className="text-sm text-text-secondary">
                                Enter your LeetCode username to
                                connect your account.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={connect}
                        className="mt-5 flex flex-col gap-3 sm:flex-row"
                    >
                        <input
                            value={username}
                            onChange={(e) =>
                                setUsername(e.target.value)
                            }
                            placeholder="LeetCode username"
                            className="flex-1 rounded-lg border border-border-subtle bg-bg-surface-raised px-3 py-2 text-sm outline-none"
                        />

                        <button
                            disabled={
                                connecting ||
                                !username.trim()
                            }
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
                                {dashboard.profile?.avatarUrl ? (
                                    <img
                                        src={
                                            dashboard.profile
                                                .avatarUrl
                                        }
                                        alt=""
                                        className="h-16 w-16 rounded-full"
                                    />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-raised text-xl font-bold">
                                        {dashboard.profile?.username?.[0]?.toUpperCase()}
                                    </div>
                                )}

                                <div>
                                    <h2 className="text-xl font-semibold text-text-primary">
                                        {
                                            dashboard.profile
                                                ?.username
                                        }
                                    </h2>

                                    {dashboard.profile?.name && (
                                        <p className="text-sm text-text-secondary">
                                            {
                                                dashboard.profile
                                                    .name
                                            }
                                        </p>
                                    )}

                                    <p className="mt-1 text-xs text-text-secondary">
                                        Ranking:{" "}
                                        {dashboard.profile?.ranking?.toLocaleString() ||
                                            "—"}
                                    </p>

                                    <p className="text-xs text-text-secondary">
                                        Reputation:{" "}
                                        {dashboard.profile
                                            ?.reputation ?? 0}
                                    </p>
                                </div>
                            </div>

                            {/* RATING BOX */}

                            <div className="rounded-xl border border-border-subtle bg-bg-surface-raised px-5 py-4">
                                <p className="text-xs text-text-secondary">
                                    Contest Rating
                                </p>

                                <div className="mt-1 flex items-end gap-3">
                                    <div>
                                        <p className="text-2xl font-bold text-text-primary">
                                            {dashboard.overview
                                                ?.currentRating ??
                                                0}
                                        </p>

                                        <p className="text-[11px] text-text-secondary">
                                            Current
                                        </p>
                                    </div>

                                    <div className="pb-1 text-text-secondary">
                                        /
                                    </div>

                                    <div>
                                        <p className="text-lg font-semibold text-text-primary">
                                            {dashboard.overview
                                                ?.maxRating ?? 0}
                                        </p>

                                        <p className="text-[11px] text-text-secondary">
                                            Max
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() =>
                                        setShowRatingHistory(
                                            true
                                        )
                                    }
                                    className="mt-3 w-full rounded-lg border border-border-subtle px-3 py-2 text-xs font-medium text-text-primary hover:bg-bg-surface"
                                >
                                    View Rating History
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* OVERVIEW */}

                    <section>
                        <h2 className="mb-3 font-semibold text-text-primary">
                            Overview
                        </h2>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <Stat
                                icon={Target}
                                label="Solved"
                                value={
                                    dashboard.overview
                                        ?.totalSolved ?? 0
                                }
                            />

                            <Stat
                                icon={Activity}
                                label="Easy"
                                value={
                                    dashboard.overview
                                        ?.easySolved ?? 0
                                }
                            />

                            <Stat
                                icon={Target}
                                label="Medium"
                                value={
                                    dashboard.overview
                                        ?.mediumSolved ?? 0
                                }
                            />

                            <Stat
                                icon={Trophy}
                                label="Hard"
                                value={
                                    dashboard.overview
                                        ?.hardSolved ?? 0
                                }
                            />

                            <Stat
                                icon={Activity}
                                label="Acceptance Rate"
                                value={`${dashboard.overview?.acceptanceRate ?? 0}%`}
                            />

                            <Stat
                                icon={Trophy}
                                label="Contests"
                                value={
                                    dashboard.overview
                                        ?.totalContests ?? 0
                                }
                            />
                        </div>
                    </section>

                    {/* ACTIVITY HEATMAP */}

                    <ActivityHeatmap
                        activity={
                            dashboard.activity
                                ?.recentActivity || []
                        }
                    />

                    {/* ANALYTICS */}

                    {analytics && (
                        <AnalyticsSection
                            analytics={analytics}
                        />
                    )}

                    {/* RECENT CONTESTS */}

                    <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <div>
                                <h2 className="font-semibold text-text-primary">
                                    Recent Contests
                                </h2>

                                <p className="mt-1 text-xs text-text-secondary">
                                    Showing your latest 15
                                    contests.
                                </p>
                            </div>

                            {(dashboard.overview
                                ?.totalContests ?? 0) > 15 && (
                                    <button
                                        onClick={
                                            loadAllContests
                                        }
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
                                contests.map(
                                    (contest) => (
                                        <button
                                            key={
                                                contest._id
                                            }
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
                                                        : "—"}

                                                    {" • "}

                                                    Rank:{" "}
                                                    {contest.rank ??
                                                        "—"}

                                                    {" • "}

                                                    Solved:{" "}
                                                    {contest.solvedCount ??
                                                        contest.problemsSolved ??
                                                        0}
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
                                                {contest.ratingChange ??
                                                    0}
                                            </span>
                                        </button>
                                    )
                                )
                            )}
                        </div>
                    </section>
                </>
            )}

            {/* CONTEST MODAL */}

            {selectedContest && (
                <DetailsModal
                    title={
                        selectedContest.contestName ||
                        "Contest"
                    }
                    onClose={() =>
                        setSelectedContest(null)
                    }
                >
                    <Detail
                        label="Rank"
                        value={selectedContest.rank}
                    />

                    <Detail
                        label="Rating"
                        value={
                            selectedContest.rating
                        }
                    />

                    <Detail
                        label="Rating Change"
                        value={
                            selectedContest.ratingChange
                        }
                    />

                    <Detail
                        label="Contest Date"
                        value={
                            selectedContest.contestTime
                                ? new Date(
                                    selectedContest.contestTime
                                ).toLocaleDateString()
                                : "—"
                        }
                    />

                    <Detail
                        label="Solved"
                        value={
                            selectedContest.problemsSolved ??
                            selectedContest.solvedCount ??
                            0
                        }
                    />

                    <Detail
                        label="Total Problems"
                        value={
                            selectedContest.totalProblems
                        }
                    />

                    <Detail
                        label="Finish Time"
                        value={
                            selectedContest.finishTimeSeconds
                                ? `${Math.round(
                                    selectedContest.finishTimeSeconds /
                                    60
                                )} minutes`
                                : "—"
                        }
                    />
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
                            allContests.map(
                                (contest) => (
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
                                                    : "—"}

                                                {" • "}

                                                Rank:{" "}
                                                {contest.rank ??
                                                    "—"}
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
                                            {contest.ratingChange ??
                                                0}
                                        </span>
                                    </button>
                                )
                            )
                        )}
                    </div>
                </DetailsModal>
            )}

            {/* RATING HISTORY */}

            {showRatingHistory && (
                <DetailsModal
                    title="Complete Rating History"
                    onClose={() =>
                        setShowRatingHistory(false)
                    }
                >
                    <div className="space-y-2">
                        {dashboard?.contests?.ratingHistory
                            ?.length > 0 ? (
                            [
                                ...dashboard.contests
                                    .ratingHistory,
                            ]
                                .reverse()
                                .map(
                                    (
                                        item,
                                        index
                                    ) => {
                                        const history =
                                            dashboard
                                                .contests
                                                .ratingHistory;

                                        const previous =
                                            history[
                                            history.length -
                                            index -
                                            2
                                            ];

                                        const ratingChange =
                                            previous
                                                ? item.rating -
                                                previous.rating
                                                : 0;

                                        return (
                                            <div
                                                key={`${item.contestTime}-${index}`}
                                                className="flex items-center justify-between rounded-lg border border-border-subtle p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary">
                                                        {
                                                            item.rating
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-text-secondary">
                                                        {item.contestTime
                                                            ? new Date(
                                                                item.contestTime
                                                            ).toLocaleDateString()
                                                            : "—"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`text-sm font-medium ${ratingChange >=
                                                        0
                                                        ? "text-green-400"
                                                        : "text-red-400"
                                                        }`}
                                                >
                                                    {ratingChange >
                                                        0
                                                        ? "+"
                                                        : ""}
                                                    {
                                                        ratingChange
                                                    }
                                                </span>
                                            </div>
                                        );
                                    }
                                )
                        ) : (
                            <p className="text-sm text-text-secondary">
                                No rating history
                                found.
                            </p>
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

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-xl font-bold text-text-primary">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value}
            </p>
        </div>
    );
}

function AnalyticsSection({ analytics }) {
    const problemSolving =
        analytics.problemSolving;

    const contests = analytics.contests;

    return (
        <section className="space-y-4">
            <h2 className="font-semibold text-text-primary">
                Analytics
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <AnalyticsCard title="Solved By Difficulty">
                    {problemSolving?.solvedDistribution?.map(
                        (item) => (
                            <Row
                                key={item.difficulty}
                                label={
                                    item.difficulty
                                }
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>

                <AnalyticsCard title="Languages">
                    {problemSolving?.languageDistribution
                        ?.slice(0, 8)
                        .map((item) => (
                            <Row
                                key={item.language}
                                label={
                                    item.language
                                }
                                value={
                                    item.problemsSolved
                                }
                            />
                        ))}
                </AnalyticsCard>

                <AnalyticsCard title="Top Skills">
                    {problemSolving?.skillDistribution
                        ?.slice(0, 10)
                        .map((item, index) => (
                            <Row
                                key={`${item.tag}-${index}`}
                                label={item.tag}
                                value={
                                    item.problemsSolved
                                }
                            />
                        ))}
                </AnalyticsCard>

                <AnalyticsCard title="Contest Performance">
                    <Row
                        label="Best Rank"
                        value={
                            contests?.bestRank ??
                            "—"
                        }
                    />

                    <Row
                        label="Average Rank"
                        value={
                            contests?.averageRank ??
                            "—"
                        }
                    />

                    <Row
                        label="Highest Rating"
                        value={
                            contests?.highestContestRating ??
                            0
                        }
                    />

                    <Row
                        label="Best Rating Change"
                        value={
                            contests?.highestRatingChange ??
                            0
                        }
                    />

                    <Row
                        label="Lowest Rating Change"
                        value={
                            contests?.lowestRatingChange ??
                            0
                        }
                    />
                </AnalyticsCard>
            </div>
        </section>
    );
}

function ProblemSolvingSection({
    problemSolving,
}) {
    return (
        <section className="space-y-4">
            <h2 className="font-semibold text-text-primary">
                Problem Solving
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
                <AnalyticsCard title="Difficulty Distribution">
                    {problemSolving?.solvedDistribution?.map(
                        (item) => (
                            <Row
                                key={item.difficulty}
                                label={
                                    item.difficulty
                                }
                                value={item.count}
                            />
                        )
                    )}
                </AnalyticsCard>

                <AnalyticsCard title="Languages">
                    {problemSolving?.languageDistribution
                        ?.slice(0, 10)
                        .map((item) => (
                            <Row
                                key={item.language}
                                label={
                                    item.language
                                }
                                value={
                                    item.problemsSolved
                                }
                            />
                        ))}
                </AnalyticsCard>
            </div>
        </section>
    );
}

function ActivityHeatmap({ activity }) {
    const activityMap = new Map(
        activity.map((item) => [
            item.date,
            item.count,
        ])
    );

    const today = new Date();

    today.setHours(0, 0, 0, 0);

    const days = [];

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);

        date.setDate(
            today.getDate() - i
        );

        const key = formatDate(date);

        days.push({
            date,
            key,
            count:
                activityMap.get(key) || 0,
        });
    }

    const maxCount = Math.max(
        ...days.map(
            (day) => day.count
        ),
        1
    );

    return (
        <AnalyticsCard title="Activity">
            <div className="overflow-x-auto pb-1">
                <div className="min-w-[520px]">
                    <div className="mb-3 flex justify-between text-xs text-text-secondary">
                        <span>
                            Last 30 days
                        </span>

                        <span>
                            {days.reduce(
                                (total, day) =>
                                    total +
                                    day.count,
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
                                    key={
                                        day.key
                                    }
                                    title={`${day.key}: ${day.count} submission${day.count ===
                                        1
                                        ? ""
                                        : "s"
                                        }`}
                                    className={`h-5 w-5 rounded-sm ${intensity ===
                                        0
                                        ? "bg-bg-surface-raised"
                                        : intensity ===
                                            1
                                            ? "bg-brand-500/20"
                                            : intensity ===
                                                2
                                                ? "bg-brand-500/40"
                                                : intensity ===
                                                    3
                                                    ? "bg-brand-500/60"
                                                    : "bg-brand-500"
                                        }`}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-3 flex items-center justify-end gap-2 text-[10px] text-text-secondary">
                        <span>
                            Less
                        </span>

                        <span className="h-3 w-3 rounded-sm bg-bg-surface-raised" />

                        <span className="h-3 w-3 rounded-sm bg-brand-500/20" />

                        <span className="h-3 w-3 rounded-sm bg-brand-500/40" />

                        <span className="h-3 w-3 rounded-sm bg-brand-500/60" />

                        <span className="h-3 w-3 rounded-sm bg-brand-500" />

                        <span>
                            More
                        </span>
                    </div>
                </div>
            </div>
        </AnalyticsCard>
    );
}

function formatDate(date) {
    const year = date.getFullYear();

    const month = String(
        date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function AnalyticsCard({
    title,
    children,
}) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <h3 className="mb-4 font-medium text-text-primary">
                {title}
            </h3>

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

function DetailsModal({
    title,
    children,
    onClose,
}) {
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