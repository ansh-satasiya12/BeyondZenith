import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Layers } from "lucide-react";

function HeroSection() {
    return (
        <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-28 lg:pb-32">
            <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 transform-gpu blur-3xl" aria-hidden="true">
                <div
                    className="aspect-[1155/678] w-[36.125rem] max-w-none bg-gradient-to-tr from-brand-500/20 to-brand-400/5 opacity-40 sm:w-[72.1875rem]"
                    style={{
                        clipPath:
                            "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
                    }}
                />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl text-center">
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border-subtle bg-bg-surface px-3.5 py-1.5 text-xs font-medium text-text-secondary shadow-sm">
                        <Layers size={14} className="text-brand-400" />
                        <span>Unified Developer Profile & Analytics</span>
                        <ChevronRight size={12} className="text-text-secondary" />
                    </div>

                    <h1 className="font-display text-4xl font-bold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
                        Your Developer Journey,{" "}
                        <span className="text-brand-400">Beyond One Platform.</span>
                    </h1>
                    <p className="mt-6 font-body text-base text-text-secondary sm:text-lg sm:leading-8">
                        BeyondZenith is a unified developer profile and analytics platform that brings your GitHub, Codeforces, and LeetCode activity into one place. Connect your profiles and get a unified view of your development activity, coding progress, and achievements.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-4">
                        <Link
                            to="/register"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand-500 px-6 py-3 font-body text-sm font-medium text-white transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-bg-canvas sm:w-auto"
                        >
                            <span>Get Started</span>
                            <ArrowRight size={16} />
                        </Link>
                        <Link
                            to="/login"
                            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-border-subtle bg-bg-surface px-6 py-3 font-body text-sm font-medium text-text-primary transition hover:border-brand-500/50 hover:bg-bg-surface-raised sm:w-auto"
                        >
                            Sign In
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
