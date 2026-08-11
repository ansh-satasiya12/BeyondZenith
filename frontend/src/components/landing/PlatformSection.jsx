import { GitBranch, Code2, Code, CheckCircle2 } from "lucide-react";

const platforms = [
    {
        name: "GitHub",
        icon: GitBranch,
        tagline: "Software & Open Source",
        description: "Aggregate development contributions and repository metrics seamlessly.",
        points: [
            "Repositories & Star metrics",
            "Commit & Contribution history",
            "Development activity overview",
        ],
        badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    {
        name: "Codeforces",
        icon: Code2,
        tagline: "Competitive Programming",
        description: "Track contest performance, rating changes, and problem-solving benchmarks.",
        points: [
            "Current & Max Rating history",
            "Contest performance stats",
            "Problem-solving metrics",
        ],
        badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    {
        name: "LeetCode",
        icon: Code,
        tagline: "Algorithmic Mastery",
        description: "Analyze technical interview readiness and problem difficulty distribution.",
        points: [
            "Total Problems Solved",
            "Difficulty Breakdown (Easy, Med, Hard)",
            "Global Ranking & Progress",
        ],
        badgeColor: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    },
];

function PlatformSection() {
    return (
        <section className="border-t border-border-subtle bg-bg-canvas py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                        Supported Platforms
                    </h2>
                    <p className="mt-3 font-body text-sm text-text-secondary sm:text-base">
                        Consolidate your developer identity across top coding platforms.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
                    {platforms.map((platform) => {
                        const Icon = platform.icon;
                        return (
                            <div
                                key={platform.name}
                                className="group relative flex flex-col justify-between rounded-xl border border-border-subtle bg-bg-surface p-6 transition duration-200 hover:border-brand-500/40 hover:bg-bg-surface-raised"
                            >
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-canvas text-brand-400">
                                                <Icon size={20} />
                                            </div>
                                            <h3 className="font-display text-xl font-semibold text-text-primary">
                                                {platform.name}
                                            </h3>
                                        </div>
                                        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${platform.badgeColor}`}>
                                            {platform.tagline}
                                        </span>
                                    </div>

                                    <p className="mt-4 font-body text-sm text-text-secondary">
                                        {platform.description}
                                    </p>

                                    <ul className="mt-6 space-y-3">
                                        {platform.points.map((point) => (
                                            <li key={point} className="flex items-center gap-2.5 text-xs font-medium text-text-primary">
                                                <CheckCircle2 size={15} className="text-brand-400 shrink-0" />
                                                <span>{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default PlatformSection;
