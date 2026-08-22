import CarouselWithPagination from "./carousel-06";
import {
  startTransition,
  useContext,
  useEffect,
  useOptimistic,
  useState,
} from "react";
import { AuthContext } from "@/context/AuthContext";
import { getComments, getPost, postComment } from "@/api/post.api";
import Comment from "./Comment";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostLike from "./PostLike";
import { useNavigate, useParams } from "react-router-dom";

interface FormInput {
  comment: string;
}

export function CommentSection() {
  const { user } = useContext(AuthContext);

  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<[object] | null>(null);
  const [comments, setComments] = useState<[object] | null>(null);
  const [optimisticComments, setOptimisticComments] = useOptimistic(
    comments,
    (currComments, newComment): [object] => {
      return [newComment, ...currComments];
    },
  );
  const { register, handleSubmit } = useForm();

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (user) {
        const optimisticComment = {
          id: crypto.randomUUID(),
          postId: post.id,
          comment: data.comment,
          createdAt: new Date(),
        };
        startTransition(async () => {
          setOptimisticComments(optimisticComment);
          const comment = await postComment(user, post.id, data);
          setComments((prev) => [comment, ...prev]);
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user) {
      document.body.style.overflow = "hidden";
      (async () => {
        const post = await getPost(user, postId);
        const comments = await getComments(user, postId);
        setPost(post);
        setComments(comments.items);
      })();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [user]);

  if (!post) {
    return;
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 w-full h-full flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          navigate("/");
        }
      }}
    >
      <section className="bg-white h-[calc(100vh-3rem)] min-w-[calc(100vw-8rem)] grid grid-cols-2 items-center p-0 gap-0">
        <CarouselWithPagination media={post.media} className="max-w-xl" />
        <section className="flex flex-col border border-black h-full">
          <section className="pb-2 flex flex-col gap-y-1.5 border border-red-500">
            <div className="flex gap-x-2 items-center">
              <div className="w-9 h-9 rounded-full justify-center items-center">
                <img
                  src={post.author.pfpUrl}
                  alt="pfp"
                  className="object-contain rounded-full"
                />
              </div>
              <span>{post.author.displayName}</span>
            </div>
            <div>
              <p>{post.caption}</p>
            </div>
          </section>

          {comments && (
            <section className="flex flex-col gap-y-2 border border-black h-[70%] overflow-y-auto scrollbar-none">
              {optimisticComments.map((comment) => {
                return <Comment key={comment.id} comment={comment} />;
              })}
            </section>
          )}
          <section className="grow border border-red-500 flex flex-col justify-between items-start">
            <div>
              <PostLike
                postId={post.id}
                isLikedByUser={post.isLikedByUser}
                totalLikeCount={post.like.count}
              />
            </div>
            <form
              className="w-full flex justify-between"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="border border-black grow">
                <textarea
                  placeholder="Add a comment"
                  className="w-full outline-none resize-none wrap-break-word scrollbar-none"
                  {...register("comment")}
                />
              </div>
              <button type="submit" className="w-16 border border-black">
                Post
              </button>
            </form>
          </section>
        </section>
      </section>
    </div>
  );
}
