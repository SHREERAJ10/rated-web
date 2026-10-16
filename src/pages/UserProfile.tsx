import Post from "@/components/Post";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { fetchUserByUsername, fetchUserPosts } from "@/api/user.api";
import Loader from "@/components/Loader";
import { useParams } from "react-router-dom";
import { logout } from "@/utils/AuthHandlers";
import { toast } from "sonner";

function UserProfile() {
  const { user } = useContext(AuthContext);

  const observerTarget = useRef(null);
  const username = useParams<string>().username;

  const { data: currUser } = useQuery({
    queryKey: ["user", username],
    queryFn: () => fetchUserByUsername(user!, username!),
    enabled: !!user,
  });

  const {
    data: posts,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["userPosts", username],
    queryFn: ({ pageParam }) =>
      fetchUserPosts(user!, username as string, pageParam),
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
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (isLoading || !currUser) return <Loader />;
  if (error) {
    return <span>An error occured shit</span>;
  }
  return (
    <section className="min-h-screen px-5 py-8 font-primary text-[#1A1A1A] md:px-16 md:pt-12 md:pb-6">
      <div className="mx-auto max-w-3xl">
        <div className="border-b border-border-subtle pb-5">
          <h1 className="text-2xl font-medium tracking-[-0.01em] md:text-[32px] md:leading-[1.2]">
            Profile
          </h1>
        </div>

        <div className="relative flex flex-col gap-4 border-b border-border-subtle py-6 sm:flex-row sm:items-center md:gap-8 md:py-8">
          <div className="h-20 w-20 shrink-0 rounded-full border border-border-subtle bg-surface-container-lowest p-0.5 sm:h-16 sm:w-16 md:h-20 md:w-20 md:p-1">
            {currUser.pfpUrl ? (
              <img
                src={currUser.pfpUrl}
                alt={currUser.displayName}
                className="h-full w-full rounded-full bg-surface-container object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center rounded-full bg-surface-container text-lg font-medium text-on-surface-variant">
                {currUser.displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
              <h2 className="truncate text-base font-medium tracking-[-0.01em] text-on-surface md:text-lg">
                {currUser.displayName}
              </h2>
              <span className="truncate text-xs text-on-surface-variant md:text-sm">
                @{username}
              </span>
            </div>
            {currUser.bio && (
              <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-on-surface md:mt-2 md:text-base">
                {currUser.bio}
              </p>
            )}
          </div>
          {user?.uid === currUser.uid && (
            <button
              className="absolute right-0 top-6 h-9 shrink-0 cursor-pointer rounded-lg px-3 text-sm text-[#1a1a1a] hover:bg-surface-warm sm:static md:hidden"
              onClick={async () => {
                try {
                  await logout();
                } catch {
                  toast.error("Something went wrong!");
                }
              }}
            >
              Logout
            </button>
          )}
        </div>

        <section className="flex flex-col items-center gap-y-6 pt-12">
          {posts?.length != 0 &&
            posts?.map((post) => {
              return <Post key={post.id} post={post} />;
            })}
          <div ref={observerTarget} className="min-h-4">
            {isFetchingNextPage && <span>Loading...</span>}
            {!hasNextPage && <span>No more posts</span>}
          </div>
        </section>
      </div>
    </section>
  );
}

export default UserProfile;
