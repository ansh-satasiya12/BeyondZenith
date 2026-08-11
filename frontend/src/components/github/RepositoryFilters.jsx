import { Search } from "lucide-react";

export default function RepositoryFilters({
    search,
    language,
    visibility,
    sortBy,
    order,
    onChange,
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
                <Search
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
                />

                <input
                    value={search}
                    onChange={(e) =>
                        onChange("search", e.target.value)
                    }
                    placeholder="Search repositories..."
                    className="w-full rounded-lg border border-border-subtle bg-bg-surface py-2.5 pl-10 pr-3 text-sm text-text-primary outline-none placeholder:text-text-secondary focus:border-brand-500"
                />
            </div>

            <select
                value={language}
                onChange={(e) =>
                    onChange("language", e.target.value)
                }
                className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none"
            >
                <option value="">All languages</option>
                <option value="JavaScript">JavaScript</option>
                <option value="TypeScript">TypeScript</option>
                <option value="Python">Python</option>
                <option value="Java">Java</option>
                <option value="C++">C++</option>
                <option value="C">C</option>
                <option value="Go">Go</option>
                <option value="HTML">HTML</option>
                <option value="CSS">CSS</option>
            </select>

            <select
                value={visibility}
                onChange={(e) =>
                    onChange("visibility", e.target.value)
                }
                className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none"
            >
                <option value="">All visibility</option>
                <option value="public">Public</option>
                <option value="private">Private</option>
            </select>

            <select
                value={`${sortBy}:${order}`}
                onChange={(e) => {
                    const [newSort, newOrder] =
                        e.target.value.split(":");

                    onChange("sort", {
                        sortBy: newSort,
                        order: newOrder,
                    });
                }}
                className="rounded-lg border border-border-subtle bg-bg-surface px-3 py-2.5 text-sm text-text-primary outline-none"
            >
                <option value="updatedAtGithub:desc">
                    Recently updated
                </option>

                <option value="stars:desc">
                    Most stars
                </option>

                <option value="forks:desc">
                    Most forks
                </option>

                <option value="name:asc">
                    Name A-Z
                </option>
            </select>
        </div>
    );
}