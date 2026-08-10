function TopBar({ title }) {
    return (
        <header className="flex h-16 items-center border-b border-border-subtle bg-bg-canvas px-6">
            <h2 className="font-display text-xl font-semibold text-text-primary">
                {title}
            </h2>
        </header>
    );
}

export default TopBar;