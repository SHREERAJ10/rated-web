import { logout } from "../utils/AuthHandlers";
import Post from "@/components/Post";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/api/post.api";

function Feed() {
  const { user } = useContext(AuthContext);

  const observerTarget = useRef(null);

  const {
    data:posts,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(user!, pageParam),
    enabled: !!user,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    select: (data) => {
      const uniquePostIds = new Set();
      return data.pages
        .flatMap((page) => page.items)
        .filter((post) => {
          if (uniquePostIds.has(post.id)) {
            return false;
          } else {
            uniquePostIds.add(post.id);
            return true;
          }
        });
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

  if (isLoading) return;
  if (error) {
    console.log(error);
    return <span>An error occured shit</span>;
  }

  return (
    <>
      <section className="flex flex-col items-center gap-y-6 pt-12 pb-6">
        {posts?.length != 0 &&
          posts.map((post) => {
            return <Post key={post.id} post={post} />;
          })}
        <div ref={observerTarget} className="min-h-4">
          {isFetchingNextPage && <span>Loading...</span>}
          {!hasNextPage && <span>No more posts</span>}
        </div>
      </section>
    </>
  );
}

export default Feed;
