import { useContext, useEffect, useRef, useState } from "react";
import { createRecord } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import uploadImage from "../utils/uploadImage";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { onboardingSchema, type OnboardingInput } from "@/schemas/authSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { User } from "firebase/auth";

type AllowedFields = "username" | "displayName" | "bio";

const PLACEHOLDER_PFP =
  "https://res.cloudinary.com/medialibrary123/image/upload/v1784560230/user/Lk8fvXlWicX3AfxwlS1ut86w6653/isesrbrxzgymioyyt31p.jpg";

interface FormField {
  id: string;
  name: AllowedFields;
  placeholder: string;
  type: string;
}

const USER_FIELDS: FormField[] = [
  {
    id: "username",
    name: "username",
    placeholder: "Username",
    type: "text",
  },
  {
    id: "displayName",
    name: "displayName",
    placeholder: "Display Name",
    type: "text",
  },
  {
    id: "bio",
    name: "bio",
    placeholder: "Bio",
    type: "text",
  },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
  });

  const [file, setFile] = useState(null);

  const handleFileChange = (e: Event) => {
    setFile(e.target.files[0]);
  };

  const onSubmit: SubmitHandler<OnboardingInput> = async (data) => {
    try {
      if (user) {
        await createRecord(user, "/user", data);
        navigate("/");
      }
    } catch {
      toast.error("Something went wrong!");
      setIsOnboarding(false);
    }
  };

  const handlePreSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsOnboarding(true);
    e.preventDefault();
    let userAvatar = PLACEHOLDER_PFP;
    if (file) {
      try {
        userAvatar = (await uploadImage(user as User, file)).secure_url;
        setValue("pfpUrl", userAvatar);
        handleSubmit(onSubmit)(e);
      } catch {
        toast.error("Something went wrong!");
        setIsOnboarding(false);
      }
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  // free the temporary preview URL when it changes or the page unmounts
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    handleFileChange(e);
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 sm:py-12">
      <form onSubmit={handlePreSubmit} className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3">
          <input
            ref={fileInputRef}
            id="profile"
            type="file"
            name="profile"
            accept="image/png, image/jpeg"
            onChange={onFileChange}
            className="peer sr-only"
          />
          <label
            htmlFor="profile"
            className="group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#D3D3D3] bg-[#FBFBFB] transition-colors hover:border-[#7C7C7C] peer-focus-visible:ring-2 peer-focus-visible:ring-[#272727] peer-focus-visible:ring-offset-2 sm:size-28"
          >
            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="size-full object-cover"
              />
            ) : (
              <Camera className="size-7 text-[#7C7C7C]" strokeWidth={1.5} />
            )}
          </label>

          <div className="flex items-center gap-3 text-sm">
            <label
              htmlFor="profile"
              className="cursor-pointer font-medium text-[#272727] hover:underline"
            >
              {preview ? "Change photo" : "Upload photo"}
            </label>
            {preview && (
              <button
                type="button"
                onClick={() => {
                  setPreview(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="cursor-pointer text-[#7C7C7C] hover:text-[#272727]"
              >
                Remove
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-y-4">
          {USER_FIELDS.map((field) => (
            <div key={field.name} className="">
              <input
                {...register(field.name)}
                type={field.type}
                placeholder={field.placeholder}
                aria-label={field.placeholder}
                className="rounded-2xl border border-[#D3D3D3] bg-[#FBFBFB] px-5 py-3.5 transition-colors focus-within:border-[#272727] w-full text-base text-[#272727] outline-none placeholder:text-[#7C7C7C]"
              />
              {errors[field.name] && (
                <p className="text-sm text-[#E53E3E] px-2 pt-1">
                  {errors[field.name]?.message}
                </p>
              )}
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="w-full cursor-pointer rounded-xl bg-[#272727] px-6 py-3.5 text-base font-semibold text-[#D9D9D9] transition-all duration-150 ease-in-out hover:brightness-110 active:scale-[0.99] sm:text-lg disabled:brightness-90 disabled:cursor-not-allowed"
          disabled={isOnboarding}
        >
          Confirm
        </button>
      </form>
    </div>
  );
}

export default OnboardingPage;
