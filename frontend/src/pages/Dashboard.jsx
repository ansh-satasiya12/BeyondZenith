import { useEffect, useState } from "react";

import {
    Activity,
    BookOpen,
    Code2,
    GitBranch,
    Star,
    Trophy,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

import dashboardService from "../services/dashboard.service";
import githubService from "../services/github.service";
import leetcodeService from "../services/leetcode.service";
import codeforcesService from "../services/codeforces.service";

function EmptyActivity({ platform = "GitHub", message }) {
    return (
        <div className="flex flex-col items-center justify-center py-8 text-center">
            <Activity size={24} className="text-text-secondary" />

            <p className="mt-2 text-sm font-medium text-text-primary">
                No {platform} activity yet
            </p>

            <p className="mt-1 max-w-sm text-xs text-text-secondary">
                {message || `Sync your ${platform} account to start tracking your recent activity.`}
            </p>
        </div>
    );
}

export default function Dashboard() {
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [error, setError] = useState("");
    const [syncError, setSyncError] = useState("");

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await dashboardService.getDashboard();

            setDashboard(response?.data || null);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Failed to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    const syncAllPlatforms = async () => {
        try {
            setSyncing(true);
            setSyncError("");

            const connectedPlatforms = dashboard?.profile?.platforms || {};
            const isGithubConnected = Boolean(connectedPlatforms.github?.connected);
            const isCodeforcesConnected = Boolean(connectedPlatforms.codeforces?.connected);
            const isLeetcodeConnected = Boolean(connectedPlatforms.leetcode?.connected);

            const syncTasks = [];
            const failedPlatforms = [];

            if (isGithubConnected) {
                syncTasks.push(
                    (async () => {
                        try {
                            await githubService.syncProfile();
                            await githubService.syncRepositories();
                        } catch {
                            failedPlatforms.push("GitHub");
                        }
                    })()
                );
            }

            if (isCodeforcesConnected) {
                syncTasks.push(
                    (async () => {
                        try {
                            await codeforcesService.sync();
                        } catch {
                            failedPlatforms.push("Codeforces");
                        }
                    })()
                );
            }

            if (isLeetcodeConnected) {
                syncTasks.push(
                    (async () => {
                        try {
                            await leetcodeService.sync();
                        } catch {
                            failedPlatforms.push("LeetCode");
                        }
                    })()
                );
            }

            if (syncTasks.length > 0) {
                await Promise.all(syncTasks);
            }

            if (failedPlatforms.length > 0) {
                setSyncError(`Failed to sync: ${failedPlatforms.join(", ")}`);
            }

            const response = await dashboardService.getDashboard();
            setDashboard(response?.data || null);
        } catch (err) {
            setSyncError(
                err.response?.data?.message ||
                "Failed to sync platforms."
            );
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return (
            <div className="space-y-4 p-6">
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    {error}
                </div>

                <button
                    onClick={loadDashboard}
                    className="rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-primary hover:bg-bg-surface-raised"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!dashboard) {
        return (
            <div className="p-6 text-sm text-text-secondary">
                No dashboard data available.
            </div>
        );
    }

    const { profile, overview, activity, highlights } = dashboard;

    return (
        <div className="space-y-6 p-6">
            {/* HEADER */}
            <header className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-text-primary">
                        Developer Dashboard
                    </h1>

                    <p className="mt-1 text-sm text-text-secondary">
                        Your development activity across GitHub,
                        Codeforces and LeetCode.
                    </p>
                </div>

                <button
                    onClick={syncAllPlatforms}
                    disabled={syncing}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-400 disabled:opacity-50 transition"
                >
                    <RefreshCw
                        size={15}
                        className={syncing ? "animate-spin" : ""}
                    />

                    {syncing ? "Syncing..." : "Sync All"}
                </button>
            </header>

            {syncError && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-400">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{syncError}</span>
                </div>
            )}

            {/* PROFILE */}
            <ProfileSection profile={profile} />

            {/* HIGHLIGHTS */}
            <HighlightsSection highlights={highlights} overview={overview} />

            {/* CONNECTED PLATFORMS */}
            <PlatformsSection
                platforms={profile?.platforms}
            />

            {/* PLATFORM OVERVIEW */}
            <OverviewSection overview={overview} />

            {/* ACTIVITY */}
            <ActivitySection activity={activity} />
        </div>
    );
}

/* ============================================================
   PROFILE
============================================================ */

function ProfileSection({ profile }) {
    const user = profile?.user;

    return (
        <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5">
            <div className="flex flex-wrap items-center gap-4">
                {user?.avatar ? (
                    <img
                        src={user.avatar}
                        alt=""
                        className="h-16 w-16 rounded-full object-cover"
                    />
                ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-raised text-xl font-bold text-text-primary">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                )}

                <div>
                    <h2 className="text-xl font-semibold text-text-primary">
                        Welcome back
                        {user?.name
                            ? `, ${user.name}`
                            : ""}
                    </h2>

                    {user?.email && (
                        <p className="mt-1 text-sm text-text-secondary">
                            {user.email}
                        </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary">
                        <Activity size={13} />

                        <span>
                            {profile?.platforms
                                ? getConnectedCount(
                                    profile.platforms
                                )
                                : 0}{" "}
                            of 3 platforms connected
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ============================================================
   HIGHLIGHTS
============================================================ */

function HighlightsSection({ highlights, overview }) {
    const problemsSolved =
        (overview?.leetcode?.data?.totalSolved || 0) +
        (overview?.codeforces?.data?.problemsSolved || 0);

    const totalRepositories =
        highlights?.totalRepositories ?? overview?.github?.data?.repositoryCount ?? 0;

    const totalStars =
        highlights?.totalStars ?? overview?.github?.data?.stars ?? 0;

    return (
        <section>
            <h2 className="mb-3 font-semibold text-text-primary">
                Highlights
            </h2>

            <div className="grid gap-4 sm:grid-cols-3">
                <HighlightCard
                    icon={Code2}
                    label="Problems Solved"
                    value={formatNumber(problemsSolved)}
                />

                <HighlightCard
                    icon={GitBranch}
                    label="Total Repositories"
                    value={formatNumber(totalRepositories)}
                />

                <HighlightCard
                    icon={Star}
                    label="GitHub Stars"
                    value={formatNumber(totalStars)}
                />
            </div>
        </section>
    );
}

function HighlightCard({
    icon: Icon,
    label,
    value,
}) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-secondary">
                <Icon size={16} />

                <span className="text-xs">
                    {label}
                </span>
            </div>

            <p className="mt-2 text-2xl font-bold text-text-primary">
                {value}
            </p>
        </div>
    );
}

/* ============================================================
   PLATFORMS
============================================================ */

function PlatformsSection({ platforms }) {
    return (
        <section>
            <h2 className="mb-3 font-semibold text-text-primary">
                Connected Platforms
            </h2>

            <div className="grid gap-4 md:grid-cols-3">
                <PlatformCard
                    platform="GitHub"
                    icon={GitBranch}
                    connected={
                        platforms?.github?.connected
                    }
                    data={platforms?.github?.data}
                    usernameKey="username"
                />

                <PlatformCard
                    platform="Codeforces"
                    icon={Trophy}
                    connected={
                        platforms?.codeforces?.connected
                    }
                    data={platforms?.codeforces?.data}
                    usernameKey="handle"
                />

                <PlatformCard
                    platform="LeetCode"
                    icon={Code2}
                    connected={
                        platforms?.leetcode?.connected
                    }
                    data={platforms?.leetcode?.data}
                    usernameKey="username"
                />
            </div>
        </section>
    );
}

function PlatformCard({
    platform,
    icon: Icon,
    connected,
    data,
    usernameKey,
}) {
    const username = data?.[usernameKey];

    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-bg-surface-raised">
                        <Icon size={19} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-text-primary">
                            {platform}
                        </h3>

                        <p className={`text-xs ${connected ? "text-text-secondary" : "font-medium text-red-500"}`}>
                            {connected
                                ? username || "Connected"
                                : "Not connected"}
                        </p>
                    </div>
                </div>

                <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${connected
                        ? "bg-green-500/10 text-green-400"
                        : "bg-red-500/10 text-red-500"
                        }`}
                >
                    {connected
                        ? "Connected"
                        : "Disconnected"}
                </span>
            </div>

            {connected && data?.connectedAt && (
                <p className="mt-4 text-xs text-text-secondary">
                    Connected{" "}
                    {formatDate(data.connectedAt)}
                </p>
            )}

            {!connected && (
                <p className="mt-4 text-xs text-text-secondary">
                    Connect this platform from Settings.
                </p>
            )}
        </div>
    );
}

/* ============================================================
   OVERVIEW
============================================================ */

function OverviewSection({ overview }) {
    return (
        <section className="space-y-4">
            <h2 className="font-semibold text-text-primary">
                Platform Overview
            </h2>

            <div className="grid gap-4 lg:grid-cols-3">
                <GitHubOverview
                    data={overview?.github}
                />

                <CodeforcesOverview
                    data={overview?.codeforces}
                />

                <LeetCodeOverview
                    data={overview?.leetcode}
                />
            </div>
        </section>
    );
}

function GitHubOverview({ data }) {
    const connected = data?.connected;
    const github = data?.data;

    return (
        <OverviewCard
            title="GitHub"
            icon={GitBranch}
            connected={connected}
        >
            {connected ? (
                <>
                    <OverviewRow
                        label="Repositories"
                        value={
                            github?.repositoryCount || 0
                        }
                    />

                    <OverviewRow
                        label="Stars"
                        value={github?.stars || 0}
                    />

                    <OverviewRow
                        label="Forks"
                        value={github?.forks || 0}
                    />

                    <div className="pt-2">
                        <p className="mb-2 text-xs text-text-secondary">
                            Primary Languages
                        </p>

                        <LanguageList
                            languages={
                                github?.primaryLanguages
                            }
                        />
                    </div>
                </>
            ) : (
                <DisconnectedMessage platform="GitHub" />
            )}
        </OverviewCard>
    );
}

function CodeforcesOverview({ data }) {
    const connected = data?.connected;
    const codeforces = data?.data;

    return (
        <OverviewCard
            title="Codeforces"
            icon={Trophy}
            connected={connected}
        >
            {connected ? (
                <>
                    <OverviewRow
                        label="Current Rating"
                        value={
                            codeforces?.rating || 0
                        }
                    />

                    <OverviewRow
                        label="Max Rating"
                        value={
                            codeforces?.maxRating || 0
                        }
                    />

                    <OverviewRow
                        label="Problems Solved"
                        value={
                            codeforces?.problemsSolved ||
                            0
                        }
                    />

                    <OverviewRow
                        label="Contests"
                        value={
                            codeforces?.contestsParticipated ||
                            0
                        }
                    />

                    <OverviewRow
                        label="Best Rank"
                        value={
                            codeforces?.bestRank ?? "—"
                        }
                    />
                </>
            ) : (
                <DisconnectedMessage platform="Codeforces" />
            )}
        </OverviewCard>
    );
}

function LeetCodeOverview({ data }) {
    const connected = data?.connected;
    const leetcode = data?.data;

    return (
        <OverviewCard
            title="LeetCode"
            icon={Code2}
            connected={connected}
        >
            {connected ? (
                <>
                    <OverviewRow
                        label="Total Solved"
                        value={
                            leetcode?.totalSolved || 0
                        }
                    />

                    <OverviewRow
                        label="Easy"
                        value={
                            leetcode?.easySolved || 0
                        }
                    />

                    <OverviewRow
                        label="Medium"
                        value={
                            leetcode?.mediumSolved || 0
                        }
                    />

                    <OverviewRow
                        label="Hard"
                        value={
                            leetcode?.hardSolved || 0
                        }
                    />

                    <OverviewRow
                        label="Ranking"
                        value={
                            leetcode?.ranking
                                ? leetcode.ranking.toLocaleString()
                                : "—"
                        }
                    />

                    <OverviewRow
                        label="Contest Rating"
                        value={
                            leetcode?.contestRating || 0
                        }
                    />

                    <OverviewRow
                        label="Contests"
                        value={
                            leetcode?.contestsParticipated ||
                            0
                        }
                    />
                </>
            ) : (
                <DisconnectedMessage platform="LeetCode" />
            )}
        </OverviewCard>
    );
}

function OverviewCard({
    title,
    icon: Icon,
    connected,
    children,
}) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={17} />

                    <h3 className="font-medium text-text-primary">
                        {title}
                    </h3>
                </div>

                {connected ? (
                    <span className="text-xs text-green-400">
                        Connected
                    </span>
                ) : (
                    <span className="text-xs font-medium text-red-500">
                        Disconnected
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function OverviewRow({ label, value }) {
    return (
        <div className="flex items-center justify-between rounded-lg bg-bg-surface-raised px-3 py-2">
            <span className="text-sm text-text-secondary">
                {label}
            </span>

            <span className="text-sm font-semibold text-text-primary">
                {typeof value === "number"
                    ? value.toLocaleString()
                    : value}
            </span>
        </div>
    );
}

function LanguageList({ languages = [] }) {
    if (!languages.length) {
        return (
            <span className="text-xs text-text-secondary">
                No language data
            </span>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {languages.map((item, index) => (
                <span
                    key={`${item.language}-${index}`}
                    className="rounded-md bg-bg-surface-raised px-2 py-1 text-xs text-text-secondary"
                >
                    {item.language}
                    {item.count !== undefined
                        ? ` (${item.count})`
                        : ""}
                </span>
            ))}
        </div>
    );
}

function DisconnectedMessage({ platform }) {
    return (
        <div className="rounded-lg bg-bg-surface-raised p-4 text-center">
            <p className="text-sm font-medium text-red-500">
                {platform} is not connected.
            </p>
        </div>
    );
}

/* ============================================================
   ACTIVITY
============================================================ */

function ActivitySection({ activity }) {
    return (
        <section className="space-y-4">
            <div>
                <h2 className="font-semibold text-text-primary">
                    Recent Activity
                </h2>

                <p className="mt-1 text-xs text-text-secondary">
                    Your latest activity across connected
                    platforms.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <GitHubActivity
                    data={activity?.github}
                />

                <CodeforcesActivity
                    data={activity?.codeforces}
                />

                <LeetCodeActivity
                    data={activity?.leetcode}
                />
            </div>
        </section>
    );
}

function GitHubActivity({ data }) {
    const connected = data?.connected;
    const repositories =
        data?.data?.recentRepositories || [];

    return (
        <ActivityCard
            title="GitHub"
            icon={GitBranch}
            connected={connected}
        >
            {!connected ? (
                <DisconnectedMessage platform="GitHub" />
            ) : repositories.length === 0 ? (
                <EmptyActivity platform="GitHub" />
            ) : (
                repositories.slice(0, 5).map((repo) => (
                    <div
                        key={
                            repo._id ||
                            repo.githubRepoId ||
                            repo.id ||
                            repo.name
                        }
                        className="rounded-lg border border-border-subtle p-3"
                    >
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-text-primary">
                                    {repo.name ||
                                        repo.fullName ||
                                        "Repository"}
                                </p>

                                {repo.description && (
                                    <p className="mt-1 line-clamp-2 text-xs text-text-secondary">
                                        {repo.description}
                                    </p>
                                )}
                            </div>

                            <GitBranch
                                size={14}
                                className="shrink-0 text-text-secondary"
                            />
                        </div>

                        <div className="mt-2 flex gap-3 text-[11px] text-text-secondary">
                            {repo.language && (
                                <span>
                                    {repo.language}
                                </span>
                            )}

                            {repo.stars !== undefined && (
                                <span className="inline-flex items-center gap-1">
                                    <Star size={11} />
                                    {repo.stars}
                                </span>
                            )}
                        </div>
                    </div>
                ))
            )}
        </ActivityCard>
    );
}

function CodeforcesActivity({ data }) {
    const connected = data?.connected;

    const submissions =
        data?.data?.recentSubmissions || [];

    const contests =
        data?.data?.recentContests || [];

    const hasNoActivity = submissions.length === 0 && contests.length === 0;

    return (
        <ActivityCard
            title="Codeforces"
            icon={Trophy}
            connected={connected}
        >
            {!connected ? (
                <DisconnectedMessage platform="Codeforces" />
            ) : hasNoActivity ? (
                <EmptyActivity platform="Codeforces" />
            ) : (
                <>
                    <ActivitySubheading>
                        Recent Submissions
                    </ActivitySubheading>

                    {submissions.length === 0 ? (
                        <p className="py-3 text-center text-xs text-text-secondary">
                            No Codeforces submissions yet
                        </p>
                    ) : (
                        submissions
                            .slice(0, 4)
                            .map((submission, index) => (
                                <SubmissionItem
                                    key={
                                        submission._id ||
                                        submission.id ||
                                        index
                                    }
                                    submission={
                                        submission
                                    }
                                />
                            ))
                    )}

                    <ActivitySubheading>
                        Recent Contests
                    </ActivitySubheading>

                    {contests.length === 0 ? (
                        <p className="py-3 text-center text-xs text-text-secondary">
                            No Codeforces contests yet
                        </p>
                    ) : (
                        contests
                            .slice(0, 3)
                            .map((contest, index) => (
                                <ContestItem
                                    key={
                                        contest._id ||
                                        contest.id ||
                                        index
                                    }
                                    contest={contest}
                                />
                            ))
                    )}
                </>
            )}
        </ActivityCard>
    );
}

function LeetCodeActivity({ data }) {
    const connected = data?.connected;

    const contests =
        data?.data?.recentContests || [];

    const recentActivity =
        data?.data?.recentActivity || [];

    const hasNoActivity = recentActivity.length === 0 && contests.length === 0;

    return (
        <ActivityCard
            title="LeetCode"
            icon={Code2}
            connected={connected}
        >
            {!connected ? (
                <DisconnectedMessage platform="LeetCode" />
            ) : hasNoActivity ? (
                <EmptyActivity platform="LeetCode" />
            ) : (
                <>
                    <ActivitySubheading>
                        Recent Activity
                    </ActivitySubheading>

                    {recentActivity.length === 0 ? (
                        <p className="py-3 text-center text-xs text-text-secondary">
                            No LeetCode activity yet
                        </p>
                    ) : (
                        recentActivity
                            .slice(0, 5)
                            .map((item, index) => (
                                <LeetCodeActivityItem
                                    key={
                                        item._id ||
                                        item.id ||
                                        item.date ||
                                        index
                                    }
                                    item={item}
                                />
                            ))
                    )}

                    <ActivitySubheading>
                        Recent Contests
                    </ActivitySubheading>

                    {contests.length === 0 ? (
                        <p className="py-3 text-center text-xs text-text-secondary">
                            No LeetCode contests yet
                        </p>
                    ) : (
                        contests
                            .slice(0, 3)
                            .map((contest, index) => (
                                <ContestItem
                                    key={
                                        contest._id ||
                                        contest.id ||
                                        index
                                    }
                                    contest={contest}
                                />
                            ))
                    )}
                </>
            )}
        </ActivityCard>
    );
}

function ActivityCard({
    title,
    icon: Icon,
    connected,
    children,
}) {
    return (
        <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
            <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={17} />

                    <h3 className="font-medium text-text-primary">
                        {title}
                    </h3>
                </div>

                {connected ? (
                    <span className="text-[11px] text-green-400">
                        Connected
                    </span>
                ) : (
                    <span className="text-[11px] font-medium text-red-500">
                        Disconnected
                    </span>
                )}
            </div>

            <div className="space-y-2">
                {children}
            </div>
        </div>
    );
}

function ActivitySubheading({ children }) {
    return (
        <p className="pt-2 text-xs font-medium text-text-secondary">
            {children}
        </p>
    );
}

function SubmissionItem({ submission }) {
    const problem =
        submission.problem ||
        submission.problemName ||
        submission.name ||
        "Problem";

    const verdict =
        submission.verdict ||
        submission.status ||
        "Unknown";

    return (
        <div className="rounded-lg bg-bg-surface-raised p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-text-primary">
                    {problem}
                </p>

                <span className="shrink-0 text-xs text-text-secondary">
                    {verdict}
                </span>
            </div>

            {submission.submittedAt && (
                <p className="mt-1 text-[11px] text-text-secondary">
                    {formatDate(submission.submittedAt)}
                </p>
            )}
        </div>
    );
}

function ContestItem({ contest }) {
    return (
        <div className="rounded-lg bg-bg-surface-raised p-3">
            <div className="flex items-center justify-between gap-3">
                <p className="truncate text-sm text-text-primary">
                    {contest.contestName ||
                        contest.name ||
                        "Contest"}
                </p>

                {(contest.ratingChange !== undefined ||
                    contest.rank !== undefined) && (
                        <span className="shrink-0 text-xs text-text-secondary">
                            {contest.ratingChange !==
                                undefined
                                ? `${contest.ratingChange > 0 ? "+" : ""}${contest.ratingChange}`
                                : `Rank ${contest.rank}`}
                        </span>
                    )}
            </div>

            {contest.contestTime && (
                <p className="mt-1 text-[11px] text-text-secondary">
                    {formatDate(
                        contest.contestTime
                    )}
                </p>
            )}
        </div>
    );
}

function LeetCodeActivityItem({ item }) {
    return (
        <div className="rounded-lg bg-bg-surface-raised p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <BookOpen
                        size={13}
                        className="text-text-secondary"
                    />

                    <span className="text-sm text-text-primary">
                        {item.count ?? 0} submissions
                    </span>
                </div>

                <span className="text-[11px] text-text-secondary">
                    {item.date
                        ? formatDate(item.date)
                        : ""}
                </span>
            </div>
        </div>
    );
}

/* ============================================================
   HELPERS
============================================================ */

function getConnectedCount(platforms) {
    return Object.values(platforms || {}).filter(
        (platform) => platform?.connected
    ).length;
}

function formatNumber(value) {
    return Number(value || 0).toLocaleString();
}

function formatDate(value) {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleDateString();
}

/* ============================================================
   LOADING
============================================================ */

function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-6">
            <div className="h-8 w-64 animate-pulse rounded bg-bg-surface-raised" />

            <div className="h-20 animate-pulse rounded-2xl bg-bg-surface-raised" />

            <div className="grid gap-4 sm:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-28 animate-pulse rounded-xl bg-bg-surface-raised"
                    />
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-36 animate-pulse rounded-xl bg-bg-surface-raised"
                    />
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="h-72 animate-pulse rounded-xl bg-bg-surface-raised"
                    />
                ))}
            </div>
        </div>
    );
}