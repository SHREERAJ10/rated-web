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
      console.log(err);
      queryClient.setQueryData(["posts"], context?.postsBeforeMutation);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
      console.log(err);
      queryClient.setQueryData(["posts"], context?.postsBeforeMutation);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
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
      className="fixed inset-0 bg-black/30 w-full h-full flex justify-center items-center z-50"
      onClick={onClose}
    >
      <form
        className="w-1/3 border border-red-700 z-100"
        onClick={(e) => {
          e.stopPropagation();
        }}
        onSubmit={async (e) => {
          e.preventDefault();
          const postRating = {
            score: score,
          };
          modifyRating.mutate(postRating);
          onClose();
        }}
      >
        <WheelPickerWrapper className="border border-slate-700 rounded-xl shadow-lg">
          <WheelPicker
            options={options}
            optionItemHeight={60}
            value={score}
            onValueChange={setScore}
          />
        </WheelPickerWrapper>
        <div className="flex justify-between w-full">
          {isRatedByUser ? (
            <Button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                removeUserRating.mutate();
                onClose();
              }}
            >
              Remove
            </Button>
          ) : (
            <Button type="button" onClick={onClose}>
              Cancel
            </Button>
          )}

          <Button type="submit">Rate</Button>
        </div>
      </form>
    </section>
  );
}

export default RatingPicker;
