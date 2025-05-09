import React, { useEffect, useState } from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, MenuItem, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Loader from "../../../Loading";

const WorkLocations = () => {
  const axios = useAxiosPrivate();

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      building: "",
      workLocation: "",
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    setOpenModal(false);
  };

  const { data: workLocations = [], isLoading } = useQuery({
    queryKey: ["workLocation"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/company/get-company-data?field=workLocations"
        );
        return response.data?.workLocations;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },

  });

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
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

  const [openModal, setOpenModal] = useState(false);

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddLocation = () => {
    setOpenModal(true);
  };


  return (
    <>
      {isLoading ? <Loader /> : <div>
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
              name: location.building?.buildingName, // Birthday Name
              status: location.isActive,
            })),
          ]}
        />
      </div>}

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={"Add Work Location"}
      >
        <div>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            {/* <Controller
              name="building"
              rules={{required: 'Building is required'}}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Building"
                  error={!!errors.building}
                  helperText={errors.building?.message}
                  fullWidth
                >
                  <MenuItem value="Building A">Sunteck Kaneka</MenuItem>
                  <MenuItem value="Building B">Dempo Trade Center</MenuItem>
                </TextField>
              )}
            /> */}
            <Controller
              name="workLocation"
              rules={{ required: "Work location is required" }}
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Work Location"
                  fullWidth
                  error={!!errors.workLocation}
                  helperText={errors.workLocation?.message}
                />
              )}
            />
            <PrimaryButton
              type={"submit"}
              title={"Submit"}
              handleSubmit={() => {
                toast.success("Location added successfully");
              }}
            />
          </form>
        </div>
      </MuiModal>
    </>
  );
};

export default WorkLocations;
