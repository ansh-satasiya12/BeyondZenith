import {
    ExternalLink,
    RefreshCw,
    Users,
    GitFork,
} from "lucide-react";

export default function GitHubProfile({
    profile,
    onSync,
    syncing,
}) {
    if (!profile) return null;

    const avatar =
        profile.avatarUrl ||
        profile.avatar_url;

    const username =
        profile.username ||
        profile.login;

    const name =
        profile.name ||
        username;

    const profileUrl =
        profile.profileUrl ||
        profile.htmlUrl ||
        profile.html_url;

    return (
        <section className="rounded-2xl border border-border-subtle bg-bg-surface p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    {avatar ? (
                        <img
                            src={avatar}
                            alt={username}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface-raised text-xl font-bold text-text-primary">
                            {username?.charAt(0).toUpperCase()}
                        </div>
                    )}

                    <div>
                        <h2 className="text-xl font-semibold text-text-primary">
                            {name}
                        </h2>

                        <p className="text-sm text-text-secondary">
                            @{username}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {profileUrl && (
                        <a
                            href={profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-border-subtle px-4 py-2 text-sm text-text-primary transition hover:bg-bg-surface-raised"
                        >
                            GitHub
                            <ExternalLink size={15} />
                        </a>
                    )}

                    <button
                        onClick={onSync}
                        disabled={syncing}
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            size={15}
                            className={syncing ? "animate-spin" : ""}
                        />

                        {syncing ? "Syncing..." : "Sync Profile"}
                    </button>
                </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-border-subtle pt-5 sm:grid-cols-4">
                <ProfileStat
                    icon={Users}
                    label="Followers"
                    value={profile.followers}
                />

                <ProfileStat
                    icon={Users}
                    label="Following"
                    value={profile.following}
                />

                <ProfileStat
                    icon={GitFork}
                    label="Public Repositories"
                    value={profile.publicRepos}
                />

                <ProfileStat
                    label="Gists"
                    value={profile.publicGists}
                />
            </div>
        </section>
    );
}

function ProfileStat({ icon: Icon, label, value }) {
    return (
        <div>
            <div className="flex items-center gap-2 text-text-secondary">
                {Icon && <Icon size={14} />}
                <span className="text-xs">{label}</span>
            </div>

            <p className="mt-1 text-lg font-semibold text-text-primary">
                {Number(value || 0).toLocaleString()}
            </p>
        </div>
    );
}