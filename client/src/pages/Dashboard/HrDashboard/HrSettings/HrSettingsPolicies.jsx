import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import {
  Chip,
  TextField,
  IconButton,
  MenuItem,
} from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { Controller, useForm } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";
import {
  MdDeleteForever,
  MdOutlineRestore,
} from "react-icons/md";
import { FaRegCheckCircle } from "react-icons/fa";
import { HiPencilSquare } from "react-icons/hi2";
import { toast } from "sonner";
import humanDate from "../../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const HrSettingsPolicies = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, inactive
  const [selectedPolicy, setSelectedPolicy] = useState(null);
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

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      policyName: "",
      policyType: "None",
      file: null,
    },
  });
  const {
    handleSubmit: handleAddSubmit,
    control: addControl,
    reset: addReset,
    formState: { errors: addErrors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      policyName: "",
      policyType: "None",
      file: null,
    },
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["policies", Boolean(isTechDepartment)],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-company-documents/policies${
          isTechDepartment ? "?includeDeleted=true" : ""
        }`,
      );
      return response.data.policies;
    },
  });

  const addPolicyMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/company/upload-company-document",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Policy added successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      addReset();
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add policy");
    },
  });

  const updatePolicyMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `/api/company/update-company-data`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Policy updated successfully");
      queryClient.invalidateQueries(["policies"]);
      reset();
      setOpenModal(false);
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleAddPolicy = (data) => {
    const formData = new FormData();
    formData.append("documentName", data.policyName);
    formData.append("type", "policy");
    formData.append("policyType", data.policyType || "None");
    formData.append("document", data.file);
    addPolicyMutation.mutate(formData);
  };

  const handleEdit = (row) => {
    setSelectedPolicy(row);
    reset({
      policyName: row.policyname,
      policyType: row.policyType || "None",
    });
    setModalType("edit");
    setOpenModal(true);
  };

  const handleStatus = (row) => {
    setConfirmationAction({ type: "status", policy: row });
  };

  const handleDelete = (row) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      policy: row,
    });
  };

  const handleRestore = (row) => {
    setConfirmationAction({ type: "restore", policy: row });
  };

  const handleUpdatePolicy = (data) => {
    updatePolicyMutation.mutate({
      type: "policies",
      itemId: selectedPolicy.mongoId,
      oldDocumentName: selectedPolicy.policyname,
      name: data.policyName,
      policyType: data.policyType || "None",
    });
  };

  const handleMarkStatus = (policy) => {
    updatePolicyMutation.mutate({
      type: "policies",
      itemId: policy.mongoId,
      oldDocumentName: policy.policyname,
      newDocumentName: null,
      isActive: !policy.status,
    });
  };

  const deletePolicyMutation = useMutation({
    mutationFn: async (policy) => {
      const response = await axios.patch(
        "/api/company/delete-company-document",
        { documentId: policy.mongoId },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Policy deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setConfirmationAction(null);
      setSelectedPolicy(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to delete policy");
    },
  });

  const restorePolicyMutation = useMutation({
    mutationFn: async (policy) => {
      const response = await axios.patch(
        "/api/company/restore-company-document",
        { documentId: policy.mongoId },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Policy restored successfully");
      queryClient.invalidateQueries({ queryKey: ["policies"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to restore policy");
    },
  });

  const confirmPolicyAction = () => {
    const policy = confirmationAction?.policy;
    if (!policy) return;

    if (confirmationAction.type === "status") {
      handleMarkStatus(policy);
      return;
    }

    if (confirmationAction.type === "restore") {
      restorePolicyMutation.mutate(policy);
      return;
    }

    deletePolicyMutation.mutate(policy);
  };

  const confirmationContent = {
    status: {
      title: `Mark Policy As ${
        confirmationAction?.policy?.status ? "Inactive" : "Active"
      }`,
      message: `Are you sure you want to mark this policy as ${
        confirmationAction?.policy?.status ? "inactive" : "active"
      }?`,
    },
    delete: {
      title: "Delete Policy",
      message: "Are you sure you want to delete this policy?",
    },
    "permanent-delete": {
      title: "Permanently Delete Policy",
      message: "Are you sure you want to permanently delete this policy?",
    },
    restore: {
      title: "Restore Policy",
      message: "Are you sure you want to restore this policy?",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "id", headerName: "Sr No", width: 100 },
    {
      field: "policyname",
      headerName: "POLICY NAME",
      flex: 1,
      cellRenderer: (params) =>
        params.data.isDeleted ? (
          <span className="cursor-not-allowed">
            {params.value}
          </span>
        ) : (
          <a
            href={params.data.policyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary cursor-pointer hover:underline"
          >
            {params.value}
          </a>
        ),
    },
    {
      field: "uploadedDate",
      headerName: "Uploaded Date",
      width: 150,
    },
    {
      field: "policyType",
      headerName: "TYPE",
      width: 130,
    },
    {
      field: "updatedDate",
      headerName: "Updated Date",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      sort: "desc",
      flex: 1,
      cellRenderer: (params) => {
        const label = params.data.isDeleted
          ? "Disabled"
          : params.value
            ? "Active"
            : "Inactive";
        const colors = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Disabled: { backgroundColor: "#D3D3D3", color: "#666666" },
        };
        return <Chip label={label} style={colors[label]} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isActive = params.data.status;
        const isDeleted = params.data.isDeleted;

        if (isDeleted) {
          return (
            <div className="flex h-full items-center gap-2">
              <button
                type="button"
                title="Restore policy"
                aria-label="Restore policy"
                className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  restorePolicyMutation.isPending ||
                  deletePolicyMutation.isPending
                }
                onClick={() => handleRestore(params.data)}
              >
                <MdOutlineRestore size={24} />
              </button>
              <button
                type="button"
                title="Permanently delete policy"
                aria-label="Permanently delete policy"
                className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
                disabled={
                  deletePolicyMutation.isPending ||
                  restorePolicyMutation.isPending
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
              title={`Mark policy as ${isActive ? "inactive" : "active"}`}
              aria-label={`Mark policy as ${isActive ? "inactive" : "active"}`}
              className={`flex h-8 w-8 items-center justify-center ${
                isActive
                  ? "text-red-600 hover:text-red-700"
                  : "text-green-600 hover:text-green-700"
              }`}
              onClick={() => handleStatus(params.data)}
            >
              <FaRegCheckCircle size={24} />
            </button>
            <button
              type="button"
              title="Edit policy"
              aria-label="Edit policy"
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              onClick={() => handleEdit(params.data)}
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={isTechDepartment ? "Permanently delete policy" : "Delete policy"}
              aria-label={isTechDepartment ? "Permanently delete policy" : "Delete policy"}
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
        key={policies.length}
        search
        searchColumn="Policies"
        tableTitle="Policy List"
        buttonTitle="Add Policy"
        handleClick={() => {
          setModalType("add");
          addReset({ policyName: "", policyType: "None", file: null });
          setOpenModal(true);
        }}
        columns={columns}
        getRowStyle={(params) =>
          params.data?.isDeleted
            ? { backgroundColor: "#f4f4f4", color: "#7a7a7a" }
            : undefined
        }
        data={policies.map((policy, index) => ({
          id: index + 1,
          mongoId: policy._id,
          policyname: policy.name,
          policyLink: policy.documentLink,
          policyType: policy.policyType || "None",
          status: policy.isActive,
          isDeleted: Boolean(policy.isDeleted),
          uploadedDate: humanDate(policy.createdAt),
          updatedDate: humanDate(policy.updatedAt),
        }))}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={modalType === "edit" ? "Edit Policy Name" : "Add New Policy"}
      >
        {modalType === "add" && (
          <form
            className="grid grid-cols-1 gap-4"
            onSubmit={handleAddSubmit(handleAddPolicy)}
          >
            <Controller
              name="policyName"
              control={addControl}
              rules={{
                required: "Policy Name is required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Name"
                  size="small"
                  variant="outlined"
                  fullWidth
                  error={!!addErrors?.policyName}
                  helperText={addErrors?.policyName?.message}
                />
              )}
            />
            <Controller
              name="policyType"
              control={addControl}
              rules={{ required: "Policy Type is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Type"
                  size="small"
                  select
                  fullWidth
                  error={!!addErrors?.policyType}
                  helperText={addErrors?.policyType?.message}
                >
                  <MenuItem value="Leave">Leave</MenuItem>
                  <MenuItem value="Holiday">Holiday</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="file"
              control={addControl}
              defaultValue={null}
              render={({ field: { onChange, value } }) => (
                <>
                  <input
                    id="image-upload"
                    type="file"
                    accept=".png,.jpg,.jpeg,.pdf"
                    hidden
                    onChange={(e) => onChange(e.target.files[0])}
                  />
                  <TextField
                    size="small"
                    variant="outlined"
                    fullWidth
                    label="Upload Policy"
                    value={value ? value.name : ""}
                    placeholder="Choose a file..."
                    InputProps={{
                      readOnly: true,
                      endAdornment: (
                        <IconButton
                          color="primary"
                          component="label"
                          htmlFor="image-upload"
                        >
                          <LuImageUp />
                        </IconButton>
                      ),
                    }}
                  />
                </>
              )}
            />
            <PrimaryButton
              title={"Submit"}
              type={"submit"}
              disabled={addPolicyMutation.isPending}
              isLoading={addPolicyMutation.isPending}
            />
          </form>
        )}
        {modalType === "edit" && (
          <form
            onSubmit={handleSubmit(
              modalType === "edit" ? handleUpdatePolicy : handleAddPolicy,
            )}
            className="flex flex-col gap-4"
          >
            <Controller
              name="policyName"
              control={control}
              rules={{
                required: "Policy Name is required",
                validate: { noOnlyWhitespace, isAlphanumeric },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Name"
                  size="small"
                  variant="outlined"
                  fullWidth
                  error={!!errors?.policyName}
                  helperText={errors?.policyName?.message}
                />
              )}
            />
            <Controller
              name="policyType"
              control={control}
              rules={{ required: "Policy Type is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Policy Type"
                  size="small"
                  select
                  fullWidth
                  error={!!errors?.policyType}
                  helperText={errors?.policyType?.message}
                >
                  <MenuItem value="Leave">Leave</MenuItem>
                  <MenuItem value="Holiday">Holiday</MenuItem>
                  <MenuItem value="None">None</MenuItem>
                </TextField>
              )}
            />

            <PrimaryButton
              title={modalType === "edit" ? "Update Policy" : "Add Policy"}
              type="submit"
              isLoading={
                addPolicyMutation.isPending || updatePolicyMutation.isPending
              }
              disabled={
                addPolicyMutation.isPending || updatePolicyMutation.isPending
              }
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
          updatePolicyMutation.isPending ||
          deletePolicyMutation.isPending ||
          restorePolicyMutation.isPending
        }
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmPolicyAction}
      />
    </PageFrame>
  );
};

export default HrSettingsPolicies;
