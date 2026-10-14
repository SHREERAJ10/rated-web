import { useContext, useEffect, useState } from "react";
import { WheelPicker, WheelPickerWrapper } from "./wheel-picker";
import { ratePost, removeRating } from "@/api/post.api";
import { AuthContext } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ratingOption {
  label: number;
  value: number;
}

interface RatingPickerProps {
  onClose: () => void;
  postId: string;
  isRatedByUser: boolean;
}

const options: ratingOption[] = [
  {
    label: 1,
    value: 1,
  },
  {
    label: 2,
    value: 2,
  },
  {
    label: 3,
    value: 3,
  },
  {
    label: 4,
    value: 4,
  },
  {
    label: 5,
    value: 5,
  },
  {
    label: 6,
    value: 6,
  },
  {
    label: 7,
    value: 7,
  },
  {
    label: 8,
    value: 8,
  },
  {
    label: 9,
    value: 9,
  },
  {
    label: 10,
    value: 10,
  },
];

interface PostRating {
  score: number;
}

function RatingPicker({ postId, onClose, isRatedByUser }: RatingPickerProps) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [score, setScore] = useState<number>(1);

  const modifyRating = useMutation({
    mutationFn: async (postRating: PostRating) => {
      await ratePost(user, postId, postRating);
    },
    onMutate: async (postRating: PostRating) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const postsBeforeMutation = queryClient.getQueryData(["posts"]);

      //optimistic update
      queryClient.setQueryData(["posts"], (posts) => {
        if (!posts) return posts;
        return {
          ...posts,
          pages: posts.pages.map((page) => ({
            ...page,
            items: page.items.map((oldPost) => {
              if (oldPost.id !== postId) return oldPost;

              return {
                ...oldPost,
                isRatedByUser: true,
                ratingScore: {
                  ...oldPost.ratingScore,
                  count:
                    oldPost.isRatedByUser == false
                      ? oldPost.ratingScore.count + 1
                      : oldPost.ratingScore.count,
                  userRatingScore: postRating.score,
                },
              };
            }),
          })),
        };
      });

      return { postsBeforeMutation };
    },
    onError: (err, postRating, context) => {
      queryClient.setQueryData(["posts"], context?.postsBeforeMutation);
    },
  });

  const removeUserRating = useMutation({
    mutationFn: async () => {
      await removeRating(user, postId);
    },

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });

      const postsBeforeMutation = queryClient.getQueryData(["posts"]);

      queryClient.setQueryData(["posts"], (posts) => {
        if (!posts) return posts;

        return {
          ...posts,
          pages: posts.pages?.map((page) => ({
            ...page,
            items: page.items?.map((post) => {
              if (post.id == postId) {
                return {
                  ...post,
                  isRatedByUser: false,
                  ratingScore: {
                    ...post.ratingScore,
                    count: Math.max(0, post.ratingScore.count - 1),
                  },
                };
              }
              return post;
            }),
          })),
        };
      });

      return { postsBeforeMutation };
    },

    onError: (err, postRating, context) => {
      queryClient.setQueryData(["posts"], context?.postsBeforeMutation);
    },
  });

  useEffect(() => {
    window.document.body.style.overflow = "hidden";
    return () => {
      window.document.body.style.overflow = "";
    };
  }, []);

  return (
    <section
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-label="Rate this post"
        className="flex w-full max-w-68 flex-col gap-3 rounded-2xl border border-border-subtle bg-white p-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          modifyRating.mutate({ score });
          onClose();
        }}
      >
        <WheelPickerWrapper className="rounded-xl border border-border-subtle bg-[#FBFBFB]">
          <WheelPicker
            options={options}
            optionItemHeight={44}
            value={score}
            onValueChange={setScore}
          />
        </WheelPickerWrapper>

        <div className="flex items-center gap-2">
          {isRatedByUser ? (
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-xl text-red-600 hover:text-red-700"
              onClick={() => {
                removeUserRating.mutate();
                onClose();
              }}
            >
              Remove
            </Button>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-10 flex-1 rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
          )}

          <Button
            type="submit"
            className="h-10 flex-1 rounded-xl"
          >
            Rate
          </Button>
        </div>
      </form>
    </section>
  );
}

export default RatingPicker;
