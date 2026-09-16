import { fetchSinglePost, likePost, unlikePost } from "@/api/post.api";
import { AuthContext } from "@/context/AuthContext";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useContext } from "react";

interface PostLikeProps {
  postId: string;
  className?: string;
}

function PostLike({ postId, className = "" }: PostLikeProps) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const {
    data: post,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchSinglePost(user!, postId),
    initialData: () => {
      const posts = queryClient.getQueryData(["posts"]);
      return posts?.pages
        .flatMap((page) => page.items)
        .find((post) => post.id == postId);
    },
    enabled: !!user,
  });

  const handleLike = useMutation({
    mutationFn: async () => {
      return post.isLikedByUser
        ? await unlikePost(user, postId)
        : await likePost(user, postId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousInfinitePost = queryClient.getQueryData(["posts"]);
      const previousSinglePost = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;

        return {
          ...oldPost,
          isLikedByUser: !oldPost.isLikedByUser,
          like: {
            count: oldPost.isLikedByUser
              ? oldPost.like.count - 1
              : oldPost.like.count + 1,
          },
        };
      });

      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => ({
            ...page,
            items: page.items.map((oldPost) => {
              if (oldPost.id !== postId) return oldPost;

              return {
                ...oldPost,
                isLikedByUser: !oldPost.isLikedByUser,
                like: {
                  count: oldPost.isLikedByUser
                    ? oldPost.like.count - 1
                    : oldPost.like.count + 1,
                },
              };
            }),
          })),
        };
      });

      return { previousSinglePost, previousInfinitePost };
    },

    onError: (err, context) => {
      console.log(err);
      queryClient.setQueryData(["post", postId], context?.previousSinglePost);
      queryClient.setQueryData(["posts"], context?.previousInfinitePost);
    },
  });

  return (
    <div className={`flex justify-center items-center gap-1.5 ${className}`}>
      <button onClick={() => handleLike.mutate()} className="cursor-pointer">
        <Heart
          className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-200 ease-in-out hover:scale-105 ${
            post.isLikedByUser ? "fill-red-500 text-red-500" : "text-on-surface"
          }`}
          strokeWidth={1.75}
        />
      </button>
      <span className="text-[14px] sm:text-[15px] text-on-surface">
        {post.like.count}
      </span>
    </div>
  );
}

export default PostLike;
