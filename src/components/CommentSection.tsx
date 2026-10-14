import CarouselWithPagination from "./carousel-06";
import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "@/context/AuthContext";
import { fetchComments, fetchSinglePost, postComment } from "@/api/post.api";
import Comment from "./Comment";
import { useForm, type SubmitHandler } from "react-hook-form";
import PostLike from "./PostLike";
import { useNavigate, useParams } from "react-router-dom";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fetchUser } from "@/api/user.api";
import { relativeTime } from "@/utils/relativeTime";
import { MessageCircle, Share2 } from "lucide-react";
import Loader from "./Loader";
import { toast } from "sonner";
import type { User } from "firebase/auth";

interface FormInput {
  comment: string;
}

export function CommentSection() {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const observerTarget = useRef(null);

  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { register, handleSubmit, reset } = useForm();

  const commentInputRef = useRef<HTMLTextAreaElement | null>(null);
  const { ref: registerRef, ...commentField } = register("comment");

  const focusCommentInput = () => {
    commentInputRef.current?.focus();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  const {
    data: comments,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: ({ pageParam }) =>
      fetchComments(user!, postId as string, pageParam),
    initialPageParam: 0,
    enabled: !!user,
    getNextPageParam: (lastPage) => lastPage.cursor ?? undefined,
    select: (data) => {
      return data.pages.flatMap((page) => page.items);
    },
  });

  const { data: post, error } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => fetchSinglePost(user!, postId as string),
    initialData: () => {
      const posts: { pages: any[] } = queryClient.getQueryData(["posts"]);
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
      const comment = await postComment(
        user as User,
        postId as string,
        newComment,
      );
      reset();
      return comment;
    },

    onMutate: async (newComment: { comment: string }) => {
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

      queryClient.setQueryData(
        ["comments", postId],
        (oldComments: { pages: any[] }) => {
          if (!oldComments) return oldComments;

          const updatedComments = [...oldComments.pages];

          if (updatedComments.length > 0) {
            updatedComments[0] = {
              ...updatedComments[0],
              items: [optimisticComment, ...updatedComments[0].items],
            };
          }
          return {
            ...oldComments,
            pages: updatedComments,
          };
        },
      );

      //update single post: comment count
      queryClient.setQueryData(
        ["post", postId],
        (oldPost: { comment: { count: number } }) => {
          if (!oldPost) return oldPost;

          return {
            ...oldPost,
            comment: {
              count: oldPost.comment.count + 1,
            },
          };
        },
      );

      //update infinite post: comment count
      queryClient.setQueryData(["posts"], (oldPosts: { pages: any[] }) => {
        if (!oldPosts) return oldPosts;

        return {
          ...oldPosts,
          pages: oldPosts.pages.map((page) => ({
            ...page,
            items: page.items.map(
              (oldPost: { comment: { count: number }; id: string }) => {
                if (oldPost.id !== postId) return oldPost;

                return {
                  ...oldPost,
                  comment: {
                    count: oldPost.comment.count + 1,
                  },
                };
              },
            ),
          })),
        };
      });

      return { previousComments, previousSinglePost, previousInfinitePost };
    },

    onError: (_err, _newComment, context) => {
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
    } catch {
      toast.error("Something went wrong!");
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

  useEffect(() => {
    const target = observerTarget.current;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    if (target) observer.observe(target);

    return () => {
      if (target) observer.unobserve(target);
      observer.disconnect();
    };
  }, [isFetchingNextPage, hasNextPage, fetchNextPage]);

  if (error) {
    return <span>An error occured.</span>;
  }
  if (!post) return <Loader />;

  return (
    <div
      className="fixed inset-0 bg-black/30 w-full px-16 py-6 lg:py-0 h-full flex justify-center items-center z-50"
      onClick={(e) => {
        if (e.target == e.currentTarget) {
          navigate(-1);
        }
      }}
    >
      <section className="bg-surface-container-lowest overflow-hidden w-full h-full sm:h-[calc(100vh-3rem)] sm:min-w-[calc(100vw-8rem)] rounded-[12px] grid grid-cols-1 md:grid-cols-2 items-stretch p-0 gap-0 font-primary">
        <div className="hidden md:flex bg-surface-container-high items-center justify-center h-full">
          <CarouselWithPagination
            media={post.media}
            className="max-w-xl"
            fit="contain"
          />
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
              <p className="text-[14px] leading-normal text-on-surface">
                <span className="font-semibold">{post.author.displayName}</span>{" "}
                <span>{post.caption}</span>
              </p>
              <span className="text-[12px] text-on-surface-variant">
                {postTimestamp}
              </span>
            </div>
          </section>

          {/* Comments - scrollable, hidden scrollbar */}
          {comments ? (
            <section className="flex flex-col gap-y-5 px-5 py-4 grow min-h-0 overflow-y-auto scrollbar-none">
              {comments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))}
              <div ref={observerTarget} className="min-h-4">
                {isFetchingNextPage && <span>Loading...</span>}
                {!hasNextPage && <span>No more comments</span>}
              </div>
            </section>
          ) : (
            <Loader />
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
