import { useState, useRef } from "react";
import PrimaryButton from "../../../../components/PrimaryButton";
import MuiModal from "../../../../components/MuiModal";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import { LuImageUp } from "react-icons/lu";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { queryClient } from "../../../../main";
import PageFrame from "../../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const Templates = () => {
  const [openModal, setOpenModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title: "", file: null });
  const imageInputRef = useRef();
  const axios = useAxiosPrivate();
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      documentName: "",
      file: null,
      type: "template",
    },
    mode: "onChange",
  });
  const watchedFile = watch("file");
  const { data: templatesData = [], isLoading: isTemplatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-documents/templates"
        );
        return response.data.templates;
      } catch (error) {
        console.log(error);
      }
    },
  });

  const { mutate: uploadTemplateMutation, isPending: isDocumentPending } =
    useMutation({
      mutationFn: async ({ documentName, file }) => {
        const formData = new FormData();
        formData.append("documentName", documentName);
        formData.append("document", file);
        formData.append("type", "template");

        const response = await axios.post(
          "/api/company/upload-company-document",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return response.data;
      },

      onSuccess: () => {
        toast.success("Template uploaded successfully!");
        setOpenModal(false);
        reset();
        queryClient.invalidateQueries({ queryKey: ["templates"] }); // refresh the list
      },
      onError: (err) => {
        toast.error("Failed to upload template.");
        console.error("Upload error:", err);
      },
    });

  const navigate = useNavigate();
  const getFileIcon = (ext) => {
    const icons = {
      pdf: "https://cdn-icons-png.flaticon.com/512/337/337946.png",
      doc: "https://cdn-icons-png.flaticon.com/512/281/281760.png",
      docx: "https://cdn-icons-png.flaticon.com/512/281/281760.png",
      xls: "https://cdn-icons-png.flaticon.com/512/888/888848.png",
      xlsx: "https://cdn-icons-png.flaticon.com/512/281/281760.png",
      ppt: "https://cdn-icons-png.flaticon.com/512/888/888879.png",
      pptx: "https://cdn-icons-png.flaticon.com/512/888/888879.png",
    };
    return (
      icons[ext] || "https://cdn-icons-png.flaticon.com/512/2991/2991148.png"
    ); // default file icon
  };

  const getFilePreview = (link, name) => {
    const extension = link?.split(".").pop()?.toLowerCase();

    if (["jpg", "jpeg", "png", "webp"].includes(extension)) {
      return (
        <img src={link} alt={name} className="w-full h-full object-contain" />
      );
    }

    const icon = getFileIcon(extension);
    return (
      <img
        src={icon}
        alt={`${extension} icon`}
        className="w-20 h-full object-contain mx-auto"
      />
    );
  };

  const handleAddTemplate = (data) => {
    if (!data.documentName || !data.file) return;

    uploadTemplateMutation({
      documentName: data.documentName,
      file: data.file,
    });
  };

  return (
    <PageFrame>
      <div>
        <div className="flex justify-between items-center mb-6">
          <span className="text-primary text-title font-pmedium uppercase">
            Templates
          </span>
          <PrimaryButton
            title="Add Template"
            handleSubmit={() => setOpenModal(true)}
          />
        </div>
        {!isTemplatesLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isTemplatesLoading
              ? []
              : templatesData?.map((template) => (
                  <div
                    key={template._id}
                    onClick={() => {
                      const extension =
                        template.documentLink
                          ?.split(".")
                          .pop()
                          ?.toLowerCase() || "pdf";
                      const safeName = template.name.replace(
                        /[^a-z0-9_\- ]/gi,
                        "_"
                      ); // sanitize filename
                      const fileName = `${safeName}.${extension}`;

                      const downloadUrl = template.documentLink.replace(
                        "/upload/",
                        "/upload/fl_attachment/"
                      );

                      const link = document.createElement("a");
                      link.href = downloadUrl;
                      link.download = `New ${fileName}`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="bg-white shadow-md rounded-lg overflow-hidden border cursor-pointer"
                  >
                    <div className="h-48 bg-gray-100 overflow-hidden rounded">
                      {getFilePreview(template.documentLink, template.name)}
                    </div>

                    <div className="p-4">
                      <h2 className="widgetTitle font-semibold font-pregular hover:underline">
                        {template.name}
                      </h2>
                      {/* <p className="text-content text-gray-500 font-pregular">
                {template.date}
              </p> */}
                    </div>
                  </div>
                ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-full">
            <CircularProgress />
          </div>
        )}

        <MuiModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          title="Add New Template"
        >
          <form onSubmit={handleSubmit(handleAddTemplate)}>
            <Box display="flex" flexDirection="column" gap={3}>
              <Controller
                control={control}
                name="documentName"
                rules={{
                  required: "Document Name is required",
                  validate: { isAlphanumeric, noOnlyWhitespace },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    variant="outlined"
                    size="small"
                    fullWidth
                    error={!!errors.documentName}
                    helperText={errors.documentName?.message}
                  />
                )}
              />

              {/* Hidden File Input */}
              <Controller
                control={control}
                name="file"
                rules={{
                  required: "File is required",
                }}
                render={({ field }) => (
                  <>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx,.ppt,.pptx"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setValue("file", file);
                        }
                      }}
                    />

                    <TextField
                      label="Upload Template"
                      placeholder="Choose a file..."
                      size="small"
                      fullWidth
                      value={watchedFile?.name || ""}
                      error={!!errors.file}
                      helperText={errors.file?.message}
                      InputProps={{
                        readOnly: true,
                        endAdornment: (
                          <IconButton
                            color="primary"
                            component="label"
                            onClick={() => imageInputRef.current?.click()}
                          >
                            <LuImageUp />
                          </IconButton>
                        ),
                      }}
                    />
                  </>
                )}
              />

              {/* Submit Button */}
              <Box textAlign="right">
                <PrimaryButton
                  type="submit"
                  isLoading={isDocumentPending}
                  title={"Add Template"}
                  className="w-full"
                  disabled={isDocumentPending}
                />
              </Box>
            </Box>
          </form>
        </MuiModal>
      </div>
    </PageFrame>
  );
};

export default Templates;
