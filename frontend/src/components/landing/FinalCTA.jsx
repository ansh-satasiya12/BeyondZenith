import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

function FinalCTA() {
    return (
        <section className="border-t border-border-subtle bg-bg-surface py-16 sm:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface-raised px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="pointer-events-none absolute -left-12 -top-12 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-brand-400/10 blur-3xl" />

                    <h2 className="relative font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl lg:text-4xl">
                        Ready to see your developer journey in one place?
                    </h2>
                    <p className="relative mx-auto mt-4 max-w-xl font-body text-sm text-text-secondary sm:text-base">
                        Join developers who track their GitHub, Codeforces, and LeetCode growth seamlessly.
                    </p>

                    <div className="relative mt-8 flex justify-center">
                        <Link
                            to="/register"
                            className="inline-flex items-center gap-2 rounded-md bg-brand-500 px-6 py-3 font-body text-sm font-medium text-white transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-bg-canvas"
                        >
                            <span>Create Your Profile</span>
                            <ArrowRight size={16} />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default FinalCTA;
