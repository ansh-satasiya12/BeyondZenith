import { UserCheck, BarChart3, TrendingUp, Sparkles } from "lucide-react";

const features = [
    {
        title: "Unified Developer Profile",
        description: "Bring your activity from multiple developer platforms into one profile.",
        icon: UserCheck,
    },
    {
        title: "Developer Analytics",
        description: "Understand your coding and development progress through meaningful statistics.",
        icon: BarChart3,
    },
    {
        title: "Progress Tracking",
        description: "Track your improvement across repositories, problems, ratings, and activity.",
        icon: TrendingUp,
    },
    {
        title: "Future Intelligence",
        description: "Build toward intelligent insights and recommendations based on your developer data.",
        icon: Sparkles,
    },
];

function FeaturesSection() {
    return (
        <section className="border-t border-border-subtle bg-bg-canvas py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
                        Why Choose BeyondZenith
                    </h2>
                    <p className="mt-3 font-body text-sm text-text-secondary sm:text-base">
                        Engineered to give developers clarity and insight over their multi-platform journey.
                    </p>
                </div>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
                    {features.map((feature) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={feature.title}
                                className="flex flex-col rounded-xl border border-border-subtle bg-bg-surface p-6 transition duration-200 hover:border-brand-500/40 hover:bg-bg-surface-raised"
                            >
                                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle bg-bg-canvas text-brand-400">
                                    <Icon size={20} />
                                </div>
                                <h3 className="font-display text-lg font-semibold text-text-primary">
                                    {feature.title}
                                </h3>
                                <p className="mt-2 font-body text-xs leading-relaxed text-text-secondary sm:text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

export default FeaturesSection;
