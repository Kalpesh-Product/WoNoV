import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, IconButton, TextField, DialogActions } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import PageFrame from "../../../../components/Pages/PageFrame";
import { LuImageUp } from "react-icons/lu";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

const HrSOP = () => {
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("add"); // add, edit, view, delete
  const [selectedSop, setSelectedSop] = useState(null);

  const axios = useAxiosPrivate();
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      sopName: "",
      file: null,
    },
  });

  const queryClient = useQueryClient();

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/get-company-documents/sop"
      );
      return response.data.sop;
    },
  });

  const addSopMutation = useMutation({
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
      toast.success("SOP added successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      reset();
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
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP name updated");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const deleteSopMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        "/api/company/update-company-data",
        payload
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["sops"] });
      setOpenModal(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Delete failed");
    },
  });

  const handleAddSop = (data) => {
    const formData = new FormData();
    formData.append("documentName", data.sopName);
    formData.append("type", "sop");
    formData.append("document", data.file);
    addSopMutation.mutate(formData);
  };

  const handleEdit = (row) => {
    setModalType("edit");
    setSelectedSop(row);
    reset({ sopName: row.sopname });
    setOpenModal(true);
  };

  const handleView = (row) => {
    window.open(row.sopLink, "_blank");
  };

  const handleDelete = (row) => {
    setModalType("delete");
    setSelectedSop(row);
    setOpenModal(true);
  };

  const handleUpdateName = (data) => {
    updateSopMutation.mutate({
      type: "sop",
      itemId: selectedSop.mongoId,
      oldDocumentName: selectedSop.sopname,
      name: data.sopName,
    });
  };

  const handleConfirmDelete = () => {
    deleteSopMutation.mutate({
      type: "sop",
      itemId: selectedSop.mongoId,
      oldDocumentName: selectedSop.sopname,
      newDocumentName: null,
      isActive: false,
    });
  };

  const departmentsColumn = [
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
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const colorMap = {
          Active: { backgroundColor: "#90EE90", color: "#006400" },
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
        };
        const { backgroundColor, color } = colorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };
        return <Chip label={status} style={{ backgroundColor, color }} />;
      },
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        const isActive = params.data.status; // true or false

        const menuItems = [
          // { label: "View", onClick: () => handleView(params.data) },
          { label: "Edit", onClick: () => handleEdit(params.data) },
        ];

        if (isActive) {
          menuItems.push({
            label: "Delete",
            onClick: () => handleDelete(params.data),
          });
        }

        return <ThreeDotMenu rowId={params.data.id} menuItems={menuItems} />;
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
        data={sops.map((sop, index) => ({
          id: index + 1,
          mongoId: sop._id,
          sopname: sop.name,
          status: sop.isActive,
          sopLink: sop.documentLink,
        }))}
        handleClick={() => {
          setModalType("add");
          reset();
          setOpenModal(true);
        }}
        columns={departmentsColumn}
      />

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={
          modalType === "edit"
            ? "Edit SOP Name"
            : modalType === "delete"
            ? "Confirm Delete"
            : "Add New SOP"
        }
      >
        {modalType === "delete" ? (
          <div className="space-y-4">
            <p>Are you sure you want to delete this SOP?</p>
            <DialogActions>
              <PrimaryButton
                title="Delete"
                handleSubmit={handleConfirmDelete}
              />
              <PrimaryButton
                title="Cancel"
                handleSubmit={() => setOpenModal(false)}
              />
            </DialogActions>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit(
              modalType === "edit" ? handleUpdateName : handleAddSop
            )}
            className="flex flex-col gap-4"
          >
            <Controller
              name="sopName"
              control={control}
              rules={{ required: "SOP Name is Required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="SOP Name"
                  size="small"
                  variant="outlined"
                  fullWidth
                  error={!!errors?.sopName}
                  helperText={errors?.sopName?.message}
                />
              )}
            />

            {modalType === "add" && (
              <Controller
                name="file"
                control={control}
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
                      label="Upload SOP"
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
            )}

            <PrimaryButton
              title={modalType === "edit" ? "Update SOP Name" : "Add SOP"}
              type="submit"
              isLoading={
                addSopMutation.isPending || updateSopMutation.isPending
              }
              disabled={addSopMutation.isPending || updateSopMutation.isPending}
            />
          </form>
        )}
      </MuiModal>
    </PageFrame>
  );
};

export default HrSOP;
