import { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import {
  Button,
  CircularProgress,
  FormHelperText,
  MenuItem,
  TextField,
} from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { Calendar, DateRange } from "react-date-range";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const AdminTeamMembersSchedule = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      unitId: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  //----------------------------------------API---------------------------------------//
  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        console.log(response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

    const { data: employees, isLoading } = useQuery({
      queryKey: ["employees"],
      queryFn: async () => {
        try {
          const adminDepId = "6798bae6e469e809084e24a4"
          const response = await axios.get(`/api/users/fetch-users/${adminDepId}`);
          return response.data;
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });
  //----------------------------------------API---------------------------------------//

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
    { field: "name", headerName: "Name", flex: 1 },
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
              `/app/dashboard/admin-dashboard/team-members-schedule/${params.data.id}`,
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
    console.log("Form data to send:", data); // includes startDate and endDate
    toast.success("Data submitted successfully!");
    setIsModalOpen(false);
  };

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    console.log("Start:", startDate);
    console.log("End:", endDate);

    setSelectionRange(ranges.selection);

    // Update form state
    setValue("startDate", startDate);
    setValue("endDate", endDate);
  };

  return (
    <div className="p-4">
      <AgTable
        key={teamMembers.length}
        search={true}
        searchColumn={"Name"}
        tableTitle={"Team Members Schedule"}
        buttonTitle={"Assign Member"}
        data={teamMembers}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />
      <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {modalMode === "add" && (
          <div>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="col-span-2 w-full">
                  <DateRange
                    ranges={[selectionRange]}
                    onChange={handleDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                </div>
                <div className="col-span-2">
                  <Controller
                    name="unitId"
                    rules={{ required: "Unit is required" }}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={"Select Unit"}
                        size="small"
                        fullWidth
                        error={!!errors.unitId}
                        helperText={errors.unitId?.message}
                        select
                      >
                        <MenuItem value="" disabled>
                          Select Unit
                        </MenuItem>
                        {!isUnitsPending ? (
                          unitsData.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                              {item.unitNo}
                            </MenuItem>
                          ))
                        ) : (
                          <CircularProgress />
                        )}
                      </TextField>
                    )}
                  />
                </div>
              </div>
              <div className="flex gap-4 justify-center items-center mt-4">
                <PrimaryButton title="Submit" />
              </div>
            </form>
          </div>
        )}
      </MuiModal>
    </div>
  );
};
export default AdminTeamMembersSchedule;
