import { CreatePost } from "@/components/CreatePost";
import { logout } from "../utils/AuthHandlers";
import Post from "@/components/Post";
import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/api/post.api";

function Feed() {
  const { user } = useContext(AuthContext);
  const {
    data: posts,
    error,
    isLoading,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => await fetchPosts(user),
  });

  if (isLoading) return;
  if (error) return <span>An error occured</span>;

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
        {posts?.items.length != 0 &&
          posts?.items.map((post) => {
            return <Post key={post.id} post={post} />;
          })}
      </section>
    </>
  );
}

export default Feed;
