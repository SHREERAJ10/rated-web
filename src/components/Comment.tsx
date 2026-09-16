import { relativeTime } from "@/utils/relativeTime";

function Comment({ comment }) {
  return (
    <div className="flex gap-x-2.5 items-start">
      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
        <img
          src={comment.commentor?.pfpUrl}
          alt="pfp"
          className="w-full h-full object-cover rounded-full"
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="text-[14px] leading-normal text-on-surface">
          <span className="font-semibold">
            {comment.commentor?.displayName}
          </span>{" "}
          <span>{comment.comment}</span>
        </p>
        <span className="text-[12px] text-on-surface-variant">
          {relativeTime(new Date(comment.createdAt).getTime())}
        </span>
      </div>
    </div>
  );
}

export default Comment;