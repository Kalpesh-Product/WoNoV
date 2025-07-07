import { useLocation } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { TextField } from "@mui/material";
import UploadFileInput from "../../../../components/UploadFileInput";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const LandlordAgreementData = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();

  // Fallbacks if state is missing or malformed

  const name = location.state?.name || "Unknown";
  const id = location.state?.id || "Unknown";
  const [openModal, setOpenModal] = useState(false);
  const [selectedLanlordId, setSelectedLanlordId] = useState("");

  const { data: landlordData = [], isLoading } = useQuery({
    queryKey: ["landlord-agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/finance/get-landlord-agreements"
        );
        return response.data.filter((item) => item._id === id);
      } catch (error) {
        console.error("Failed to fetch landlord agreements:", error);
        return [];
      }
    },
  });

  const files = Array.isArray(landlordData?.[0]?.documents)
    ? landlordData[0].documents
    : [];

  const landlordId = landlordData.map((item) => item._id);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/finance/add-landlord-agreement",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: [] });
      setOpenModal(false);
      reset(); // clear form
      // Optional: refetch query or update local state if needed
    },
    onError: (err) => {
      console.error("Upload failed:", err);
      toast.error("Failed to upload agreement");
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("landLordId", landlordId[0]);
    formData.append("documentName", data.documentName);
    formData.append("agreement", data.agreement);
    mutate(formData);
  };

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      landLordId: "",
      documentName: "",
    },
  });

  useEffect(() => {
    setValue("landLordId", id);
  }, [id]);

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "document",
      headerName: "Document",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => window.open(params.data.url, "_blank")}
          className="underline text-primary cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },

    { field: "createdAt", headerName: "Created At" },
    { field: "updatedAt", headerName: "Updated At" },
    { field: "actions", headerName: "Actions" }, // Placeholder, if needed
  ];

  const tableData = files.map((item, index) => ({
    srNo: index + 1,
    document: item?.name || "Untitled Document",
    createdAt: item?.createdAt ? humanDate(item.createdAt) : "N/A",
    updatedAt: item?.updatedAt ? humanDate(item.updatedAt) : "N/A",
    url: item?.url || "",
    actions: "-", // Add actual actions like view/download buttons here if needed
  }));

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle={`AGREEMENTS -  ${name.toUpperCase()}`}
          buttonTitle={"Add Agreement"}
          handleClick={() => setOpenModal(true)}
          hideFilter
        />
      </PageFrame>

      <MuiModal
        title={"Add Agreement"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        <div className="flex flex-col gap-4">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-4"
          >
            <Controller
              name="documentName"
              control={control}
              rules={{
                required: "Document Name is Required",
                validate: {
                  isAlphanumeric,
                  noOnlyWhitespace,
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Document Name"
                  fullWidth
                  size="small"
                  error={!!errors.documentName}
                  helperText={errors?.documentName?.message}
                />
              )}
            />
            <Controller
              name="agreement"
              control={control}
              rules={{ required: "Agreement is Required" }}
              render={({ field }) => (
                <UploadFileInput
                  onChange={field.onChange}
                  value={field.value}
                  allowedExtensions={["pdf"]}
                  previewType="pdf"
                />
              )}
            />
            <PrimaryButton
              type={"submit"}
              title={"Add Agreement"}
              isLoading={isPending}
              disabled={isPending}
            />
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default LandlordAgreementData;
