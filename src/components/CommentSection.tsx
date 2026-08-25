import CarouselWithPagination from "./carousel-06";
import { useContext, useEffect } from "react";
import { AuthContext } from "@/context/AuthContext";
import { fetchComments, fetchPosts, postComment } from "@/api/post.api";
import Comment from "./Comment";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostLike from "./PostLike";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchUser } from "@/api/user.api";

interface FormInput {
  comment: string;
}

export function CommentSection() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { postId } = useParams();
  const navigate = useNavigate();

  const {
    data: post,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(user),
    select: (data) => data.items.find((post) => post.id == postId),
  });

  const { data: comments } = useQuery({
    queryKey: ["comments"],
    queryFn: () => fetchComments(user, postId),
  });

  const { data: currUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(user),
  });

  const addComment = useMutation({
    mutationFn: async (newComment) => {
      const comment = await postComment(user, postId, newComment);
      console.log(comment);
      return comment;
    },
    onMutate: async (newComment: object) => {
      await queryClient.cancelQueries({ queryKey: ["comments"] });
      const previousComments = queryClient.getQueryData(["comments"]);

      const optimisticComment = {
        id: crypto.randomUUID(),
        postId: postId,
        comment: newComment.comment,
        createdAt: new Date(),
        commentor: {
          id: currUser.id,
          displayName: currUser.displayName,
          username: currUser.username,
          pfpUrl: currUser.pfpUrl,
        },
      };

      queryClient.setQueryData(["comments"], (oldComments) => {
        return {
          ...oldComments,
          items: [optimisticComment, ...oldComments.items],
          totalCount: oldComments.totalCount + 1,
        };
      });

      return { previousComments };
    },
    onError: (err, newComment, context) => {
      console.log(err);
      queryClient.setQueryData(["comments"], context.previousComments);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const { register, handleSubmit } = useForm();

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (user) {
        addComment.mutate(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "";
      queryClient.removeQueries({ queryKey: ["comments"] });
      queryClient.invalidateQueries({ queryKey: ["comments"] });
    };
  }, []);

  if (isLoading) return;
  if (error) return <span>An error occured</span>;
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
              {comments.items.map((comment) => {
                return <Comment key={comment.id} comment={comment} />;
              })}
            </section>
          )}
          <section className="grow border border-red-500 flex flex-col justify-between items-start">
            <div>
              <PostLike postId={post.id} />
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
