function Comment({ comment }) {
  return (
    <div className="flex gap-x-2.5 items-center">
      <div className="flex gap-x-2 items-center">
        <div className="w-9 h-9 rounded-full justify-center items-center">
          <img
            src={comment.commentor?.pfpUrl}
            alt="pfp"
            className="object-contain rounded-full"
          />
        </div>
        <span className="font-semibold">{comment.commentor?.displayName}</span>
      </div>
      <div>
        <p>{comment.comment}</p>
      </div>
    </div>
  );
}


export default Comment;
