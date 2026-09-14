import { MessageCircle } from "lucide-react";
import CarouselWithPagination from "./carousel-06";
import PostLike from "./PostLike";
import { Link, useLocation } from "react-router-dom";
import PostRating from "./PostRating";
import { relativeTime } from "@/utils/relativeTime";

function Post({ post }) {
  const location = useLocation();

  const postTimestamp = relativeTime(new Date(post.createdAt).getTime());

  return (
    <>
      <div className="w-full max-w-117.5 mx-auto bg-surface-container-lowest border border-border-subtle rounded-[12px] overflow-hidden font-primary">
        <div className="inline-flex flex-col items-start gap-y-2.5 sm:gap-y-3 w-full">
          {/* Header */}
          <div className="flex items-center gap-x-2 px-3 sm:px-4 pt-3 sm:pt-4">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full justify-center items-center overflow-hidden shrink-0">
              <img
                src={post.author.pfpUrl}
                alt="pfp"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-[14px] sm:text-[15px] font-medium text-on-surface">
              {post.author.displayName}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="text-[12px] sm:text-[13px] text-on-surface-variant">
              {postTimestamp}
            </span>
          </div>

          {/* Media */}
          <div className="w-full px-3 sm:px-4">
            <CarouselWithPagination media={post.media} />
          </div>

          <section className="w-full flex justify-between items-center px-3 sm:px-4">
            <div className="flex justify-center items-center gap-x-3 sm:gap-x-4">
              <PostLike postId={post.id} />
              <span className="flex justify-center items-center gap-1.5 w-full text-[14px] sm:text-[15px] text-on-surface">
                <Link
                  to={`/post/${post.id}`}
                  state={{ backgroundLocation: location }}
                >
                  <MessageCircle
                    className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out"
                    strokeWidth={1.75}
                  />
                </Link>
                <span>{post.comment.count}</span>
              </span>
            </div>
            <PostRating
              postId={post.id}
              isRatedByUser={post.isRatedByUser}
              userRatingScore={post.ratingScore.userRatingScore}
            />
          </section>

          <section className="flex gap-x-4 sm:gap-x-5 px-3 sm:px-4 text-[12px] sm:text-[13px] text-on-surface-variant">
            <div className="flex gap-x-0.5">
              <span className="text-on-surface font-medium">
                {post.ratingScore.data.score}
              </span>
              <span>/</span>
              <span>{post.ratingScore.data.total}</span>
            </div>
            <div>
              <span>{post.ratingScore.count} Ratings</span>
            </div>
          </section>

          <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-[14px] sm:text-[15px] leading-[1.6] text-on-surface">
            <span className="font-semibold">{post.author.displayName}</span>{" "}
            <span className="text-on-surface-variant">{post.caption}</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default Post;