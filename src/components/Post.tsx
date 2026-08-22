import { MessageCircle } from "lucide-react";
import CarouselWithPagination from "./carousel-06";
import PostLike from "./PostLike";
import { Link, useLocation } from "react-router-dom";

function Post({ post }) {
  const location = useLocation();
  if (post.id === "0f219b4f-6585-4af1-99d8-6bd4719fe926") {
    console.log(post);
  }

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

        <div className="flex justify-center gap-x-5">
          <PostLike
            isLikedByUser={post.isLikedByUser}
            postId={post.id}
            totalLikeCount={post.like.count}
          />
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

        <div>
          <span className="font-semibold">{post.author.displayName}</span>
          <p>{post.caption}</p>
        </div>
      </div>
    </>
  );
}

export default Post;
