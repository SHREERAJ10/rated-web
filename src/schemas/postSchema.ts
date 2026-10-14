import * as z from "zod";

const media = z.object({
  publicId: z.string().trim(),
  url: z.string().trim(),
});

export const PostSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(200, "Caption must be at most 200 characters long")
    .optional(),
  media: z
    .array(media)
    .min(1, "At least one photo is required")
    .max(10, "Maximum 10 photos only"),
});

export type PostInput = z.infer<typeof PostSchema>;
