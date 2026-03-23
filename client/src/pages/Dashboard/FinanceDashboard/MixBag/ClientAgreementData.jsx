import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import humanDate from "../../../../utils/humanDateForamt";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, TextField } from "@mui/material";
import UploadFileInput from "../../../../components/UploadFileInput";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const ClientAgreementData = () => {
  const location = useLocation();
  const { name: routeName } = useParams();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const clientName = decodeURIComponent(routeName || location.state?.name || "Unknown");

  const { data: clientsData = [], isLoading } = useQuery({
    queryKey: ["finance-client-agreements"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/client-agreements");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const selectedClient = useMemo(
    () => clientsData.find((item) => (item?.clientName || "").trim().toLowerCase() === clientName.trim().toLowerCase()),
    [clientsData, clientName]
  );

  const files = Array.isArray(selectedClient?.documents) ? selectedClient.documents : [];

  const { handleSubmit, reset, control, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      documentName: "",
      agreement: null,
    },
  });

  useEffect(() => {
    reset({ documentName: "", agreement: null });
  }, [openModal, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post("/api/finance/client-agreements/agreement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      setOpenModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to upload agreement");
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("clientId", selectedClient?._id || location.state?.id || "");
    formData.append("documentName", data.documentName.trim());
    formData.append("agreement", data.agreement);
    mutate(formData);
  };

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
    { field: "fileType", headerName: "File Type", flex: 1 },
    { field: "createdAt", headerName: "Created At", flex: 1 },
    { field: "updatedAt", headerName: "Updated At", flex: 1 },
  ];

  const tableData = files.map((item, index) => ({
    srNo: index + 1,
    document: item?.name || "Untitled Document",
    fileType: item?.fileType?.split("/")?.[1]?.toUpperCase() || "FILE",
    createdAt: item?.createdAt ? humanDate(item.createdAt) : "N/A",
    updatedAt: item?.updatedAt ? humanDate(item.updatedAt) : "N/A",
    url: item?.url || "",
  }));

  return (
    <div className="p-4">
      <PageFrame>
        {isLoading ? (
          <div className="h-72 place-items-center">
            <CircularProgress />
          </div>
        ) : (
          <AgTable
            columns={columns}
            data={tableData}
            tableTitle={`AGREEMENTS -  ${clientName.toUpperCase()}`}
            hideFilter
            buttonTitle="Add New Agreement"
            handleClick={() => setOpenModal(true)}
            disabled={!selectedClient}
          />
        )}
      </PageFrame>

      <MuiModal title="Add New Agreement" open={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
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
                helperText={errors?.documentName?.message}
              />
            )}
          />
          <Controller
            name="agreement"
            control={control}
            rules={{ required: "Agreement file is required" }}
            render={({ field }) => (
              <UploadFileInput
                onChange={field.onChange}
                value={field.value}
                allowedExtensions={["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"]}
                previewType="auto"
                label="Upload Agreement"
              />
            )}
          />
          {errors?.agreement?.message ? <p className="text-sm text-red-500">{errors.agreement.message}</p> : null}
          <PrimaryButton type="submit" title="Add New Agreement" isLoading={isPending} disabled={isPending || !selectedClient} />
        </form>
      </MuiModal>
    </div>
  );
};

export default ClientAgreementData;