import { useContext, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import { fetchUsers } from "@/api/user.api";
import { AuthContext } from "@/context/AuthContext";

export type User = {
  id: string;
  displayName: string;
  username: string;
  pfpUrl: string;
};

const PAGE_SIZE = 10;

type SearchResponse = { items: User[]; hasMore: boolean };

export default function UserSearch() {
  const { user } = useContext(AuthContext);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<User[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);

  // Debounce the query and reset to the first page when it changes.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const response:SearchResponse = await fetchUsers(user, debouncedQuery, page);
      setUsers(response.items);
      setHasMore(response.hasMore);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, page]);

  return (
    <main className="min-h-screen bg-surface font-sans text-on-surface">
      <div className="mx-auto w-full max-w-216 px-5 pb-16 pt-12 md:px-16 md:pt-20">
        {/* Header */}
        <header className="border-b border-border-subtle pb-6 md:pb-8">
          <h1 className="text-headline-lg-mobile font-medium text-on-surface md:text-headline-lg">
            Search
          </h1>
        </header>

        {/* Search input */}
        <div className="mt-6 flex items-center gap-3 rounded-md border border-border-subtle bg-surface-container-lowest px-4 py-4 transition-colors focus-within:border-primary md:mt-8 md:px-5">
          <Search
            className="h-5 w-5 shrink-0 text-on-surface-variant"
            strokeWidth={1.75}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            aria-label="Search users"
            className="min-w-0 flex-1 bg-transparent text-body-md text-on-surface placeholder:text-on-surface-variant focus:outline-none md:text-body-lg"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 rounded-full p-1 text-on-surface-variant transition-colors hover:text-primary"
            >
              <X className="h-5 w-5" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Results */}
        <section
          aria-busy={loading}
          className="mt-6 overflow-hidden rounded-md border border-border-subtle bg-surface-warm md:mt-8"
        >
          {loading ? (
            <ul>
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 border-b border-border-subtle px-4 py-5 last:border-b-0 md:gap-5 md:px-8 md:py-6"
                >
                  <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-surface-container md:h-17.5 md:w-17.5" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 max-w-[60%] animate-pulse rounded-sm bg-surface-container" />
                    <div className="h-3 w-28 max-w-[40%] animate-pulse rounded-sm bg-surface-container" />
                  </div>
                </li>
              ))}
            </ul>
          ) : users.length === 0 ? (
            <p className="px-4 py-16 text-center text-body-md text-on-surface-variant">
              No users found.
            </p>
          ) : (
            <ul>
              {users.map((user) => (
                <li
                  key={user.id}
                  className="border-b border-border-subtle last:border-b-0"
                >
                  <a
                    href={`/${user.username}`}
                    className="group flex items-center gap-4 px-4 py-5 transition-colors hover:bg-surface-container-low md:gap-5 md:px-8 md:py-6"
                  >
                    <img
                      src={user.pfpUrl}
                      alt=""
                      loading="lazy"
                      className="h-14 w-14 shrink-0 rounded-full bg-surface-container object-cover md:h-[4.375rem] md:w-[4.375rem]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body-lg font-normal text-on-surface md:text-headline-md">
                        {user.displayName}
                      </p>
                      <p className="truncate text-body-sm text-on-surface-variant md:text-body-md">
                        @{user.username}
                      </p>
                    </div>
                    <ArrowRight
                      className="h-5 w-5 shrink-0 text-outline-variant transition-all group-hover:translate-x-0.5 group-hover:text-on-surface"
                      strokeWidth={1.5}
                    />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Pagination */}
        <nav
          aria-label="Pagination"
          className="mt-8 flex items-center justify-between gap-4 md:mt-10"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || loading}
            className="inline-flex items-center gap-2 rounded border border-border-subtle bg-transparent px-5 py-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:text-outline-variant disabled:hover:bg-transparent"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage((p) => p + 1)}
            disabled={!hasMore || loading}
            className="inline-flex items-center gap-2 rounded border border-border-subtle bg-transparent px-5 py-3 text-label-md text-on-surface transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:text-outline-variant disabled:hover:bg-transparent"
          >
            Next
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>
        </nav>
      </div>
    </main>
  );
}
