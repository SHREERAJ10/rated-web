import { CreatePost } from "@/components/CreatePost";
import { logout } from "../utils/AuthHandlers";
  
function Feed() {
  return (
    <div className="flex justify-between p-8">
      <button
        className="cursor-pointer"
        onClick={async () => {
          try {
            await logout();
          } catch (err) {
            console.log(err);
          }
        }}
      >
        Logout
      </button>
      <CreatePost />
    </div>
  );
}

export default Feed;
