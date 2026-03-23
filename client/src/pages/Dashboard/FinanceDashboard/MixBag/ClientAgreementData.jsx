import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import humanDate from "../../../../utils/humanDateForamt";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, IconButton, Menu, MenuItem, TextField } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadFileInput from "../../../../components/UploadFileInput";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const ActionMenu = ({ onEdit }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <>
      <IconButton size="small" onClick={(event) => setAnchorEl(event.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            onEdit();
          }}
        >
          Edit
        </MenuItem>
      </Menu>
    </>
  );
};

const ClientAgreementData = () => {
  const location = useLocation();
  const { name: routeName } = useParams();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
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

  const defaultValues = {
    documentName: "",
    currentDocumentName: "",
    agreement: null,
  };

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  useEffect(() => {
    reset({
      documentName: "",
      currentDocumentName: "",
      agreement: null,
    });
  }, [openModal, reset]);

  const resetModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedDocument(null);
    reset(defaultValues);
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedDocument(null);
    reset(defaultValues);
    setOpenModal(true);
  };

  const openEditModal = (documentRow) => {
    setIsEditMode(true);
    setSelectedDocument(documentRow);
    reset({
      documentName: documentRow.document,
      currentDocumentName: documentRow.document,
      agreement: null,
    });
    setOpenModal(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      if (isEditMode) {
        const response = await axios.patch("/api/finance/client-agreements/agreement", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await axios.post("/api/finance/client-agreements/agreement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Agreement updated successfully" : "Agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      resetModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || (isEditMode ? "Failed to update agreement" : "Failed to upload agreement"));
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("clientId", selectedClient?._id || location.state?.id || "");
    formData.append("documentName", data.documentName.trim());

    if (isEditMode) {
      formData.append("currentDocumentName", data.currentDocumentName || selectedDocument?.document || "");
      if (data.agreement) {
        formData.append("agreement", data.agreement);
      }
    } else {
      formData.append("agreement", data.agreement);
    }
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
    { field: "createdAt", headerName: "Uploaded Date", flex: 1 },
    { field: "updatedAt", headerName: "Last Modified", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      sortable: false,
      cellRenderer: (params) => <ActionMenu onEdit={() => openEditModal(params.data)} />,
    },
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
            handleClick={openAddModal}
            disabled={!selectedClient}
          />
        )}
      </PageFrame>

      <MuiModal title={isEditMode ? "Edit Agreement" : "Add New Agreement"} open={openModal} onClose={resetModal}>
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
            rules={{ required: isEditMode ? false : "Agreement file is required" }}
            render={({ field }) => (
              <UploadFileInput
                onChange={field.onChange}
                value={field.value}
                allowedExtensions={["pdf", "doc", "docx", "jpg", "jpeg", "png", "webp"]}
                previewType="auto"
                label={isEditMode ? "Replace Agreement" : "Upload Agreement"}
              />
            )}
          />
          {errors?.agreement?.message ? <p className="text-sm text-red-500">{errors.agreement.message}</p> : null}
          {isEditMode ? (
            <p className="text-xs text-gray-500">
              Uploaded Date remains unchanged. Replacing the file updates Last Modified automatically.
            </p>
          ) : null}
          <PrimaryButton
            type="submit"
            title={isEditMode ? "Save Changes" : "Add New Agreement"}
            isLoading={isPending}
            disabled={isPending || !selectedClient}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default ClientAgreementData;