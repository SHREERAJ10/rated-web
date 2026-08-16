import { CreatePost } from "@/components/CreatePost";
import { logout } from "../utils/AuthHandlers";
import Post from "@/components/Post";
import { useContext, useEffect, useState } from "react";
import { getData } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

function Feed() {
  const { user } = useContext(AuthContext);
  const [posts, setPosts] = useState<object[] | null>(null);

  useEffect(() => {
    (async () => {
      const posts = await getData(user, "/post");
      setPosts(posts.items);
    })();
  }, []);

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
          posts?.map((post) => {
            return <Post key={post.id} post={post}  />;
          })}
      </section>
    </>
  );
}

export default Feed;
