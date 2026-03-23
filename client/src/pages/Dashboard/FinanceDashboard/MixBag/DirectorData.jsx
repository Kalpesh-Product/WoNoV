import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { IconButton, Menu, MenuItem, TextField } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";
import { toast } from "sonner";
import humanDate from "../../../../utils/humanDateForamt";
import PrimaryButton from "../../../../components/PrimaryButton";
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

const DirectorData = () => {
  const location = useLocation();
  const { name: routeName } = useParams();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  const nameFromState = location?.state?.name;
  const name = nameFromState || routeName || "N/A";
  const isCompany = name === "Company";

  const emptyFormValues = {
    type: isCompany ? "companyKyc" : "directorKyc",
    nameOfDirector: name,
    documentName: "",
    currentDocumentName: "",
    kyc: null,
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: emptyFormValues,
  });

  const resetModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setSelectedDocument(null);
    reset(emptyFormValues);
  };

  const { data: kycDetails = {}, isLoading } = useQuery({
    queryKey: ["directorsCompany"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-kyc");
      return response.data.data;
    },
  });

  const files = useMemo(() => {
    if (!kycDetails) return [];

    if (isCompany) return kycDetails.companyKyc || [];

    const match = kycDetails.directorKyc?.find((d) => d.nameOfDirector === name);
    return match?.documents || [];
  }, [kycDetails, name, isCompany]);

  const openAddModal = () => {
    setIsEditMode(false);
    setSelectedDocument(null);
    reset(emptyFormValues);
    setOpenModal(true);
  };

  const openEditModal = (documentRow) => {
    setIsEditMode(true);
    setSelectedDocument(documentRow);
    reset({
      ...emptyFormValues,
      documentName: documentRow.label,
      currentDocumentName: documentRow.label,
      kyc: null,
    });
    setOpenModal(true);
  };

  const fileRows = files.map((file, index) => ({
    srno: index + 1,
    label: file?.name?.trim() || "Unnamed Document",
    documentLink: file?.documentLink?.trim() || null,
    uploadedDate: file?.createdDate || null,
    lastModified: file?.updatedDate || null,
  }));

  const { mutate: saveKycDocument, isPending: isSaving } = useMutation({
    mutationFn: async (formData) => {
      if (isEditMode) {
        const res = await axios.patch("/api/company/update-kyc-document", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return res.data;
      }

      const res = await axios.post("/api/company/add-kyc-document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success(isEditMode ? "Document updated successfully" : "Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["directorsCompany"] });
      resetModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || (isEditMode ? "Update failed. Try again." : "Upload failed. Try again."));
    },
  });

  const onSubmit = (formValues) => {
    const { nameOfDirector, type, kyc, documentName, currentDocumentName } = formValues;
    if (!isEditMode && !kyc) return toast.error("Please upload a document");

    const formData = new FormData();
    formData.append("type", type);
    if (kyc) {
      formData.append("kyc", kyc);
    }
    if (!isCompany) {
      formData.append("nameOfDirector", nameOfDirector);
    }
    formData.append("referenceId", routeName || "");
    formData.append("documentName", documentName.trim());

    if (isEditMode) {
      formData.append("currentDocumentName", currentDocumentName || selectedDocument?.label || "");
    }

    saveKycDocument(formData);
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
            href={params.data?.documentLink}
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
    {
      field: "actions",
      headerName: "Action",
      width: 120,
      sortable: false,
      cellRenderer: (params) => <ActionMenu onEdit={() => openEditModal(params.data)} />,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={fileRows}
          tableTitle={`KYC Documents of ${name}`}
          buttonTitle={"Add Document"}
          tableHeight={300}
          hideFilter
          search={fileRows.length >= 10}
          loading={isLoading}
          handleClick={openAddModal}
        />
      </PageFrame>

      <MuiModal open={openModal} onClose={resetModal} title={isEditMode ? "Edit Document" : "Add Document"}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4">
            {!isCompany && (
              <Controller
                name="nameOfDirector"
                control={control}
                rules={{ required: "Director Name is required" }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    disabled
                    {...field}
                    fullWidth
                    label={"Director Name"}
                    error={!!errors.nameOfDirector}
                    helperText={errors.nameOfDirector?.message}
                  />
                )}
              />
            )}
            <Controller
              name="type"
              control={control}
              render={({ field }) => <TextField {...field} label={"Type"} fullWidth size="small" disabled />}
            />
            <Controller
              name="documentName"
              control={control}
              rules={{
                required: "Document Name is required",
                validate: {
                  isAlphanumeric,
                  noOnlyWhitespace,
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Document Name"}
                  fullWidth
                  size="small"
                  error={!!errors.documentName}
                  helperText={errors?.documentName?.message}
                />
              )}
            />
            <Controller
              name="kyc"
              control={control}
              rules={{ required: isEditMode ? false : "Document is required" }}
              render={({ field }) => (
                <UploadFileInput
                  onChange={field.onChange}
                  value={field.value}
                  allowedExtensions={["jpg", "jpeg", "png", "pdf"]}
                  label={isEditMode ? "Replace Document" : "Upload Document"}
                />
              )}
            />
            {isEditMode ? (
              <p className="text-xs text-gray-500">
                Uploaded Date will stay the same. If you replace the file, Last Modified will update automatically.
              </p>
            ) : null}

            <PrimaryButton
              type="submit"
              title={isEditMode ? "Save Changes" : "Submit"}
              disabled={isSaving}
              isLoading={isSaving}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default DirectorData;