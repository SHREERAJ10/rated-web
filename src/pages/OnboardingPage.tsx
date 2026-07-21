import { useContext, useState } from "react";
import { createRecord, getData } from "../utils/api";
import { AuthContext } from "../context/AuthContext";
import { useForm, type SubmitHandler } from "react-hook-form";
import uploadImage from "../utils/uploadImage";
import { useNavigate } from "react-router-dom";

type AllowedFields = "username" | "displayName" | "bio";

const PLACEHOLDER_PFP =
  "https://res.cloudinary.com/medialibrary123/image/upload/v1784560230/user/Lk8fvXlWicX3AfxwlS1ut86w6653/isesrbrxzgymioyyt31p.jpg";

interface FormField {
  id: string;
  name: AllowedFields;
  placeholder: string;
  type: string;
}

interface FormInput {
  username: string;
  displayName: string;
  bio: string;
  pfpUrl: string;
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
  const { register, handleSubmit } = useForm<FormInput>();

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const handleFileChange = (e: Event) => {
    setFile(e.target.files[0]);
  };

  const onSubmit: SubmitHandler<FormInput> = async (data) => {
    try {
      if (user) {
        let uploadResult;
        if (file) {
          uploadResult = await uploadImage(user, file, setImageUrl);
        }
        data.pfpUrl = uploadResult?uploadResult.secure_url:PLACEHOLDER_PFP;
        const userResponse = await createRecord(user, "/user", data);
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-9">
          <div className="flex flex-col gap-5">
            {USER_FIELDS.map((field) => {
              return (
                <div
                  key={field.name}
                  className="flex items-center gap-2 border border-[#D3D3D3] rounded-2xl bg-[#FBFBFB] pl-5 py-2 pr-1"
                >
                  <input
                    {...register(field.name)}
                    type={field.type}
                    placeholder={field.placeholder}
                    className="outline-none focus:outline-none text-xl placeholder:font-medium text-[#272727] w-full placeholder:text-[#7C7C7C]"
                  />
                </div>
              );
            })}
          </div>
          <input
            type="file"
            name="profile"
            accept="image/png, image/jpeg"
            onChange={handleFileChange}
          />
          <button
            type="submit"
            className="px-6 py-3 bg-[#272727] text-semibold text-xl w-full text-[#D9D9D9] rounded-xl cursor-pointer hover:brightness-110 transition-all duration-150 ease-in-out"
          >
            Confirm
          </button>
        </div>
      </form>
    </div>
  );
}

export default OnboardingPage;
