import PrimaryButton from "../../components/PrimaryButton";
import { useState } from "react";
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
import { isAlphanumeric, noOnlyWhitespace } from "../../utils/validators";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import ConfirmationModal from "../ConfirmationModal";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const PolicyUpload = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const isTechDepartment = auth?.user?.departments?.some(
    (userDepartment) =>
      String(userDepartment?._id || userDepartment) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        userDepartment?.name?.trim().toLowerCase(),
      ),
  );
  const department = usePageDepartment();
  const [openModal, setOpenModal] = useState(false);
  const [selectedSop, setSelectedSop] = useState(null);
  const [modalType, setModalType] = useState("");
  const [confirmationAction, setConfirmationAction] = useState(null);

  // For adding an Policies
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
    mutationFn: async ({ policy, documentName }) => {
      const formData = new FormData();
      formData.append("department-document", policy);
      formData.append("type", "policy");
      formData.append(
        "documentName",
        documentName || policy?.name || "Untitled"
      );

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
      toast.success("Policy uploaded successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({
        queryKey: ["departmentPolicy", department?._id],
      });
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
      toast.success("Policy uploaded successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentPolicy"] });
    },
    onError: () => {
      toast.error("Failed to upload Policy.");
    },
  });

  const handleAddPolicy = () => {
    setModalType("add");
    setOpenModal(true);
  };

  const handleEdit = (data) => {
    setModalType("edit");
    setSelectedSop(data);
    setEditValue("newName", data?.name.trim() || "");
    setOpenModal(true);
  };

  const documentActionMutation = useMutation({
    mutationFn: async ({ type, policy }) => {
      if (type === "status") {
        const response = await axios.patch(
          "/api/company/update-department-document",
          {
            documentId: policy._id,
            isActive: !policy.isActive,
          },
        );
        return response.data;
      }

      const response = await axios.patch(
        "/api/company/delete-department-document",
        {
          documentId: policy._id,
          action: type,
        },
      );
      return response.data;
    },
    onSuccess: (response, { type, policy }) => {
      if (
        (type === "delete" && !isTechDepartment) ||
        type === "permanent-delete"
      ) {
        queryClient.setQueryData(
          ["departmentPolicy", department?._id, Boolean(isTechDepartment)],
          (currentPolicies = []) =>
            currentPolicies.filter(
              (currentPolicy) => currentPolicy._id !== policy._id,
            ),
        );
      }

      toast.success(response.message || "Policy updated successfully");
      setConfirmationAction(null);
      queryClient.invalidateQueries({ queryKey: ["departmentPolicy"] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update Policy");
    },
  });

  const { data = [], isLoading } = useQuery({
    queryKey: [
      "departmentPolicy",
      department?._id,
      Boolean(isTechDepartment),
    ],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${department?._id}&type=policies${
          isTechDepartment ? "&includeDeleted=true" : ""
        }`,
      );
      return response?.data?.documents?.policyDocuments || [];
    },
    enabled: !!department?._id,
  });

  const confirmationContent = {
    status: {
      title: `Mark Policy As ${
        confirmationAction?.policy?.isActive ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this policy as ${
        confirmationAction?.policy?.isActive ? "inactive" : "active"
      }?`,
      confirmText: "Yes",
    },
    delete: {
      title: "Delete Policy",
      message: "Are you sure you want to delete this policy?",
      confirmText: "Delete",
    },
    restore: {
      title: "Restore Policy",
      message: "Are you sure you want to restore this policy?",
      confirmText: "Restore",
    },
    "permanent-delete": {
      title: "Permanently Delete Policy",
      message: "Are you sure you want to permanently delete this policy?",
      confirmText: "Delete Permanently",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Policy Name",
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
    ...(data.some((policy) => Boolean(policy.isDeleted))
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
                title="Restore Policy"
                aria-label="Restore Policy"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={documentActionMutation.isPending}
                onClick={() =>
                  setConfirmationAction({
                    type: "restore",
                    policy: params.data,
                  })
                }
              >
                <MdOutlineRestore size={24} />
              </button>
              <button
                type="button"
                title="Permanently delete Policy"
                aria-label="Permanently delete Policy"
                className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={documentActionMutation.isPending}
                onClick={() =>
                  setConfirmationAction({
                    type: "permanent-delete",
                    policy: params.data,
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
              title={`Mark Policy as ${params.data.isActive ? "inactive" : "active"}`}
              aria-label={`Mark Policy as ${params.data.isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center ${
                params.data.isActive
                  ? "text-green-600 hover:text-green-700"
                  : "text-red-600 hover:text-red-700"
              }`}
              onClick={() =>
                setConfirmationAction({ type: "status", policy: params.data })
              }
            >
              {params.data.isActive ? (
                <FaRegCheckCircle size={24} />
              ) : (
                <FaRegTimesCircle size={24} />
              )}
            </button>
            <button
              type="button"
              title="Edit Policy"
              aria-label="Edit Policy"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={isTechDepartment ? "Permanently delete Policy" : "Delete Policy"}
              aria-label={isTechDepartment ? "Permanently delete Policy" : "Delete Policy"}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
              onClick={() =>
                setConfirmationAction({
                  type: isTechDepartment ? "permanent-delete" : "delete",
                  policy: params.data,
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
            key={tableData.length}
            dateColumn={"date"}
            columns={columns}
            data={tableData}
            buttonTitle={"Add Policy"}
            handleSubmit={handleAddPolicy}
            search
            tableTitle="Policy documents"
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
        title={modalType === "edit" ? "Edit Policy" : "Add Policy"}
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
                  required: "Document Name is Required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    name="documentName"
                    label="Document Name"
                    size="small"
                    {...field}
                    fullWidth
                    error={!!errors.documentName}
                    helperText={errors?.documentName?.message}
                  />
                )}
              />
              <Controller
                name="policy"
                control={control}
                rules={{ required: "Policy is Required" }}
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
                title={"Upload Policy"}
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
                title={"Update Policy"}
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

export default PolicyUpload;
