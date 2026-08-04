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
import { Pattern } from "./examples/c-file-upload-4";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useContext, useState } from "react";
import uploadImage from "@/utils/uploadImage";
import { AuthContext } from "@/context/AuthContext";
import pLimit from "p-limit";
import { createRecord } from "@/utils/api";

export function CreatePost() {
  const { user } = useContext(AuthContext);
  const [imagesToUpload, setImagesToUpload] = useState<File[] | null>(null);
  const { register, handleSubmit } = useForm();
  const [post, setPost] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit = async (data) => {
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
      media: media.map((image) => image.secure_url),
    };

    const post = await createRecord(user, "/post", postData);
    setPost(post);
    setIsDialogOpen(false);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <form onSubmit={handleSubmit(onSubmit)} id="post-dialog">
        <DialogTrigger
          render={<Button variant="outline">Create Post</Button>}
        />

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
            <Pattern setImagesToUpload={setImagesToUpload} />
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
