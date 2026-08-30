import { MessageCircle } from "lucide-react";
import CarouselWithPagination from "./carousel-06";
import PostLike from "./PostLike";
import { Link, useLocation } from "react-router-dom";
import PostRating from "./PostRating";

function Post({ post }) {
  const location = useLocation();

  return (
    <>
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
        <section className="w-full flex justify-between items-center">
          <div className="flex justify-center gap-x-4">
            <PostLike postId={post.id} />
            <span className="flex justify-center gap-1 w-full">
              <Link
                to={`/post/${post.id}`}
                state={{ backgroundLocation: location }}
              >
                <MessageCircle className="cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out" />
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
        <section className="flex gap-x-5">
          <div className="flex gap-x-0.5">
            <span>{post.ratingScore.data.score}</span>
            <span>/</span>
            <span>{post.ratingScore.data.total}</span>
          </div>
          <div>
            <span>{post.ratingScore.count} Ratings</span>
          </div>
        </section>

        <div>
          <span className="font-semibold">{post.author.displayName}</span>
          <p>{post.caption}</p>
        </div>
      </div>
    </>
  );
}

export default Post;
