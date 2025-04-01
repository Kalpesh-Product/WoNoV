import { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
const AdminTeamMembersSchedule = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      manager: "",
      unit: "",
    },
  });
  // Hardcoded data
  const teamMembers = [
    {
      id: 1,
      name: "Anne Fernandes",
      manager: "Machindranath Parkar",
      unit: "ST-601A",
    },
    {
      id: 2,
      name: "Naaz Parveen Bavannawar",
      manager: "Machindranath Parkar",
      unit: "ST-601A",
    },
    {
      id: 3,
      name: "Melisa Fernandes",
      manager: "Machindranath Parkar",
      unit: "ST-601A",
    },
    {
      id: 4,
      name: "Urjita Sangodkar",
      manager: "Machindranath Parkar",
      unit: "ST-601A",
    },
  ];
  const assetColumns = [
    { field: "id", headerName: "Sr. No." },
    { field: "name", headerName: "Name" },
    { field: "manager", headerName: "Manager" },
    { field: "unit", headerName: "Unit" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <PrimaryButton
          title="View Calendar"
          handleSubmit={() =>
            navigate(
              `/app/dashboard/admin-dashboard/team-members-calendar/${params.data.id}`,
              {
                state: { asset: params.data },
              }
            )
          }
        />
      ),
    },
  ];
  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };
  const handleFormSubmit = (data) => {
    // Handle form submission logic here
    toast.success("Data submitted successfully!");
    setIsModalOpen(false);
  };
  return (
    <>
      <AgTable
        key={teamMembers.length}
        search={true}
        searchColumn={"Name"}
        tableTitle={"Team Members Schedule"}
        buttonTitle={"Add Asset"}
        data={teamMembers}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />
      <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-2 gap-4">
                <Controller
                  name="name"
                  control={control}
                  rules={{ required: "Name is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Name"
                      error={!!errors.name}
                      helperText={errors.name?.message}
                    />
                  )}
                />
                <Controller
                  name="manager"
                  control={control}
                  rules={{ required: "Manager is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Manager"
                      error={!!errors.manager}
                      helperText={errors.manager?.message}
                    />
                  )}
                />
                <Controller
                  name="unit"
                  control={control}
                  rules={{ required: "Unit is required" }}
                  render={({ field }) => (
                    <TextField
                      size="small"
                      {...field}
                      label="Unit"
                      error={!!errors.unit}
                      helperText={errors.unit?.message}
                    />
                  )}
                />
              </div>
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton title="Submit" />
              </div>
            </form>
          </div>
        )}
      </MuiModal>
    </>
  );
};
export default AdminTeamMembersSchedule;
