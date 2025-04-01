import React, { useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { Controller, useForm } from "react-hook-form";

const WorkLocations = () => {
  const axios = useAxiosPrivate();

  const { handleSubmit, control } = useForm({
    defaultValues: {
      building: "",
      workLocation: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setOpenModal(false)
  };

  const { data: workLocations = [] } = useQuery({
    queryKey: ["workLocations"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-data?field=workLocations"
        );
        return response.data.workLocations;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field: "id", headerName: "SR NO" },
    {
      field: "name",
      headerName: "Work Location Name",
      cellRenderer: (params) => {
        return (
          <div>
            <span className="text-primary cursor-pointer hover:underline">
              {params.value}
            </span>
          </div>
        );
      },
      flex: 1,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-content text-primary hover:underline cursor-pointer">
              Make Inactive
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      srno: "1",
      id: 1,
      worklocationname: "ST 701A",
      status: "Active",
    },
    {
      srno: "2",
      id: 2,
      worklocationname: "ST 701B",
      status: "Active",
    },
    {
      srno: "3",
      id: 3,
      worklocationname: "ST 601A",
      status: "Inactive",
    },
    {
      srno: "4",
      id: 4,
      worklocationname: "ST 701B",
      status: "Active",
    },
  ];

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddLocation = () => {
    setOpenModal(true);
  };

  return (
    <>
      <div>
        <AgTable
          key={workLocations.length}
          search={true}
          searchColumn={"Work Location"}
          tableTitle={"Work Location List"}
          buttonTitle={"Add Work Location"}
          handleClick={handleAddLocation}
          columns={departmentsColumn}
          data={[
            ...workLocations.map((location, index) => ({
              id: index + 1, // Auto-increment Sr No
              name: location.name, // Birthday Name
              status: location.isActive,
            })),
          ]}
        />
      </div>

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add Work Location"}
      >
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Controller
              name="building"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Building"
                  fullWidth
                >
                  <MenuItem value="Building A">Building A</MenuItem>
                  <MenuItem value="Building B">Building B</MenuItem>
                  <MenuItem value="Building C">Building C</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="workLocation"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Work Location"
                  fullWidth
                />
              )}
            />
            <div className="flex items-center gap-4 justify-center">
              <SecondaryButton
                title={"Cancel"}
                handleSubmit={() => {
                  setOpenModal(false);
                }}
              />
              <PrimaryButton
                type={"submit"}
                title={"Submit"}
                handleSubmit={() => {
                  alert("Button Clicked");
                }}
              />
            </div>
          </form>
        </div>
      </MuiModal>
    </>
  );
};

export default WorkLocations;
