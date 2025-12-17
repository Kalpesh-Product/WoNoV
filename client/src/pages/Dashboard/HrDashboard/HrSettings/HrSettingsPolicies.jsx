import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, TextField, IconButton, DialogActions } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { Controller, useForm } from "react-hook-form";
import { LuImageUp } from "react-icons/lu";
import { toast } from "sonner";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import humanDate from "../../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const HrSettingsPolicies = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, inactive
  const [selectedPolicy, setSelectedPolicy] = useState(null);

  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      policyName: "",
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
      file: null,
    },
  });

  const { data: policies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/get-company-documents/policies"
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
        }
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
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Policy updated successfully");
      queryClient.invalidateQueries(["policies"]);
      reset();
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const handleAddPolicy = (data) => {
    const formData = new FormData();
    formData.append("documentName", data.policyName);
    formData.append("type", "policy");
    formData.append("document", data.file);
    addPolicyMutation.mutate(formData);
  };

  const handleEdit = (row) => {
    setSelectedPolicy(row);
    reset({ policyName: row.policyname });
    setModalType("edit");
    setOpenModal(true);
  };

  const handleInactive = (row) => {
    setSelectedPolicy(row);
    setModalType("inactive");
    setOpenModal(true);
  };
  const handleActive = (row) => {
    setSelectedPolicy(row);
    setModalType("inactive");
    setOpenModal(true);
  };

  const handleUpdatePolicy = (data) => {
    updatePolicyMutation.mutate({
      type: "policies",
      itemId: selectedPolicy.mongoId,
      oldDocumentName: selectedPolicy.policyname,
      name: data.policyName,
    });
  };

  const handleMarkInactive = () => {
    updatePolicyMutation.mutate({
      type: "policies",
      itemId: selectedPolicy.mongoId,
      oldDocumentName: selectedPolicy.policyname,
      newDocumentName: null,
      isActive: false,
    });
  };
  const handleMarkActive = () => {
    updatePolicyMutation.mutate({
      type: "policies",
      itemId: selectedPolicy.mongoId,
      oldDocumentName: selectedPolicy.policyname,
      newDocumentName: null,
      isActive: true,
    });
  };

  const columns = [
    { field: "id", headerName: "Sr No", width: 100 },
    {
      field: "policyname",
      headerName: "POLICY NAME",
      flex: 1,
      cellRenderer: (params) => (
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
      field: "updatedDate",
      headerName: "Updated Date",
      width: 150,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const label = params.value ? "Active" : "Inactive";
        const colors = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
        };
        return <Chip label={label} style={colors[label]} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const isActive = params.data.status;
        const actions = [
          { label: "Edit", onClick: () => handleEdit(params.data) },
        ];

        if (isActive === true) {
          actions.push({
            label: "Mark As Inactive",
            onClick: () => handleInactive(params.data),
          });
        } else if (isActive === false) {
          actions.push({
            label: "Mark As Active",
            onClick: () => handleActive(params.data), // You probably want a separate handler here
          });
        }

        return <ThreeDotMenu rowId={params.data.id} menuItems={actions} />;
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
          reset({ policyName: "", file: null });
          setOpenModal(true);
        }}
        columns={columns}
        data={policies.map((policy, index) => ({
          id: index + 1,
          mongoId: policy._id,
          policyname: policy.name,
          policyLink: policy.documentLink,
          status: policy.isActive,
          uploadedDate: humanDate(policy.createdAt),
          updatedDate: humanDate(policy.updatedAt),
        }))}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalType === "edit"
            ? "Edit Policy Name"
            : modalType === "inactive"
            ? "Mark Policy As Inactive"
            : "Add New Policy"
        }
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
              modalType === "edit" ? handleUpdatePolicy : handleAddPolicy
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
        {modalType === "inactive" && (
          <div className="space-y-4">
            <p>
              Are you sure you want to mark <b>{selectedPolicy?.policyname}</b>{" "}
              as inactive?
            </p>
            <DialogActions>
              <PrimaryButton
                title="Confirm"
                handleSubmit={handleMarkInactive}
              />
              <PrimaryButton
                title="Cancel"
                handleSubmit={() => setOpenModal(false)}
              />
            </DialogActions>
          </div>
        )}
        {modalType === "active" && (
          <div className="space-y-4">
            <p>
              Are you sure you want to mark <b>{selectedPolicy?.policyname}</b>{" "}
              as active
            </p>
            <DialogActions>
              <PrimaryButton title="Confirm" handleSubmit={handleMarkActive} />
              <PrimaryButton
                title="Cancel"
                handleSubmit={() => setOpenModal(false)}
              />
            </DialogActions>
          </div>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default HrSettingsPolicies;
