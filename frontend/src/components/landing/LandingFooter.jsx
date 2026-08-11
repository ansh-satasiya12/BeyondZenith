import { Link } from "react-router-dom";

function LandingFooter() {
    return (
        <footer className="border-t border-border-subtle bg-bg-canvas py-8">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
                <div>
                    <span className="font-display text-lg font-bold text-text-primary">
                        BeyondZenith
                    </span>
                    <p className="font-body text-xs text-text-secondary">
                        Unified developer analytics.
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    <Link
                        to="/login"
                        className="font-body text-xs font-medium text-text-secondary transition hover:text-text-primary"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="font-body text-xs font-medium text-text-secondary transition hover:text-text-primary"
                    >
                        Register
                    </Link>
                </div>
            </div>
        </footer>
    );
}

export default LandingFooter;
