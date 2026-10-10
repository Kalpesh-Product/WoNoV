import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";
import PrimaryButton from "../../../../components/PrimaryButton";
import humanDate from "../../../../utils/humanDateForamt";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const ComplianceData = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );

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
    queryKey: ["complianceDocuments", Boolean(isTechDepartment)],
    queryFn: async () => {
      const res = await axios.get("/api/company/get-compliance-documents", {
        params: { includeDeleted: Boolean(isTechDepartment) },
      });
      return res.data.data;
    },
  });

  const fileRows = complianceData.map((file, index) => ({
    id: file._id,
    srno: index + 1,
    label: file?.name?.trim() || "Unnamed Document",
    documentLink: file?.documentLink?.trim() || null,
    uploadedDate: file?.createdDate || null,
    lastModified: file?.updatedDate || null,
    isDeleted: Boolean(file?.isDeleted),
    deletedByName: file?.deletedBy
      ? [file.deletedBy.firstName, file.deletedBy.lastName]
          .filter(Boolean)
          .join(" ") ||
        file.deletedBy.employeeName ||
        file.deletedBy.name ||
        file.deletedBy.email ||
        "N/A"
      : "",
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
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Upload failed. Try again.");
    },
  });

  const { mutate: updateDocument, isPending: isUpdating } = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.patch(
        "/api/company/update-compliance-document",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data;
    },
    onSuccess: () => {
      toast.success("Document updated successfully");
      queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Document update failed");
    },
  });

  const { mutate: manageDocument, isPending: isManaging } = useMutation({
    mutationFn: async ({ documentId, action }) => {
      const res = await axios.patch("/api/company/manage-compliance-document", {
        documentId,
        action,
      });
      return res.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Compliance document updated successfully");
      queryClient.invalidateQueries({ queryKey: ["complianceDocuments"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to update compliance document",
      );
    },
  });

  const closeModal = () => {
    setOpenModal(false);
    setSelectedDocument(null);
    reset({ documentName: "", document: null });
  };

  const openAddModal = () => {
    setSelectedDocument(null);
    reset({ documentName: "", document: null });
    setOpenModal(true);
  };

  const openEditModal = (document) => {
    setSelectedDocument(document);
    reset({ documentName: document.label, document: null });
    setOpenModal(true);
  };

  const onSubmit = (formValues) => {
    const { documentName, document } = formValues;
    if (!selectedDocument && !document) {
      return toast.error("Please upload a document");
    }

    const formData = new FormData();
    formData.append("documentName", documentName);
    if (document) formData.append("document", document);

    if (selectedDocument) {
      formData.append("documentId", selectedDocument.id);
      updateDocument(formData);
      return;
    }

    uploadDocument(formData);
  };

  const handleDelete = (document) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      document,
    });
  };

  const handleRestore = (document) => {
    setConfirmationAction({ type: "restore", document });
  };

  const confirmDocumentAction = () => {
    const document = confirmationAction?.document;
    if (!document) return;

    manageDocument({
      documentId: document.id,
      action: confirmationAction.type === "restore" ? "restore" : "delete",
    });
  };

  const confirmationContent = {
    delete: {
      title: "Delete Compliance Document",
      message: "Are you sure you want to delete this compliance document?",
    },
    "permanent-delete": {
      title: "Permanently Delete Compliance Document",
      message:
        "Are you sure you want to permanently delete this compliance document?",
    },
    restore: {
      title: "Restore Compliance Document",
      message: "Are you sure you want to restore this compliance document?",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "label",
      headerName: "Document",
      flex: 1,
      cellRenderer: (params) =>
        params.data.isDeleted ? (
          <span className="text-gray-500 cursor-not-allowed">
            {params.value}
          </span>
        ) : params.value ? (
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
    ...(fileRows.some((file) => file.isDeleted)
      ? [
          {
            field: "deletedByName",
            headerName: "Deleted By",
            flex: 1,
          },
        ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) =>
        data.isDeleted ? (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="Restore compliance document"
              aria-label="Restore compliance document"
              disabled={isManaging}
              onClick={() => handleRestore(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdOutlineRestore size={24} />
            </button>
            <button
              type="button"
              title="Permanently delete compliance document"
              aria-label="Permanently delete compliance document"
              disabled={isManaging}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ) : (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="Edit compliance document"
              aria-label="Edit compliance document"
              onClick={() => openEditModal(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={
                isTechDepartment
                  ? "Permanently delete compliance document"
                  : "Delete compliance document"
              }
              aria-label="Delete compliance document"
              disabled={isManaging}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ),
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
          handleClick={openAddModal}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={closeModal}
        title={selectedDocument ? "Edit Document" : "Add Document"}
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
            rules={{
              required: selectedDocument ? false : "Document file is required",
            }}
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
            title={selectedDocument ? "Save Changes" : "Submit"}
            disabled={isUploading || isUpdating}
            isLoading={isUploading || isUpdating}
          />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isManaging}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmDocumentAction}
      />
    </div>
  );
};

export default ComplianceData;
