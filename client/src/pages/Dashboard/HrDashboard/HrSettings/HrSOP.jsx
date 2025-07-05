import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, IconButton, TextField, DialogActions, MenuItem } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { LuImageUp } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import humanDate from "../../../../utils/humanDateForamt";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const HrSOP = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState(null); // "add", "edit", "inactive"
  const [selectedSop, setSelectedSop] = useState(null);

  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();

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
    queryKey: ["sops"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-company-documents/sop");
      return response.data.sop;
    },
  });

  const addSopMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/company/upload-company-document",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
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
      const response = await axios.patch("/api/company/update-company-data", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP updated successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const makeInactiveSopMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch("/api/company/update-company-data", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP marked inactive successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setOpenModal(false);
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
      isActive: data.status === "true",
    });
  };

  const handleMarkInactive = () => {
    makeInactiveSopMutation.mutate({
      type: "sop",
      itemId: selectedSop.mongoId,
      oldDocumentName: selectedSop.sopname,
      newDocumentName: null,
      isActive: false,
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
      status: row.status?.toString(),
    });
    setOpenModal(true);
  };

  const handleOpenInactive = (row) => {
    setModalType("inactive");
    setSelectedSop(row);
    setOpenModal(true);
  };

  const columns = [
    { field: "id", headerName: "Sr No" },
    {
      field: "sopname",
      headerName: "SOP NAME",
      cellRenderer: (params) => (
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
    { field: "uploadedDate", headerName: "Uploaded Date", width: 150 },
    { field: "updatedDate", headerName: "Updated Date", width: 150 },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const styles = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
        };
        const { backgroundColor, color } = styles[status] || {};
        return <Chip label={status} style={{ backgroundColor, color }} />;
      },
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const isActive = params.data.status;
        const items = [
          { label: "Edit", onClick: () => handleOpenEdit(params.data) },
        ];
        if (isActive) {
          items.push({
            label: "Mark As Inactive",
            onClick: () => handleOpenInactive(params.data),
          });
        }
        return <ThreeDotMenu rowId={params.data.id} menuItems={items} />;
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
          status: sop.isActive,
          sopLink: sop.documentLink,
          uploadedDate: humanDate(sop.createdAt),
          updatedDate: humanDate(sop.updatedAt),
        }))}
        handleClick={handleOpenAdd}
        columns={columns}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalType === "edit"
            ? "Edit SOP"
            : modalType === "inactive"
            ? "Mark SOP As Inactive"
            : "Add New SOP"
        }
      >
        {modalType === "inactive" ? (
          <div className="space-y-4">
            <p>
              Are you sure you want to mark <b>{selectedSop?.sopname}</b> as inactive?
            </p>
            <DialogActions>
              <PrimaryButton title="Confirm" handleSubmit={handleMarkInactive} />
              <PrimaryButton title="Cancel" handleSubmit={() => setOpenModal(false)} />
            </DialogActions>
          </div>
        ) : modalType === "edit" ? (
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

            <Controller
              name="status"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Status"
                  size="small"
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </TextField>
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
    </PageFrame>
  );
};

export default HrSOP;
