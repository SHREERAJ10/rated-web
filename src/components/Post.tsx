import { startTransition, useContext, useOptimistic, useState } from "react";
import CarouselWithPagination from "./carousel-06";
import { Heart, MessageCircle } from "lucide-react";
import { createRecord, deleteRecord } from "@/utils/api";
import { AuthContext } from "@/context/AuthContext";

function Post({ post }) {
  const { user } = useContext(AuthContext);
  const [isPostLiked, setIsPostLiked] = useState<boolean>(post.isLikedByUser);
  const [optimisticIsPostLiked, setOptimisticIsPostLiked] =
    useOptimistic(isPostLiked);
  const [likeCount, setLikeCount] = useState<number>(post.like.count);
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
        likeStatus = await deleteRecord(user, `/post/${post.id}/unlike`);
      } else {
        likeStatus = await createRecord(user, `/post/${post.id}/like`, {});
      }
      setIsPostLiked(likeStatus.postLiked);

      setLikeCount(likeStatus.likeCount);
    });
  };

  return (
    <div className="inline-flex flex-col items-start gap-y-2">
      <div className="flex gap-x-2">
        <div className="w-9 h-9 rounded-full justify-center items-center">
          <img
            src={post.author.pfpUrl}
            alt="pfp"
            className="object-contain rounded-full"
          />
        </div>
        <span>{post.author.displayName}</span>
      </div>

      <CarouselWithPagination media={post.media} />

      <div className="flex justify-center gap-x-5">
        <span className="flex justify-center gap-1">
          <button onClick={updateLike}>
            <Heart
              className={`cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out ${optimisticIsPostLiked && "fill-black"}`}
            />
          </button>
          <span>{optimisticLikeCount}</span>
        </span>
        <span className="flex justify-center gap-1">
          <MessageCircle className="cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" />
          <span>{post.comment.count}</span>
        </span>
      </div>

      <div>
        <span className="font-semibold">{post.author.displayName}</span>
        <p>{post.caption}</p>
      </div>
    </div>
  );
}

export default Post;
