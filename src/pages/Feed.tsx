import { CreatePost } from "@/components/CreatePost";
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
    data: posts,
    error,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: ({ pageParam }) => fetchPosts(user, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    maxPages: 3,
    select: (data) => data.pages.flatMap((page) => page.items),
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

  if (isLoading) return;
  if (error) {
    console.log(error);
    return <span>An error occured</span>;
  }

  return (
    <>
      <div className="flex justify-between p-8">
        <button
          className="cursor-pointer"
          onClick={async () => {
            try {
              await logout();
            } catch (err) {
              console.log(err);
            }
          }}
        >
          Logout
        </button>
        <CreatePost />
      </div>
      <section className="flex flex-col items-center gap-y-6">
        {posts?.length != 0 &&
          posts.map((post) => {
            return <Post key={post.id} post={post} />;
          })}
        <div ref={observerTarget}>
          {isFetchingNextPage && <span>Loading...</span>}
          {!hasNextPage && <span>No more posts</span>}
        </div>
      </section>
    </>
  );
}

export default Feed;
