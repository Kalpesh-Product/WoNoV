import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";
import PrimaryButton from "../../../../components/PrimaryButton";
import humanDate from "../../../../utils/humanDateForamt";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const ComplianceData = () => {
  const { id } = useParams();
  const location = useLocation();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const nameFromState = location?.state?.name;
  const filesFromState = location?.state?.files || [];
  const name = nameFromState || id || "N/A";

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      documentName: "",
      document: null,
    },
  });

  const { data: complianceData = [], isLoading } = useQuery({
    queryKey: ["complianceDocuments"],
    queryFn: async () => {
      const res = await axios.get("/api/company/get-compliance-documents");
      return res.data.data;
    },
  });

  const files = useMemo(() => {
    return complianceData || filesFromState;
  }, [complianceData]);

  const fileRows = files.map((file, index) => ({
    srno: index + 1,
    label: file?.name?.trim() || "Unnamed Document",
    documentLink: file?.documentLink?.trim() || null,
    uploadedDate: file?.createdDate || null,
    lastModified: file?.updatedDate || null,
  }));

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(
        "/api/company/add-compliance-document",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] });
      setOpenModal(false);
      reset();
    },
    onError: () => {
      toast.error("Upload failed. Try again.");
    },
  });

  const onSubmit = (formValues) => {
    const { documentName, document } = formValues;
    if (!document) return toast.error("Please upload a document");

    const formData = new FormData();
    formData.append("documentName", documentName);
    formData.append("document", document);

    uploadDocument(formData);
  };

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "label",
      headerName: "Document",
      flex: 1,
      cellRenderer: (params) =>
        params.value ? (
          <a
            href={params.data.documentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline cursor-pointer"
          >
            {params.value}
          </a>
        ) : (
          <span className="text-gray-400 italic">No Link</span>
        ),
    },
    {
      field: "uploadedDate",
      headerName: "Uploaded Date",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={fileRows}
          tableTitle={`Compliance Documents`}
          buttonTitle="Add Document"
          // tableHeight={300}
          hideFilter
          search={fileRows.length >= 10}
          loading={isLoading}
          handleClick={() => setOpenModal(true)}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          reset();
        }}
        title="Add Document"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
          <Controller
            name="documentName"
            control={control}
            rules={{
              required: "Document name is required",
              validate: { isAlphanumeric, noOnlyWhitespace },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Document Name"
                fullWidth
                size="small"
                error={!!errors.documentName}
                helperText={errors.documentName?.message}
              />
            )}
          />
          <Controller
            name="document"
            control={control}
            rules={{ required: "Document file is required" }}
            render={({ field }) => (
              <UploadFileInput
                onChange={field.onChange}
                value={field.value}
                allowedExtensions={["jpg", "jpeg", "png", "pdf"]}
              />
            )}
          />
          <PrimaryButton
            type="submit"
            title="Submit"
            disabled={isUploading}
            isLoading={isUploading}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default ComplianceData;
