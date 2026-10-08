import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, IconButton, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { LuImageUp } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import humanDate from "../../../../utils/humanDateForamt";
import humanTime from "../../../../utils/humanTime";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import { FaRegCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const HrSOP = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "add", "edit", "inactive"
  const [selectedSop, setSelectedSop] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);

  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );

  // Add SOP Form
  const {
    handleSubmit: handleAddSubmit,
    control: addControl,
    reset: resetAddForm,
    formState: { errors: addErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: { sopName: "", file: null },
  });

  // Edit SOP Form
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: { sopName: "", status: "true" },
  });

  const { data: sops = [] } = useQuery({
    queryKey: ["sops", Boolean(isTechDepartment)],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-company-documents/sop${
          isTechDepartment ? "?includeDeleted=true" : ""
        }`,
      );
      return response.data.sop;
    },
  });

  const addSopMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/company/upload-company-document",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP added successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      resetAddForm();
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add SOP");
    },
  });

  const updateSopMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        "/api/company/update-company-data",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setOpenModal(false);
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const makeInactiveSopMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        "/api/company/update-company-data",
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        "SOP status updated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleAddSop = (data) => {
    const formData = new FormData();
    formData.append("documentName", data.sopName);
    formData.append("type", "sop");
    formData.append("document", data.file);
    addSopMutation.mutate(formData);
  };

  const handleUpdateSop = (data) => {
    updateSopMutation.mutate({
      type: "sop",
      itemId: selectedSop.mongoId,
      oldDocumentName: selectedSop.sopname,
      name: data.sopName,
      // isActive: data.status === "true",
    });
  };

  const handleMarkInactive = (sop) => {
    makeInactiveSopMutation.mutate({
      type: "sop",
      itemId: sop.mongoId,
      oldDocumentName: sop.sopname,
      newDocumentName: null,
      isActive: !sop.isActive,
    });
  };

  const handleOpenAdd = () => {
    setModalType("add");
    resetAddForm({ sopName: "", file: null });
    setOpenModal(true);
  };

  const handleOpenEdit = (row) => {
    setModalType("edit");
    setSelectedSop(row);
    resetEditForm({
      sopName: row.sopname,
    });
    setOpenModal(true);
  };

  const handleOpenInactive = (row) => {
    setConfirmationAction({ type: "status", sop: row });
  };

  const handleDelete = (row) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      sop: row,
    });
  };

  const handleRestore = (row) => {
    setConfirmationAction({ type: "restore", sop: row });
  };

  const deleteSopMutation = useMutation({
    mutationFn: async (sop) => {
      const response = await axios.patch(
        "/api/company/delete-company-document",
        { documentId: sop.mongoId },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "SOP deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete SOP");
    },
  });

  const restoreSopMutation = useMutation({
    mutationFn: async (sop) => {
      const response = await axios.patch(
        "/api/company/restore-company-document",
        { documentId: sop.mongoId },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "SOP restored successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to restore SOP");
    },
  });

  const confirmSopAction = () => {
    const sop = confirmationAction?.sop;
    if (!sop) return;

    if (confirmationAction.type === "status") {
      handleMarkInactive(sop);
      return;
    }

    if (confirmationAction.type === "restore") {
      restoreSopMutation.mutate(sop);
      return;
    }

    deleteSopMutation.mutate(sop);
  };

  const confirmationContent = {
    status: {
      title: `Mark SOP As ${
        confirmationAction?.sop?.isActive ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this SOP as ${
        confirmationAction?.sop?.isActive ? "inactive" : "active"
      }?`,
    },
    delete: {
      title: "Delete SOP",
      message: "Are you sure you want to delete this SOP?",
    },
    "permanent-delete": {
      title: "Permanently Delete SOP",
      message: "Are you sure you want to permanently delete this SOP?",
    },
    restore: {
      title: "Restore SOP",
      message: "Are you sure you want to restore this SOP?",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "id", headerName: "Sr No" },
    {
      field: "sopname",
      headerName: "SOP NAME",
      cellRenderer: (params) =>
        params.data.isDeleted ? (
          <span className="cursor-not-allowed">{params.value}</span>
        ) : (
          <a
            href={params.data.sopLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary cursor-pointer hover:underline"
          >
            {params.value}
          </a>
        ),
      flex: 1,
    },
   // { field: "uploadedDate", headerName: "Uploaded Date", width: 150 },
    { field: "updatedDate", headerName: "Updated Date", width: 150 },
    { field: "updatedTime", headerName: "Updated Time", width: 150 },
    {
      field: "isActive",
      headerName: "Status",
      sort: "desc",
      cellRenderer: (params) => {
        const status = params.data.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const styles = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };
        const { backgroundColor, color } = styles[status] || {};
        return <Chip label={status} style={{ backgroundColor, color }} />;
      },
      flex: 1,
    },
    ...(sops.some((sop) => Boolean(sop.isDeleted))
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
        const isActive = params.data.isActive;
        const isDeleted = params.data.isDeleted;

        if (isDeleted) {
          return (
            <div className="flex h-full items-center gap-2">
              <button
                type="button"
                title="Restore SOP"
                aria-label="Restore SOP"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  restoreSopMutation.isPending || deleteSopMutation.isPending
                }
                onClick={() => handleRestore(params.data)}
              >
                <MdOutlineRestore size={24} />
              </button>
              <button
                type="button"
                title="Permanently delete SOP"
                aria-label="Permanently delete SOP"
                className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  deleteSopMutation.isPending || restoreSopMutation.isPending
                }
                onClick={() => handleDelete(params.data)}
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
              title={`Mark SOP as ${isActive ? "inactive" : "active"}`}
              aria-label={`Mark SOP as ${isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center ${
                isActive
                  ? "text-green-600 hover:text-green-700"
                  : "text-red-600 hover:text-red-700"
              }`}
              onClick={() => handleOpenInactive(params.data)}
            >
              {isActive ? (
                <FaRegCheckCircle size={24} />
              ) : (
                <FaRegTimesCircle size={24} />
              )}
            </button>
            <button
              type="button"
              title="Edit SOP"
              aria-label="Edit SOP"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleOpenEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={isTechDepartment ? "Permanently delete SOP" : "Delete SOP"}
              aria-label={isTechDepartment ? "Permanently delete SOP" : "Delete SOP"}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700"
              onClick={() => handleDelete(params.data)}
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <PageFrame>
      <AgTable
        key={sops.length}
        search
        searchColumn="SOPs"
        tableTitle="SOP List"
        buttonTitle="Add SOP"
        data={sops.map((sop, i) => ({
          id: i + 1,
          mongoId: sop._id,
          sopname: sop.name,
          isActive: sop.isActive,
          isDeleted: Boolean(sop.isDeleted),
          deletedByName: sop.deletedBy
            ? [sop.deletedBy.firstName, sop.deletedBy.lastName]
                .filter(Boolean)
                .join(" ") ||
              sop.deletedBy.employeeName ||
              sop.deletedBy.name ||
              sop.deletedBy.email ||
              "—"
            : "—",
          sopLink: sop.documentLink,
          uploadedDate: humanDate(sop.createdAt),
          updatedDate: humanDate(sop.updatedAt),
          updatedTime: sop.updatedAt ? humanTime(sop.updatedAt) : "—",
        }))}
        getRowStyle={(params) =>
          params.data?.isDeleted
            ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
            : undefined
        }
        handleClick={handleOpenAdd}
        columns={columns}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={modalType === "edit" ? "Edit SOP" : "Add New SOP"}
      >
        {modalType === "edit" ? (
          <form
            onSubmit={handleEditSubmit(handleUpdateSop)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="sopName"
              control={editControl}
              rules={{
                required: "SOP Name is Required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SOP Name"
                  size="small"
                  fullWidth
                  variant="outlined"
                  error={!!editErrors?.sopName}
                  helperText={editErrors?.sopName?.message}
                />
              )}
            />

            <PrimaryButton
              title="Update SOP"
              type="submit"
              isLoading={updateSopMutation.isPending}
            />
          </form>
        ) : (
          <form
            onSubmit={handleAddSubmit(handleAddSop)}
            className="flex flex-col gap-4"
          >
            <Controller
              name="sopName"
              control={addControl}
              rules={{
                required: "SOP Name is Required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SOP Name"
                  size="small"
                  fullWidth
                  variant="outlined"
                  error={!!addErrors?.sopName}
                  helperText={addErrors?.sopName?.message}
                />
              )}
            />

            <Controller
              name="file"
              control={addControl}
              render={({ field: { onChange, value } }) => (
                <>
                  <input
                    id="upload-sop"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    hidden
                    onChange={(e) => onChange(e.target.files[0])}
                  />
                  <TextField
                    label="Upload SOP"
                    value={value?.name || ""}
                    fullWidth
                    size="small"
                    variant="outlined"
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton component="label" htmlFor="upload-sop">
                          <LuImageUp />
                        </IconButton>
                      ),
                    }}
                  />
                </>
              )}
            />

            <PrimaryButton
              title="Add SOP"
              type="submit"
              isLoading={addSopMutation.isPending}
            />
          </form>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={
          makeInactiveSopMutation.isPending ||
          deleteSopMutation.isPending ||
          restoreSopMutation.isPending
        }
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmSopAction}
      />
    </PageFrame>
  );
};

export default HrSOP;
