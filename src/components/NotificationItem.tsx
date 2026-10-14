import { relativeTime } from "@/utils/relativeTime";
import { Link, useNavigate } from "react-router-dom";

export type NotificationData = {
  id: number;
  type: "LIKE" | "COMMENT" | "RATE";
  actor: { id: string; displayName: string; username: string; pfpUrl: string };
  post: { postId: string; mediaUrl: string };
  rating?: NotificationRatingData;
  postImage: string;
  createdAt: Date;
};

export type NotificationRatingData = {
  score: number;
  total: number;
};

const actions = {
  LIKE: "liked your post",
  COMMENT: "commented on your post",
  RATE: "rated your post",
};

export default function NotificationItem({
  notification,
}: {
  notification: NotificationData;
}) {
  const action = `${actions[notification.type]}${notification.rating ? ` ${notification.rating.score}/${notification.rating.total}` : ""}.`;
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/post/${notification.post.postId}`)}
      className="flex items-center gap-4 px-4 py-4 md:px-6 cursor-pointer"
    >
      <img
        src={notification.actor.pfpUrl}
        alt={notification.actor.displayName}
        className="h-12 w-12 shrink-0 rounded-full object-cover md:h-16 md:w-16"
      />

      <p className="min-w-0 flex-1 text-sm leading-normal text-[#666666] md:text-base">
        <Link
          to={`/${notification.actor.username}`}
          className="font-medium text-[#1A1A1A]"
          onClick={(e) => e.stopPropagation()}
        >
          {notification.actor.displayName}
        </Link>{" "}
        {action}
        <span className="ml-1 text-xs text-[#666666]/70 md:text-sm">
          · {relativeTime(new Date(notification.createdAt).getTime())}
        </span>
      </p>

      <img
        src={notification.post.mediaUrl}
        alt="Post"
        className="h-12 w-12 shrink-0 rounded-xl border border-border-subtle object-cover md:h-14 md:w-14"
      />
    </div>
  );
}
