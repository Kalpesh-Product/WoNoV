import { useEffect, useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
// import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
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
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { DateRange } from "@mui/icons-material";
import humanDate from "../../../utils/humanDateForamt";
import { queryClient } from "../../../main";
import PageFrame from "../../../components/Pages/PageFrame";

const HouseKeepingMembersList = () => {
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      employee: "",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
    },
  });

  // const { data: unitAssignees = [], isLoading: isUnitAssignees } = useQuery({
  //   queryKey: ["unitAssignees"],
  //   queryFn: async () => {
  //     try {
  //       const adminDepId = "6798bae6e469e809084e24a4";
  //       const response = await axios.get(
  //         `/api/administration/fetch-weekly-unit/${adminDepId}`);
  //       return response.data;
  //     } catch (error) {
  //       throw new Error(error.response.data.message);
  //     }
  //   },
  // });

  const { data: houseKeepingData, isPending: isHouseKeepingPending } = useQuery(
    {
      queryKey: ["housekeeping-staff"],
      queryFn: async () => {
        try {
          const response = await axios.get("/api/company/housekeeping-members");
          return response.data;
        } catch (error) {
          toast.error(error.message);
        }
      },
    }
  );

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const adminDepId = "6798bae6e469e809084e24a4";
        const response = await axios.get(`/api/users/fetch-users`, {
          params: {
            deptId: adminDepId,
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const { mutate: assignMember, isPending: isAssignMemberPending } =
    useMutation({
      mutationKey: ["assignMember"],
      mutationFn: async (data) => {
        const response = await axios.post(
          "/api/administration/assign-weekly-unit",
          data
        );
        return response.data;
      },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["unitAssignees"] });
        toast.success(data.message || "Data submitted successfully!");
        reset();
        setIsModalOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Error submitting data");
      },
    });

  const memberColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "gender", headerName: "Gender", flex: 1 },
    { field: "manager", headerName: "Manager Name", flex: 1 },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <div className="flex items-center gap-4 py-2">
    //       <span
    //         onClick={() => handleViewUser(params.data)}
    //         className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
    //       >
    //         <MdOutlineRemoveRedEye />
    //       </span>
    //       <span
    //         onClick={() => handleEditUser(params.data)}
    //         className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
    //       >
    //         <HiOutlinePencilSquare />
    //       </span>
    //     </div>
    //   ),
    // },
  ];

  const transformedData = houseKeepingData?.map((member, index) => ({
    id: index + 1,
    _id: member._id,
    name: member.name || "N/A",
    gender: member.gender || "N/A",
    manager:
      member.manager?.firstName && member.manager?.lastName
        ? `${member.manager.firstName} ${member.manager.lastName}`
        : "N/A",
  }));

  const handleAddUser = () => {
    setModalMode("add");
    setIsModalOpen(true);
  };

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setSelectionRange(ranges.selection);
    // Update form state
    setValue("startDate", startDate);
    setValue("endDate", endDate);
  };

  const handleViewUser = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setModalMode("edit");
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    assignMember(data);
  };

  return (
    <div>
      <PageFrame>
        {houseKeepingData?.length > 0 ? (
          <AgTable
            key={houseKeepingData.length}
            search={true}
            tableTitle={"Housekeeping Members Schedule"}
            // buttonTitle={"Assign Member"}
            data={transformedData}
            columns={memberColumns}
            handleClick={handleAddUser}
          />
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <CircularProgress />
          </div>
        )}
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={"Assign Substitute"}
      >
        {modalMode === "add" && (
          <div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Controller
                    name="employee"
                    rules={{ required: "Select a Member" }}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Select Member"
                        fullWidth
                        size="small"
                        select
                        error={!!errors.employee}
                        helperText={errors.employee?.message}
                      >
                        <MenuItem value="" disabled>
                          Select a Member
                        </MenuItem>
                        {!isEmployeesLoading ? (
                          employees.map((item) => (
                            <MenuItem key={item._id} value={item._id}>
                              {item.firstName} {item.lastName}
                            </MenuItem>
                          ))
                        ) : (
                          <CircularProgress />
                        )}
                      </TextField>
                    )}
                  />
                </div>
                <div className="col-span-2 w-full">
                  <DateRange
                    ranges={[selectionRange]}
                    onChange={handleDateSelect}
                    moveRangeOnFirstSelection={false}
                  />
                </div>
                <div className="col-span-2">
                  <Controller
                    name="location"
                    rules={{ required: "Unit is required" }}
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label={"Select Unit"}
                        size="small"
                        fullWidth
                        error={!!errors.location}
                        helperText={errors.unitId?.message}
                        select
                      >
                        <MenuItem value="" disabled>
                          Select Unit
                        </MenuItem>
                        {!isUnitsPending.length > 0 ? (
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
              <div className=" w-full">
                <PrimaryButton
                  title="Submit"
                  externalStyles={"w-full"}
                  isLoading={isAssignMemberPending}
                  disabled={isAssignMemberPending}
                />
              </div>
            </form>
          </div>
        )}

        {modalMode === "view" && selectedUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetalisFormatted title="Name" detail={selectedUser.name} />
            <DetalisFormatted
              title="Member Status"
              gap={"w-full"}
              detail={selectedUser.isEmployeeActive ? "Active" : "InActive"}
            />
            <DetalisFormatted
              title="Unit Name"
              detail={selectedUser.unitName}
            />
            <DetalisFormatted
              title="Building Name"
              gap={"w-full"}
              detail={selectedUser.buildingName}
            />

            {/* DateRange picker view-only*/}
            <div className="md:col-span-2">
              <h3 className="text-subtitle font-pmedium text-gray-700 mb-1">
                Date Range
              </h3>
              <div className="border border-borderGray rounded-2xl overflow-hidden shadow-sm">
                <DateRange
                  ranges={[
                    {
                      startDate: new Date(selectedUser.startDate),
                      endDate: new Date(selectedUser.endDate),
                      key: "selection",
                    },
                  ]}
                  onChange={() => {
                    "";
                  }}
                  editableDateInputs={false}
                  showDateDisplay={false}
                  moveRangeOnFirstSelection={false}
                  disabledDay={() => true}
                />
              </div>
            </div>

            <div className="md:col-span-2 mt-2">
              <h3 className="text-subtitle font-pmedium text-gray-700 mb-3">
                Substitutes
              </h3>
              {selectedUser.substitutions?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8">
                  {selectedUser.substitutions.map((sub, index) => (
                    <div
                      key={sub.substitutionId}
                      className="flex flex-col gap-2 border border-borderGray rounded-2xl p-4"
                    >
                      <h4 className="text-subtitle font-pmedium text-primary mb-2">
                        Substitute {index + 1}
                      </h4>
                      <DetalisFormatted
                        title="First Name"
                        detail={sub.substituteFirstName}
                      />
                      <DetalisFormatted
                        title="Last Name"
                        detail={sub.substituteLastName}
                      />
                      <DetalisFormatted
                        title="From"
                        detail={humanDate(sub.fromDate)}
                      />
                      <DetalisFormatted
                        title="To"
                        detail={humanDate(sub.toDate)}
                      />
                      <DetalisFormatted
                        title="Is Active"
                        detail={sub.isActive ? "Yes" : "No"}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  No substitute assigned
                </div>
              )}
            </div>
          </div>
        )}
        {modalMode === "edit" && selectedUser && (
          <>
            <form onSubmit={""}>
              <div className="border border-borderGray rounded-2xl overflow-hidden shadow-sm">
                <DateRange
                  ranges={[
                    {
                      startDate: new Date(selectedUser.startDate),
                      endDate: new Date(selectedUser.endDate),
                      key: "selection",
                    },
                  ]}
                  onChange={() => {
                    "";
                  }}
                  editableDateInputs={false}
                  showDateDisplay={false}
                  moveRangeOnFirstSelection={false}
                />
              </div>
            </form>
          </>
        )}
      </MuiModal>
    </div>
  );
};

export default HouseKeepingMembersList;