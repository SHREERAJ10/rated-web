import { fetchPosts, likePost, unlikePost } from "@/api/post.api";
import { AuthContext } from "@/context/AuthContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { useContext } from "react";

interface PostLikeProps {
  postId: string;
  className?: string;
}

function PostLike({ postId, className = "" }: PostLikeProps) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { data: post } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(user),
    select: (data) => data.items.find((post) => post.id == postId),
  });

  const postLike = useMutation({
    mutationFn: async () => {
      return post.isLikedByUser
        ? await unlikePost(user, postId)
        : await likePost(user, postId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousPosts = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (posts) => {
        posts.items = posts.items.map((oldPost) => {
          if (oldPost.id == postId) {
            return {
              ...oldPost,
              isLikedByUser: !oldPost.isLikedByUser,
              like: {
                count: oldPost.isLikedByUser
                  ? oldPost.like.count - 1  
                  : oldPost.like.count + 1,
              },
            };
          } else {
            return oldPost;
          }
        });
      });

      return { previousPosts };
    },

    onError: (err, newComment, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <div className={`flex justify-center gap-1 ${className}`}>
      <button onClick={() => postLike.mutate()}>
        <Heart
          className={`cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${post.isLikedByUser && "fill-red-500"}`}
        />
      </button>
      <span>{post.like.count}</span>
    </div>
  );
}

export default PostLike;
