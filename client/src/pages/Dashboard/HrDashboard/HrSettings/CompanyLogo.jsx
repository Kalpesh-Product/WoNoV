import React, { useEffect } from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useForm, Controller } from "react-hook-form";

const CompanyLogo = () => {
  const axios = useAxiosPrivate();

  const { control, handleSubmit, watch, reset } = useForm({
    defaultValues: {
      logo: null,
    },
  });

  const selectedFile = watch("logo");
  const previewUrl = selectedFile ? URL.createObjectURL(selectedFile) : null;

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl); // Clean up memory
      }
    };
  }, [previewUrl]);

  const { mutate: uploadLogo, isPending: uploading } = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("logo", file);

      const response = await axios.post(
        "/api/company/add-company-logo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Image uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["companyLogo"] });
      reset();
    },
    onError: (error) => {
      console.error("Upload Error:", error);
      toast.error("Failed to upload image.");
    },
  });

  const onSubmit = (data) => {
    if (!data.logo) {
      toast.warning("Please select a file before uploading.");
      return;
    }
    uploadLogo(data.logo);
  };

  return (
    <PageFrame>
      <div className="flex justify-center items-center">
        <div className="flex justify-center rounded-md w-[50%] items-center h-[60vh] bg-gray-200">
          <div className="bg-gray-200 p-8 rounded-lg shadow-md w-[400px]">
            <div className="flex flex-col gap-2">
              <span className="text-subtitle font-pbold text-gray-700 text-center mb-2">
                Upload Your Company Logo
              </span>
              <span className="text-content text-gray-500 text-center mb-4">
                PNG, JPG & JPEG files are allowed
              </span>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
              <Controller
                name="logo"
                control={control}
                render={({ field: { onChange } }) => (
                  <label
                    htmlFor="fileUpload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 rounded-md cursor-pointer transition"
                  >
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Company Logo Preview"
                        className="w-32 h-32 object-cover rounded-md"
                      />
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12l-4.5 4.5m0 0L7.5 12m4.5 4.5V3"
                          />
                        </svg>
                        <span className="text-small text-gray-400 font-pregular">
                          Drag and drop or browse to choose a file
                        </span>
                      </>
                    )}
                    <input
                      id="fileUpload"
                      type="file"
                      accept=".png, .jpg, .jpeg"
                      className="hidden"
                      onChange={(e) => onChange(e.target.files[0])}
                    />
                  </label>
                )}
              />

              {selectedFile && (
                <div className="mt-4 flex flex-col items-center gap-2">
                  <PrimaryButton
                    type="submit"
                    title={uploading ? "Uploading..." : "Upload Image"}
                    disabled={uploading}
                  />
                  <label
                    htmlFor="fileUpload"
                    className="text-primary cursor-pointer underline font-pmedium"
                  >
                    Change Image
                  </label>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </PageFrame>
  );
};

export default CompanyLogo;
