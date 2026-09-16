import CarouselWithPagination from "./carousel-06";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import {
  fetchComments,
  fetchSinglePost,
  postComment,
} from "@/api/post.api";
import Comment from "./Comment";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostLike from "./PostLike";
import { useNavigate, useParams } from "react-router-dom";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchUser } from "@/api/user.api";
import { relativeTime } from "@/utils/relativeTime";
import { MessageCircle, AlertTriangle, Share2 } from "lucide-react";

interface FormInput {
  comment: string;
}

export function CommentSection() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();

  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerRef, ...commentField } = register("comment");

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const { data: comments } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => fetchComments(user!, postId),
    enabled: !!user,
  });

  const {
    data: post,
    error,
  } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchSinglePost(user!, postId),
    initialData: () => {
      const posts = queryClient.getQueryData(["posts"]);
      return posts?.pages
        .flatMap((page) => page.items)
        .find((post) => post.id == postId);
    },
    enabled: !!user,
  });

  const { data: currUser } = useQuery({
    queryKey: ["user"],
    queryFn: () => fetchUser(user),
    enabled: !!user,
  });

  const onComment = useMutation({
    mutationFn: async (newComment) => {
      const comment = await postComment(user, postId, newComment);
      return comment;
    },

    onMutate: async (newComment: object) => {
      await queryClient.cancelQueries({ queryKey: ["comments", postId] });
      await queryClient.cancelQueries({ queryKey: ["post", postId] });
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const previousComments = queryClient.getQueryData(["comments", postId]);
      const previousSinglePost = queryClient.getQueryData(["post", postId]);
      const previousInfinitePost = queryClient.getQueryData(["posts"]);

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

      queryClient.setQueryData(["comments", postId], (oldComments) => {
        return {
          ...oldComments,
          items: [optimisticComment, ...oldComments.items],
          totalCount: oldComments.totalCount + 1,
        };
      });

      //update single post
      queryClient.setQueryData(["post", postId], (oldPost) => {
        if (!oldPost) return oldPost;

        return {
          ...oldPost,
          comment: {
            count: oldPost.comment.count + 1,
          },
        };
      });

      //update infinite post
      queryClient.setQueryData(["posts"], (oldPosts) => {
        if (!oldPosts) return oldPosts;

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => ({
            ...page,
            items: page.items.map((oldPost) => {
              if (oldPost.id !== postId) return oldPost;

              return {
                ...oldPost,
                comment: {
                  count: oldPost.comment.count + 1,
                },
              };
            }),
          })),
        };
      });

      return { previousComments, previousSinglePost, previousInfinitePost };
    },

    onError: (err, context) => {
      console.log(err);
      queryClient.setQueryData(["comments", postId], context.previousComments);
      queryClient.setQueryData(["post", postId], context.previousSinglePost);
      queryClient.setQueryData(["posts"], context.previousInfinitePost);
    },
  });

  const postTimestamp = relativeTime(new Date(post?.createdAt).getTime());

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (user) {
        if (data.comment.trim() !== "") {
          onComment.mutate(data);
        }
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

  // if (isLoading) return;
  if (error) {
    console.log(error);
  }
  if (!post) {
    return <div>Loading...</div>;
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
      <section className="bg-surface-container-lowest overflow-hidden w-full h-full sm:h-[calc(100vh-3rem)] sm:min-w-[calc(100vw-8rem)] sm:rounded-[12px] grid grid-cols-1 md:grid-cols-2 items-stretch p-0 gap-0 font-primary">
        <div className="hidden md:flex bg-surface-container-high items-center justify-center h-full">
          <CarouselWithPagination media={post.media} className="max-w-xl" />
        </div>

        <section className="flex flex-col h-full min-h-0">
          {/* Post header */}
          <section className="px-5 py-4 flex items-center gap-x-2.5 border-b border-border-subtle shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <img
                src={post.author.pfpUrl}
                alt="pfp"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-semibold text-on-surface leading-tight">
                {post.author.displayName}
              </span>
              <span className="text-[13px] text-on-surface-variant leading-tight">
                {postTimestamp}
              </span>
            </div>
          </section>

          {/* Caption - fixed, not scrollable */}
          <section className="px-5 py-4 flex gap-x-2.5 items-start border-b border-border-subtle shrink-0">
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <img
                src={post.author.pfpUrl}
                alt="pfp"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div className="flex flex-col gap-y-1">
              <p className="text-[14px] leading-[1.5] text-on-surface">
                <span className="font-semibold">{post.author.displayName}</span>{" "}
                <span>{post.caption}</span>
              </p>
              <span className="text-[12px] text-on-surface-variant">
                {postTimestamp}
              </span>
            </div>
          </section>

          {/* Comments - scrollable, hidden scrollbar */}
          {comments && (
            <section className="flex flex-col gap-y-5 px-5 py-4 grow min-h-0 overflow-y-auto scrollbar-none">
              {comments.items.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
            </section>
          )}

          {/* Actions row */}
          <section className="border-t border-border-subtle px-5 py-3 flex items-center gap-x-4 shrink-0">
            <PostLike postId={post.id} />
            <MessageCircle
              className="w-5 h-5 text-on-surface cursor-pointer"
              strokeWidth={1.75}
              onClick={focusCommentInput}
            />
            <Share2
              className="w-5 h-5 text-on-surface cursor-pointer"
              strokeWidth={1.75}
              onClick={handleShare}
            />
            <AlertTriangle
              className="w-5 h-5 text-on-surface cursor-pointer ml-auto"
              strokeWidth={1.75}
            />
          </section>

          {/* Comment input */}
          <form
            className="w-full flex items-center gap-x-3 px-5 py-3.5 border-t border-border-subtle shrink-0"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grow bg-surface-container-low rounded-full px-4 py-2">
              <textarea
                placeholder="Add a comment..."
                rows={1}
                className="w-full bg-transparent outline-none resize-none wrap-break-word scrollbar-none text-[14px] text-on-surface placeholder:text-on-surface-variant"
                {...commentField}
                ref={(el) => {
                  registerRef(el);
                  commentInputRef.current = el;
                }}
              />
            </div>
            <button
              type="submit"
              className="text-[14px] font-semibold text-on-surface shrink-0"
            >
              Post
            </button>
          </form>
        </section>
      </section>
    </div>
  );
}
