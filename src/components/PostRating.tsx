import { Star } from "lucide-react";
import { useContext, useState } from "react";
import RatingPicker from "./RatingPicker";
import { useQuery } from "@tanstack/react-query";
import { fetchPosts } from "@/api/post.api";
import { AuthContext } from "@/context/AuthContext";

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
  const { user } = useContext(AuthContext);

  return (
    <div>
      <button
        className="flex justify-center items-center gap-x-0.5 px-1 border-2 border-black/80 rounded-md"
        onClick={() => setShowRatingOption(true)}
      >
        <Star size={18} />
        {isRatedByUser ? (
          <div>
            <span>You Rated {userRatingScore}/10</span>
          </div>
        ) : (
          <>Rate</>
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
