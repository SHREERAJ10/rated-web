import { relativeTime } from "@/utils/relativeTime";

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

  return (
    <div className="flex items-center gap-4 px-4 py-4 md:px-6">
      <img
        src={notification.actor.pfpUrl}
        alt={notification.actor.displayName}
        className="h-12 w-12 shrink-0 rounded-full object-cover md:h-16 md:w-16"
      />

      <p className="min-w-0 flex-1 text-sm leading-normal text-[#666666] md:text-base">
        <span className="font-medium text-[#1A1A1A]">
          {notification.actor.displayName}
        </span>{" "}
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
