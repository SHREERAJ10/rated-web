import { fetchNotifications } from "@/api/post.api";
import NotificationItem from "@/components/NotificationItem";
import { AuthContext } from "@/context/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useContext, useEffect, useRef } from "react";

const groups = ["Today", "Yesterday", "This week", "Earlier"];

function getGroup(date: Date) {
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(date)) / 86400000,
  );

  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return "This week";
  return "Earlier";
}

export default function NotificationPage() {
  const { user } = useContext(AuthContext);
  const observerTarget = useRef(null);

  const {
    data: notifications,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: async ({ pageParam }) => fetchNotifications(user, pageParam),
    enabled: !!user,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    select: (data) => {
      return data.pages.flatMap((page) => page.items);
    },
  });

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading) return <span>Loading...</span>;

  return (
    <section className="min-h-screen bg-surface-warm px-5 py-8 font-primary text-[#1A1A1A] md:px-16 md:py-12">
      <div className="mx-auto max-w-3xl">
        <section className="flex items-start justify-between border-b border-border-subtle pb-5">
          <div>
            <h1 className="text-2xl font-medium tracking-[-0.01em] md:text-[32px] md:leading-[1.2]">
              Notifications
            </h1>
            <p className="mt-1 text-sm text-[#666666]">
              Recent activity on your posts
            </p>
          </div>
          <span className="rounded-full border border-border-subtle bg-surface-warm px-3 py-1 text-[13px] font-medium tracking-[0.03em] text-[#666666]">
            Activity
          </span>
        </section>

        <div className="mt-8 divide-y divide-border-subtle overflow-hidden rounded-xl border border-border-subtle bg-white">
          {groups.map((group) => {
            const items = notifications.filter(
              (n) => getGroup(new Date(n.createdAt)) === group,
            );
            if (items.length === 0) return null;

            return (
              <section key={group}>
                <h2 className="border-b border-border-subtle bg-surface-warm px-4 py-3 text-[13px] font-medium uppercase tracking-[0.03em] text-[#666666] md:px-6">
                  {group}
                </h2>
                <div className="divide-y divide-border-subtle">
                  {items.map((n) => (
                    <NotificationItem key={n.id} notification={n} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
        <div ref={observerTarget} className="min-h-4 flex justify-center pt-4">
          {isFetchingNextPage && <span>Loading...</span>}
          {!hasNextPage && <span>No more notifications</span>}
        </div>
      </div>
    </section>
  );
}
