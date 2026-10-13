import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UploadModal } from "./UploadModal";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useContext, useState } from "react";
import uploadImage from "@/utils/uploadImage";
import { AuthContext } from "@/context/AuthContext";
import pLimit from "p-limit";
import { Plus } from "lucide-react";
import { createPost } from "@/api/post.api";

export function CreatePost({
  dialogTrigger,
}: {
  dialogTrigger: React.ReactElement;
}) {
  const { user } = useContext(AuthContext);
  const [imagesToUpload, setImagesToUpload] = useState<File[] | null>(null);
  const { register, handleSubmit } = useForm();
  const [post, setPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit: SubmitHandler<{ caption: string }> = async (data) => {
    let media = [];
    const limit = pLimit(5);
    const uploadMediaTasks = imagesToUpload?.map((imageFile) =>
      limit(() => uploadImage(user, imageFile)),
    );
    if (uploadMediaTasks) {
      media = await Promise.all(uploadMediaTasks);
      if (media.length == 0) return;
    }

    const postData = {
      caption: data.caption,
      media: media.map((image) => {
        return {
          publicId: image.public_id,
          url: image.secure_url,
        };
      }),
    };

    const post = await createPost(user, postData);
    setPost(post);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <form onSubmit={handleSubmit(onSubmit)} id="post-dialog">
        <DialogTrigger className="w-full" render={dialogTrigger} />

        <DialogContent className="sm:max-w-sm md:max-w-md md:min-h-[80%] max-h-[90%]">
          <DialogHeader className="mb-2">
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>

          <div>
            <textarea
              id=""
              className="overflow-hidden w-full resize-none h-20 p-1 border border-[#111]/20 rounded-sm focus:border-[#111]/60"
              placeholder="What do you think..."
              {...register("caption")}
            ></textarea>
          </div>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <UploadModal setImagesToUpload={setImagesToUpload} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit" form="post-dialog">
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
