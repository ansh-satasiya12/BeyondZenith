import { Link } from "react-router-dom";

function LandingNavbar() {
    return (
        <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-canvas/90 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-2">
                    <span className="font-display text-xl font-bold tracking-tight text-text-primary">
                        BeyondZenith
                    </span>
                </Link>

                <div className="flex items-center gap-3 sm:gap-4">
                    <Link
                        to="/login"
                        className="rounded-md px-3.5 py-2 font-body text-sm font-medium text-text-secondary transition hover:text-text-primary"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="rounded-md bg-brand-500 px-4 py-2 font-body text-sm font-medium text-white transition hover:bg-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-bg-canvas"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
}

export default LandingNavbar;
