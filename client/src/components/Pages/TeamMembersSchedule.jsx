import { useEffect, useState, useMemo } from "react";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import MuiModal from "../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import DetalisFormatted from "../../components/DetalisFormatted";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import humanDate from "../../utils/humanDateForamt";
import { queryClient } from "../../main";
import PageFrame from "../../components/Pages/PageFrame";
import usePageDepartment from "../../hooks/usePageDepartment";

const TeamMembersSchedule = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  useEffect(() => console.log(selectedUser), [selectedUser]);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });
  const department = usePageDepartment();
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

  const {
    handleSubmit: handleAddPrimary,
    control: primaryControl,
    reset: primaryReset,
    watch,
    formState: { errors: primaryErrors },
  } = useForm({
    defaultValues: {
      unitId: "",
      empId: "",
      location: "",
    },
  });
  const selectedLocation = watch("location");
  console.log("Selected loc : ", selectedLocation);
  const selectedUnit = watch("unitId");
  const {
    data: units = [],
    isLoading: locationsLoading,
    error: locationsError,
  } = useQuery({
    queryKey: ["units"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");

      return response.data;
    },
  });

  const selectedUnitId = useMemo(() => {
    if (!selectedUnit || !selectedLocation) return null;
    const unit = units.find(
      (unit) =>
        unit.unitNo === selectedUnit &&
        unit.building?.buildingName === selectedLocation // use ?. here too
    );
    return unit ? unit._id : null;
  }, [selectedUnit, selectedLocation, units]);

  const uniqueBuildings = Array.from(
    new Map(
      units.length > 0
        ? units.map((loc) => [
            loc.building?._id ?? `unknown-${loc.unitNo}`,
            loc.building?.buildingName ?? "Unknown Building",
          ])
        : []
    ).entries()
  );

  const {
    handleSubmit: updateUser,
    reset: updateUserReset,
    control: updateUserControl,
  } = useForm({
    defaultValues: {
      meetingId: "",
    },
  });

  //----------------------------------------API---------------------------------------//
  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        const formattedUnits = response.data.map((unit, index) => ({
          ...unit,
          srNo: index + 1,
          unitNo: unit.unitNo,
          unitName: unit.unitName,
          buildingName: unit.building?.buildingName ?? "N/A",
          sqft: unit.sqft,
          openDesks: unit.openDesks,
          cabinDesks: unit.cabinDesks,
          lead:
            department.name === "Administration"
              ? `${unit?.adminLead?.firstName} ${unit?.adminLead?.lastName}`
              : department.name === "Maintenance"
              ? `${unit?.maintenanceLead?.firstName} ${unit?.maintenanceLead?.lastName}`
              : `${unit?.itLead?.firstName} ${unit?.itLead?.lastName}`,
        }));
        console.log("book writer", department.name);
        return formattedUnits;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/users/fetch-users`, {
          params: {
            deptId: department._id,
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const { data: unitAssignees = [], isLoading: isUnitAssignees } = useQuery({
    queryKey: ["unitAssignees"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/weekly-unit/get-primary-units?id=${department?._id}&name=${department?.name}`
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate: assignMember, isPending: isAssignMemberPending } =
    useMutation({
      mutationKey: ["assignMember"],
      mutationFn: async (data) => {
        const response = await axios.post(
          "/api/administration/assign-weekly-unit",
          { ...data, department: department?._id }
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

  const { mutate: assignPrimary, isPending: isAssignPrimary } = useMutation({
    mutationKey: ["assignPrimary"],
    mutationFn: async (data) => {
      const response = await axios.patch("/api/company/", {
        ...data,
        unitId: selectedUnitId,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "PRIMARY ASSIGNED");
      setIsModalOpen(false);
      primaryReset();
    },
    onError: (error) => {
      toast.error(error.message || "CHECK LOG");
    },
  });

  const onSubmit = (data) => {
    if (!data) return;
    assignPrimary(data);
  };
  //----------------------------------------API---------------------------------------//
  const unitColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "unitNo", headerName: "Unit No", flex: 1 },
    { field: "unitName", headerName: "Unit Name", flex: 1 },
    { field: "buildingName", headerName: "Building", flex: 1 },
    {
      field: "lead",
      headerName: "Primary Lead",
      cellRenderer: (params) => {
        return params?.value !== "undefined undefined" ? params?.value : "-";
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="flex items-center gap-4 py-2">
          <span
            onClick={() => handleViewUser(params.data)}
            className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
          >
            <MdOutlineRemoveRedEye />
          </span>
          <span
            onClick={() => handleEditUser(params.data)}
            className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
          >
            <HiOutlinePencilSquare />
          </span>
        </div>
      ),
    },
  ];

  //---------------------------------------Event Handlers------------------------------//

  const handleViewUser = (user) => {
    setModalMode("view");
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleAddUser = () => {
    setModalMode("add");
    setIsModalOpen(true);
  };
  const handleEditUser = (user) => {
    setModalMode("edit");
    setSelectedUser(user);
    setIsModalOpen(true);
  };
  const handleFormSubmit = (data) => {
    assignMember(data);
  };

  const handleDateSelect = (ranges) => {
    const { startDate, endDate } = ranges.selection;
    setSelectionRange(ranges.selection);
    // Update form state
    setValue("startDate", startDate);
    setValue("endDate", endDate);
  };
  //---------------------------------------Event Handlers------------------------------//

  return (
    <div className="p-4">
      <PageFrame>
        {!isUnitAssignees ? (
          <AgTable
            key={unitAssignees.length}
            search={true}
            tableTitle={"Team Members Schedule"}
            buttonTitle={"Assign Member"}
            data={unitsData}
            columns={unitColumns}
            handleClick={handleAddUser}
          />
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <CircularProgress color="#1E3D73" />
          </div>
        )}
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Assign primary Unit`}
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
              detail={selectedUser.location?.unitNo}
            />
            <DetalisFormatted
              title="Building Name"
              gap={"w-full"}
              detail={selectedUser.location?.building?.buildingName}
            />

            {/* DateRange picker view-only */}
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
                  {selectedUser.substitutions?.map((sub, index) => (
                    <div
                      key={sub.substitute?._id}
                      className="flex flex-col gap-2 border border-borderGray rounded-2xl p-4"
                    >
                      <h4 className="text-subtitle font-pmedium text-primary mb-2">
                        Substitute {index + 1}
                      </h4>
                      <DetalisFormatted
                        title="First Name"
                        detail={sub.substitute?.firstName}
                      />
                      <DetalisFormatted
                        title="Last Name"
                        detail={sub.substitute?.lastName}
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
            <form
              onSubmit={handleAddPrimary(onSubmit)}
              className="grid grid-cols-1 gap-4"
            >
              <Controller
                name="location"
                control={primaryControl}
                render={({ field }) => (
                  <TextField
                    select
                    {...field}
                    size="small"
                    label="Select Location"
                  >
                    <MenuItem value="" disabled>
                      Select Building
                    </MenuItem>
                    {locationsLoading ? (
                      <MenuItem disabled>
                        <CircularProgress size={20} />
                      </MenuItem>
                    ) : locationsError ? (
                      <MenuItem disabled>Error fetching units</MenuItem>
                    ) : (
                      uniqueBuildings.map(([id, name]) => (
                        <MenuItem key={id} value={name}>
                          {name}
                        </MenuItem>
                      ))
                    )}
                  </TextField>
                )}
              />
              <Controller
                name="unitId"
                control={primaryControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label="Select Unit"
                    disabled={!selectedLocation}
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <MenuItem value="">Select Unit</MenuItem>

                    {units
                      .filter(
                        (unit) =>
                          unit.building &&
                          unit.building.buildingName === selectedLocation
                      )
                      .map((unit) => (
                        <MenuItem key={unit._id} value={unit._id}>
                          {unit.unitNo}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              />

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

              <PrimaryButton
                type={"submit"}
                title={"Submit"}
                isLoading={isAssignPrimary}
                disabled={isAssignPrimary}
              />
            </form>
          </>
        )}
      </MuiModal>
    </div>
  );
};
export default TeamMembersSchedule;
