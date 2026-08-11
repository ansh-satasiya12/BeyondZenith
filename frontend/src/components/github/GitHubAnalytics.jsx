import {
    BarChart3,
    Code2,
} from "lucide-react";

export default function GitHubAnalytics({
    summary = {},
    metrics = {},
    languageDistribution = [],
}) {
    const languages = [...languageDistribution]
        .sort((a, b) => (b.count || 0) - (a.count || 0))
        .slice(0, 8);

    const maxCount = Math.max(
        ...languages.map((item) => item.count || 0),
        1
    );

    return (
        <section className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-text-primary">
                        Analytics
                    </h2>

                    <p className="mt-1 text-sm text-text-secondary">
                        Overview of your GitHub repository portfolio.
                    </p>
                </div>

                <BarChart3
                    size={20}
                    className="text-text-secondary"
                />
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
                    <h3 className="font-medium text-text-primary">
                        Repository distribution
                    </h3>

                    <div className="mt-5 space-y-4">
                        <Distribution
                            label="Public"
                            value={summary.public}
                            total={summary.total}
                        />

                        <Distribution
                            label="Private"
                            value={summary.private}
                            total={summary.total}
                        />

                        <Distribution
                            label="Forked"
                            value={summary.forked}
                            total={summary.total}
                        />

                        <Distribution
                            label="Archived"
                            value={summary.archived}
                            total={summary.total}
                        />
                    </div>
                </div>

                <div className="rounded-xl border border-border-subtle bg-bg-surface p-5">
                    <div className="flex items-center gap-2">
                        <Code2 size={17} />

                        <h3 className="font-medium text-text-primary">
                            Languages
                        </h3>
                    </div>

                    {languages.length === 0 ? (
                        <p className="mt-5 text-sm text-text-secondary">
                            No language data available.
                        </p>
                    ) : (
                        <div className="mt-5 space-y-4">
                            {languages.map((item) => {
                                const percentage =
                                    ((item.count || 0) / maxCount) * 100;

                                return (
                                    <div key={item.language}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="text-text-primary">
                                                {item.language}
                                            </span>

                                            <span className="text-text-secondary">
                                                {item.count}
                                            </span>
                                        </div>

                                        <div className="h-2 overflow-hidden rounded-full bg-bg-surface-raised">
                                            <div
                                                className="h-full rounded-full bg-brand-500"
                                                style={{
                                                    width: `${percentage}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function Distribution({ label, value = 0, total = 0 }) {
    const percentage = total
        ? Math.round((value / total) * 100)
        : 0;

    return (
        <div>
            <div className="mb-1 flex justify-between text-sm">
                <span className="text-text-primary">
                    {label}
                </span>

                <span className="text-text-secondary">
                    {value || 0} ({percentage}%)
                </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-bg-surface-raised">
                <div
                    className="h-full rounded-full bg-brand-500"
                    style={{
                        width: `${percentage}%`,
                    }}
                />
            </div>
        </div>
    );
}