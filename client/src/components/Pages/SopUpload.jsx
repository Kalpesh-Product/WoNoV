import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../components/WidgetSection";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import usePageDepartment from "../../hooks/usePageDepartment";
import PageFrame from "./PageFrame";
import { queryClient } from "../../main";
import MuiModal from "../MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Chip, TextField } from "@mui/material";
import UploadFileInput from "../UploadFileInput";
import YearWiseTable from "../Tables/YearWiseTable";
import { noOnlyWhitespace, isAlphanumeric } from "../../utils/validators";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import ConfirmationModal from "../ConfirmationModal";
import { FaRegCheckCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const SopUpload = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const isTechDepartment = auth?.user?.departments?.some(
    (userDepartment) =>
      String(userDepartment?._id || userDepartment) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        userDepartment?.name?.trim().toLowerCase(),
      ),
  );
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const department = usePageDepartment();
  const [openModal, setOpenModal] = useState(false);
  const [selectedSop, setSelectedSop] = useState(null);
  const [modalType, setModalType] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);
  const uploadItems = ["Upload Sops"];

  // For adding an SOP
  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      documentName: "",
      sop: null,
    },
  });

  //For Editing SOP
  const {
    handleSubmit: handleEditForm,
    control: controlEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
    setValue: setEditValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      newName: "",
    },
  });

  const { mutate: uploadSop, isPending } = useMutation({
    mutationFn: async ({ sop, documentName }) => {
      const formData = new FormData();
      formData.append("department-document", sop);
      formData.append("type", "sop");
      formData.append("documentName", documentName || sop?.name || "Untitled");

      const response = await axios.post(
        `/api/company/add-department-document/${department?._id || ""}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP uploaded successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to upload SOP.");
    },
  });

  const { mutate: editSop, isPending: isEditPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/company/update-department-document`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP updated successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: () => {
      toast.error("Failed to update SOP.");
    },
  });
  const documentActionMutation = useMutation({
    mutationFn: async ({ type, sop }) => {
      if (type === "status") {
        const response = await axios.patch(
          "/api/company/update-department-document",
          {
            documentId: sop._id,
            isActive: !sop.isActive,
          },
        );
        return response.data;
      }

      const response = await axios.patch(
        "/api/company/delete-department-document",
        {
          documentId: sop._id,
          action: type,
        },
      );
      return response.data;
    },
    onSuccess: (response, { type, sop }) => {
      if (
        (type === "delete" && !isTechDepartment) ||
        type === "permanent-delete"
      ) {
        queryClient.setQueryData(
          ["departmentSOP", department?._id, Boolean(isTechDepartment)],
          (currentSops = []) =>
            currentSops.filter((currentSop) => currentSop._id !== sop._id),
        );
      }

      toast.success(response.message || "SOP updated successfully");
      setConfirmationAction(null);
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update SOP");
    },
  });

  const handleAddSop = () => {
    setModalType("add");
    setOpenModal(true);
  };

  const handleEdit = (data) => {
    setModalType("edit");
    setSelectedSop(data);
    setEditValue("newName", data?.name.trim() || "");
    setOpenModal(true);
  };
  const { data = [], isLoading } = useQuery({
    queryKey: ["departmentSOP", department?._id, Boolean(isTechDepartment)],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${department?._id}&type=sop${
          isTechDepartment ? "&includeDeleted=true" : ""
        }`,
      );
      return response?.data?.documents?.sopDocuments || [];
    },
    enabled: !!department?._id,
    staleTime: 1000 * 60 * 5,
  });

  const confirmationContent = {
    status: {
      title: `Mark SOP As ${
        confirmationAction?.sop?.isActive ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this SOP as ${
        confirmationAction?.sop?.isActive ? "inactive" : "active"
      }?`,
      confirmText: "Yes",
    },
    delete: {
      title: "Delete SOP",
      message: "Are you sure you want to delete this SOP?",
      confirmText: "Delete",
    },
    restore: {
      title: "Restore SOP",
      message: "Are you sure you want to restore this SOP?",
      confirmText: "Restore",
    },
    "permanent-delete": {
      title: "Permanently Delete SOP",
      message: "Are you sure you want to permanently delete this SOP?",
      confirmText: "Delete Permanently",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "SOP Name",
      flex: 1,
      cellRenderer: (params) =>
        params.data.isDeleted ? (
          <span className="cursor-not-allowed">{params.value}</span>
        ) : (
          <a
            className="text-primary underline cursor-pointer"
            href={params?.data.documentLink || "#"}
            target="_blank"
            rel="noopener noreferrer"
          >
            {params.value}
          </a>
        ),
    },
    { field: "date", headerName: "Upload Date", flex: 1 },
    { field: "updatedAt", headerName: "Modified Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.data.isDeleted
          ? "Disabled"
          : params.data.isActive
            ? "Active"
            : "Inactive";
        const colors = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };
        return <Chip label={status} style={colors[status]} />;
      },
    },
    ...(data.some((sop) => Boolean(sop.isDeleted))
      ? [
          {
            field: "deletedByName",
            headerName: "Deleted By",
            flex: 1,
            valueGetter: (params) =>
              params.data?.isDeleted ? params.data.deletedByName : "",
          },
        ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        if (params.data.isDeleted) {
          return (
            <div className="flex h-full items-center gap-2">
              <button
                type="button"
                title="Restore SOP"
                aria-label="Restore SOP"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={documentActionMutation.isPending}
                onClick={() =>
                  setConfirmationAction({ type: "restore", sop: params.data })
                }
              >
                <MdOutlineRestore size={24} />
              </button>
              <button
                type="button"
                title="Permanently delete SOP"
                aria-label="Permanently delete SOP"
                className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={documentActionMutation.isPending}
                onClick={() =>
                  setConfirmationAction({
                    type: "permanent-delete",
                    sop: params.data,
                  })
                }
              >
                <MdDeleteForever size={24} />
              </button>
            </div>
          );
        }

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title={`Mark SOP as ${params.data.isActive ? "inactive" : "active"}`}
              aria-label={`Mark SOP as ${params.data.isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center ${
                params.data.isActive
                  ? "text-red-600 hover:text-red-700"
                  : "text-green-600 hover:text-green-700"
              }`}
              onClick={() =>
                setConfirmationAction({ type: "status", sop: params.data })
              }
            >
              <FaRegCheckCircle size={24} />
            </button>
            <button
              type="button"
              title="Edit SOP"
              aria-label="Edit SOP"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={isTechDepartment ? "Permanently delete SOP" : "Delete SOP"}
              aria-label={isTechDepartment ? "Permanently delete SOP" : "Delete SOP"}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
              onClick={() =>
                setConfirmationAction({
                  type: isTechDepartment ? "permanent-delete" : "delete",
                  sop: params.data,
                })
              }
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        );
      },
    },
  ];

  const tableData =
    Array.isArray(data) && !isLoading
      ? data
          .map((item, index) => ({
            ...item,
            srNo: index + 1,
            name: item?.name || "Untitled",
            documentLink: item?.documentLink || "#",
            date: item.createdAt,
            status: item.isDeleted
              ? "Disabled"
              : item.isActive
                ? "Active"
                : "Inactive",
            deletedByName: item.deletedBy
              ? [item.deletedBy.firstName, item.deletedBy.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                item.deletedBy.employeeName ||
                item.deletedBy.name ||
                item.deletedBy.email ||
                "—"
              : "—",
            updatedAt: humanDate(item.updatedAt),
          }))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageFrame>
          <YearWiseTable
            dateColumn={"date"}
            key={data?.length || 0}
            columns={columns}
            data={tableData}
            buttonTitle={"Add SOP"}
            handleSubmit={handleAddSop}
            search
            tableTitle="SOP documents"
            getRowStyle={(params) =>
              params.data?.isDeleted
                ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
                : undefined
            }
          />
        </PageFrame>
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={modalType === "edit" ? "Edit SOP" : "Add SOP"}
      >
        {modalType === "add" && (
          <div>
            <form
              onSubmit={handleSubmit((data) => uploadSop(data))}
              className="grid grid-cols-1 gap-4"
            >
              <Controller
                name="documentName"
                control={control}
                rules={{
                  required: "Document Name is required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Document Name"
                    size="small"
                    fullWidth
                    error={!!errors.documentName}
                    helperText={errors?.documentName?.message}
                  />
                )}
              />
              <Controller
                name="sop"
                control={control}
                rules={{ required: "SOP is Required" }}
                render={({ field }) => (
                  <UploadFileInput
                    value={field.value}
                    onChange={field.onChange}
                    previewType="pdf"
                    allowedExtensions={["pdf"]}
                    onInvalidFile={() =>
                      toast.error("Only PDF files are allowed.")
                    }
                  />
                )}
              />
              <PrimaryButton
                type={"submit"}
                title={"Upload SOP"}
                isLoading={isPending}
                disabled={isPending}
              />
            </form>
          </div>
        )}

        {modalType === "edit" && (
          <div>
            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={handleEditForm((data) =>
                editSop({
                  newName: data.newName,
                  documentId: selectedSop?._id,
                })
              )}
            >
              <Controller
                name="newName"
                control={controlEdit}
                rules={{
                  required: "Document Name is Required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Document Name"
                    fullWidth
                    error={!!editErrors.newName}
                    helperText={editErrors?.newName?.message}
                  />
                )}
              />
              <PrimaryButton
                type={"submit"}
                title={"Update SOP"}
                isLoading={isEditPending}
                disabled={isEditPending}
              />
            </form>
          </div>
        )}

      </MuiModal>
      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText={confirmationContent?.confirmText}
        cancelText="Cancel"
        isLoading={documentActionMutation.isPending}
        onClose={() => setConfirmationAction(null)}
        onConfirm={() => documentActionMutation.mutate(confirmationAction)}
      />
    </div>
  );
};

export default SopUpload;
