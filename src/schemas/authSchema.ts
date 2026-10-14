import * as z from "zod";

export const onboardingSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username is required")
    .max(40, "Username must be at most 40 characters long")
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      "Username can only contain letters, numbers, dots, underscores, and hyphens",
    ),
  displayName: z
    .string()
    .trim()
    .min(1, "Display name is required")
    .max(40, "Display name must be at most 40 characters long"),
  bio: z.string().trim().max(60, "Bio must be at most 60 characters long"),
  pfpUrl: z.string().trim(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
