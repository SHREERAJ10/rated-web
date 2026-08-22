import { likePost, unlikePost } from "@/api/post.api";
import { AuthContext } from "@/context/AuthContext";
import { Heart } from "lucide-react";
import { startTransition, useContext, useOptimistic, useState } from "react";

interface PostLikeProps {
  postId: string;
  isLikedByUser: boolean;
  totalLikeCount: number;
  className?: string;
}

function PostLike({
  postId,
  isLikedByUser,
  totalLikeCount,
  className = "",
}: PostLikeProps) {
  const { user } = useContext(AuthContext);
  const [isPostLiked, setIsPostLiked] = useState<boolean>(isLikedByUser);
  const [optimisticIsPostLiked, setOptimisticIsPostLiked] =
    useOptimistic(isPostLiked);
  const [likeCount, setLikeCount] = useState<number>(totalLikeCount);
  const [optimisticLikeCount, setOptimisticLikeCount] = useOptimistic(
    likeCount,
    (currLikeCount, action: string): number => {
      switch (action) {
        case "ADD":
          return currLikeCount + 1;
        case "REMOVE":
          return currLikeCount - 1;
      }
    },
  );

  const updateLike = () => {
    startTransition(async () => {
      setOptimisticIsPostLiked(!optimisticIsPostLiked);
      if (optimisticIsPostLiked) {
        setOptimisticLikeCount("REMOVE");
      } else {
        setOptimisticLikeCount("ADD");
      }
      let likeStatus;
      if (optimisticIsPostLiked) {
        likeStatus = await unlikePost(user, postId);
      } else {
        likeStatus = await likePost(user, postId);
        console.log("post liked")
      }
      setIsPostLiked(likeStatus.postLiked);

      setLikeCount(likeStatus.likeCount);
    });
  };

  return (
    <div className={`flex justify-center gap-1 ${className}`}>
      <button onClick={updateLike}>
        <Heart
          className={`cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${optimisticIsPostLiked && "fill-red-500"}`}
        />
      </button>
      <span>{optimisticLikeCount}</span>
    </div>
  );
}

export default PostLike;
