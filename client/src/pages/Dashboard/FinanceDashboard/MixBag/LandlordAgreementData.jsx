import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UploadFileInput from "../../../../components/UploadFileInput";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
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

const LandlordAgreementData = () => {
  const location = useLocation();
  const { name: routeName } = useParams();
  const axios = useAxiosPrivate();
  const name = decodeURIComponent(routeName || location.state?.name || "Unknown");
  const routeId = location.state?.id;
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const { data: landlordData = [], isLoading } = useQuery({
    queryKey: ["landlord-agreements"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/get-landlord-agreements");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const selectedLandlord = useMemo(() => {
    if (routeId) {
      const byId = landlordData.find((item) => item._id === routeId);
      if (byId) return byId;
    }

    return landlordData.find(
      (item) => (item?.name || "").trim().toLowerCase() === name.trim().toLowerCase()
    );
  }, [landlordData, name, routeId]);

  const files = Array.isArray(selectedLandlord?.documents) ? selectedLandlord.documents : [];

  const defaultValues = {
    landLordId: "",
    documentName: "",
    currentDocumentName: "",
    agreement: null,
  };

  const {
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues,
  });

  const resetModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedDocument(null);
    reset({ ...defaultValues, landLordId: selectedLandlord?._id || routeId || "" });
  };

  useEffect(() => {
    setValue("landLordId", selectedLandlord?._id || routeId || "");
  }, [routeId, selectedLandlord?._id, setValue]);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedDocument(null);
    reset({ ...defaultValues, landLordId: selectedLandlord?._id || routeId || "" });
    setOpenModal(true);
  };

  const openEditModal = (documentRow) => {
    setIsEditMode(true);
    setSelectedDocument(documentRow);
    reset({
      landLordId: selectedLandlord?._id || routeId || "",
      documentName: documentRow.document,
      currentDocumentName: documentRow.document,
      agreement: null,
    });
    setOpenModal(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (formData) => {
      if (isEditMode) {
        const response = await axios.patch("/api/finance/landlord-agreements/document", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
      }

      const response = await axios.post("/api/finance/add-landlord-agreement", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Agreement updated successfully" : "Agreement uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] });
      resetModal();
    },
    onError: (err) => {
      console.error(isEditMode ? "Update failed:" : "Upload failed:", err);
      toast.error(err?.response?.data?.message || (isEditMode ? "Failed to update agreement" : "Failed to upload agreement"));
    },
  });

  const onSubmit = (data) => {
    const formData = new FormData();
    formData.append("landLordId", selectedLandlord?._id || routeId || "");
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
    createdAt: item?.createdAt ? humanDate(item.createdAt) : "N/A",
    updatedAt: item?.updatedAt ? humanDate(item.updatedAt) : "N/A",
    url: item?.url || "",
  }));

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle={`AGREEMENTS -  ${name.toUpperCase()}`}
          buttonTitle={"Add Agreement"}
          handleClick={openAddModal}
          hideFilter
          loading={isLoading}
          disabled={!selectedLandlord}
        />
      </PageFrame>

      <MuiModal title={isEditMode ? "Edit Agreement" : "Add Agreement"} open={openModal} onClose={resetModal}>
        <div className="flex flex-col gap-4">
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
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
              rules={{ required: isEditMode ? false : "Agreement is Required" }}
              render={({ field }) => (
                <UploadFileInput
                  onChange={field.onChange}
                  value={field.value}
                  allowedExtensions={["pdf"]}
                  previewType="pdf"
                  label={isEditMode ? "Replace Agreement" : "Upload Agreement"}
                />
              )}
            />
            {isEditMode ? (
              <p className="text-xs text-gray-500">
                Uploaded Date remains unchanged. Replacing the file updates Last Modified automatically.
              </p>
            ) : null}
            <PrimaryButton
              type={"submit"}
              title={isEditMode ? "Save Changes" : "Add Agreement"}
              isLoading={isPending}
              disabled={isPending || !selectedLandlord}
            />
          </form>
        </div>
      </MuiModal>
    </div>
  );
};

export default LandlordAgreementData;