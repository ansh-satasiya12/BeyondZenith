import {
    GitFork,
    Star,
    Eye,
    ExternalLink,
} from "lucide-react";

export default function RepositoryCard({
    repository,
    onClick,
}) {
    return (
        <article
            onClick={onClick}
            className="cursor-pointer rounded-xl border border-border-subtle bg-bg-surface p-5 transition hover:border-brand-500/40 hover:bg-bg-surface-raised"
        >
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                    <h3 className="truncate font-semibold text-text-primary">
                        {repository.name}
                    </h3>

                    <p className="mt-1 line-clamp-2 text-sm text-text-secondary">
                        {repository.description ||
                            "No description available."}
                    </p>
                </div>

                <span className="shrink-0 rounded-full border border-border-subtle px-2.5 py-1 text-xs capitalize text-text-secondary">
                    {repository.visibility}
                </span>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-text-secondary">
                <span>
                    {repository.language || "Unknown"}
                </span>

                <span className="inline-flex items-center gap-1">
                    <Star size={13} />
                    {repository.stars || 0}
                </span>

                <span className="inline-flex items-center gap-1">
                    <GitFork size={13} />
                    {repository.forks || 0}
                </span>

                <span className="inline-flex items-center gap-1">
                    <Eye size={13} />
                    {repository.watchers || 0}
                </span>

                {repository.isFork && (
                    <span>Fork</span>
                )}

                {repository.isArchived && (
                    <span>Archived</span>
                )}

                {repository.htmlUrl && (
                    <a
                        href={repository.htmlUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="ml-auto inline-flex items-center gap-1 hover:text-text-primary"
                    >
                        GitHub
                        <ExternalLink size={12} />
                    </a>
                )}
            </div>
        </article>
    );
}