import { Star } from "lucide-react";
import { useState } from "react";
import RatingPicker from "./RatingPicker";

interface PostRatingProps {
  postId: string;
  isRatedByUser: boolean;
  userRatingScore: number;
}

function PostRating({
  postId,
  isRatedByUser,
  userRatingScore,
}: PostRatingProps) {
  const [showRatingOption, setShowRatingOption] = useState<boolean>(false);

  return (
    <div>
      <button
        className="flex justify-center items-center gap-x-1 px-2.5 py-1 border border-on-surface rounded-[8px] text-[12px] sm:text-[13px] font-medium text-on-surface hover:bg-surface-container-low transition-colors"
        onClick={() => setShowRatingOption(true)}
      >
        <Star
          size={15}
          strokeWidth={2}
          className={isRatedByUser ? "fill-on-surface" : ""}
        />
        {isRatedByUser ? (
          <span>You Rated {userRatingScore}/10</span>
        ) : (
          <span>Rate</span>
        )}
      </button>

      {showRatingOption && (
        <RatingPicker
          onClose={() => {
            setShowRatingOption(false);
          }}
          postId={postId}
          isRatedByUser={isRatedByUser}
        />
      )}
    </div>
  );
}

export default PostRating;
