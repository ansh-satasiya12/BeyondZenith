import {
    BookOpen,
    Lock,
    Star,
    GitFork,
    Eye,
    Archive,
} from "lucide-react";

const cards = [
    {
        key: "total",
        label: "Repositories",
        icon: BookOpen,
    },
    {
        key: "public",
        label: "Public",
        icon: BookOpen,
    },
    {
        key: "private",
        label: "Private",
        icon: Lock,
    },
    {
        key: "totalStars",
        label: "Stars",
        icon: Star,
    },
    {
        key: "totalForks",
        label: "Forks",
        icon: GitFork,
    },
    {
        key: "totalWatchers",
        label: "Watchers",
        icon: Eye,
    },
];

export default function GitHubStats({
    summary = {},
    metrics = {},
}) {
    const values = {
        ...summary,
        ...metrics,
    };

    return (
        <section>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                {cards.map(({ key, label, icon: Icon }) => (
                    <div
                        key={key}
                        className="rounded-xl border border-border-subtle bg-bg-surface p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-text-secondary">
                                {label}
                            </span>

                            <Icon
                                size={16}
                                className="text-text-secondary"
                            />
                        </div>

                        <p className="mt-3 text-2xl font-semibold text-text-primary">
                            {Number(values[key] || 0).toLocaleString()}
                        </p>
                    </div>
                ))}
            </div>
        </section>
    );
}