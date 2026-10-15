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
import { createPost } from "@/api/post.api";
import { PostSchema, type PostInput } from "@/schemas/postSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { User } from "firebase/auth";

export function CreatePost({
  dialogTrigger,
}: {
  dialogTrigger: React.ReactElement;
}) {
  const { user } = useContext(AuthContext);
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [imagesToUpload, setImagesToUpload] = useState<File[] | null>(null);
  const {
    register,
    setValue,
    handleSubmit,
    formState: { errors },
  } = useForm<PostInput>({
    resolver: zodResolver(PostSchema),
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onSubmit: SubmitHandler<{ caption: string }> = async (data) => {
    try {
      await createPost(user as User, data);
      toast.success("Post created successfully");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      setIsDialogOpen(false);
    } catch {
      toast.error("Something went wrong!");
      setIsUploading(false);
    }
  };

  const handlePreSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsUploading(true);
    e.preventDefault();
    try {
      let media = [];
      const limit = pLimit(5);
      const uploadMediaTasks = imagesToUpload?.map((imageFile) =>
        limit(() => uploadImage(user as User, imageFile)),
      );
      if (uploadMediaTasks) {
        media = await Promise.all(uploadMediaTasks);
      }
      setValue(
        "media",
        media.map((image) => {
          return {
            publicId: image.public_id,
            url: image.secure_url,
          };
        }),
      );
      handleSubmit(onSubmit)(e);
    } catch {
      toast.error("Something went wrong!");
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <form onSubmit={handlePreSubmit} id="post-dialog">
        <DialogTrigger className="w-full" render={dialogTrigger} />

        <DialogContent className="sm:max-w-sm md:max-w-md md:min-h-[80%] max-h-[90%]">
          <DialogHeader className="mb-2">
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>

          <div>
            {errors.caption && (
              <p className="text-sm text-red-500">{errors.caption.message}</p>
            )}
            <textarea
              id=""
              className="overflow-hidden w-full resize-none h-20 p-1 border border-[#111]/20 rounded-sm focus:border-[#111]/60"
              placeholder="What do you think..."
              {...register("caption")}
            ></textarea>
          </div>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            {errors.media && (
              <p className="text-sm text-red-500">{errors.media.message}</p>
            )}
            <UploadModal setImagesToUpload={setImagesToUpload} />
          </div>

          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button
              type="submit"
              form="post-dialog"
              className="disabled:cursor-not-allowed disabled:brightness-90"
              disabled={isUploading}
            >
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
