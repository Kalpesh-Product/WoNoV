import { useEffect, useState, useMemo } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { DateRange } from "react-date-range";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import humanDate from "../../../utils/humanDateForamt";
import { queryClient } from "../../../main";
import PageFrame from "../../../components/Pages/PageFrame";
import usePageDepartment from "../../../hooks/usePageDepartment";

const HousekeepingTeamMembersSchedule = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectionRange, setSelectionRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
    key: "selection",
  });

  const [multipleRanges, setMultipleRanges] = useState([]);

  const department = usePageDepartment();
  const {
    handleSubmit,
    control,
    setValue,
    reset,
    watch: assignWatch,
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
    setValue: setPrimaryValue,
    formState: { errors: primaryErrors },
  } = useForm({
    defaultValues: {
      unitId: "",
      empId: "",
      location: "",
    },
  });

  useEffect(() => {
    setPrimaryValue("location", selectedUser?.buildingName);
    setPrimaryValue("unitId", selectedUser?.unitNo);
  }, [selectedUser]);
  const selectedLocation = watch("location");

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

  //----------------------------------------API---------------------------------------//
  const {
    data: unitsData = [],
    isPending: isUnitsPending,
    isSuccess,
  } = useQuery({
    queryKey: ["houseKeepingUnitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        const formattedUnits = response.data.map((unit, index) => ({
          ...unit,
          mongoId: unit._id,
          unitNo: unit.unitNo,
          unitName: unit.unitName,
          buildingName: unit.building?.buildingName ?? "N/A",
          sqft: unit.sqft,
          openDesks: unit.openDesks,
          cabinDesks: unit.cabinDesks,
          lead:
            department?.name === "Administration"
              ? `${unit?.adminLead?.firstName} ${unit?.adminLead?.lastName}`
              : department?.name === "Maintenance"
              ? `${unit?.maintenanceLead?.firstName} ${unit?.maintenanceLead?.lastName}`
              : `${unit?.itLead?.firstName} ${unit?.itLead?.lastName}`,
        }));

        const sortedUnits = formattedUnits.sort((a, b) =>
          a.unitNo.localeCompare(b.unitNo, undefined, {
            numeric: true,
            sensitivity: "base",
          })
        );

        // Re-assign Sr No after sorting
        return sortedUnits.map((unit, idx) => ({ ...unit, srNo: idx + 1 }));
      } catch (error) {
        console.error("Error fetching clients data:", error);
        return [];
      }
    },
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users", {
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

  const watchedUnitId = assignWatch("location"); // this field holds selected unit _id

  const { data: unitSchedule = [], isFetching: isUnitSchedulePending } =
    useQuery({
      queryKey: ["unitSchedule", watchedUnitId],
      enabled: !!watchedUnitId,
      queryFn: async () => {
        const response = await axios.get(
          `/api/company/get-housekeeping-schedule?unitId=${watchedUnitId}`
        );
        return response.data.data;
      },
    });

  console.log("unit schedule : ", unitSchedule);
  useEffect(() => {
    setMultipleRanges([]);
  }, [watchedUnitId]);

  useEffect(() => {
    if (!unitSchedule || !unitSchedule.length) return;

    console.log("unitSchedule : ", unitSchedule);

    const matchedSchedules = unitSchedule.filter(
      (schedule) =>
        schedule.unit?._id === watchedUnitId &&
        schedule.housekeepingMember?._id &&
        schedule.startDate &&
        schedule.endDate &&
        !isNaN(new Date(schedule.startDate)) &&
        !isNaN(new Date(schedule.endDate))
    );
    console.log("matched schedule : ", matchedSchedules);

    if (matchedSchedules.length) {
      const detailedRanges = [];

      matchedSchedules.forEach((item) => {
        const { housekeepingMember, startDate, endDate, _id } = item;

        // Add original employee schedule
        if (
          housekeepingMember?.firstName &&
          // housekeepingMember?.lastName &&
          !isNaN(new Date(startDate)) &&
          !isNaN(new Date(endDate))
        ) {
          detailedRanges.push({
            key: `main-${_id}`,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            employeeName: `${housekeepingMember.firstName} ${
              housekeepingMember.lastName || ""
            }`,
            isActive: housekeepingMember.isActive ? "Active" : "Inactive",
          });
        }

        // Add active substitutes
        // substitutions
        //   .filter(
        //     (sub) =>
        //       sub?.isActive &&
        //       sub?.substitute?.firstName &&
        //       sub?.substitute?.lastName &&
        //       !isNaN(new Date(sub.fromDate)) &&
        //       !isNaN(new Date(sub.toDate))
        //   )
        //   .forEach((sub, index) => {
        //     detailedRanges.push({
        //       key: `sub-${_id}-${index}`,
        //       startDate: new Date(sub.fromDate),
        //       endDate: new Date(sub.toDate),
        //       employeeName: `${sub.substitute.firstName} ${sub.substitute.lastName} (Substitute)`,
        //       manager: manager || "Unknown",
        //       isActive: "Active",
        //     });
        //   });
      });

      setMultipleRanges(detailedRanges);
    } else {
      setMultipleRanges([]);
    }
  }, [unitSchedule, watchedUnitId]);

  const getDisabledDatesSet = (ranges) => {
    const disabledSet = new Set();

    ranges.forEach(({ startDate, endDate }) => {
      const start = new Date(startDate);
      const end = new Date(endDate);
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        disabledSet.add(new Date(d).toDateString()); // use toDateString to normalize
      }
    });

    return disabledSet;
  };
  const disabledDatesSet = useMemo(
    () => getDisabledDatesSet(multipleRanges),
    [multipleRanges]
  );

  const { mutate: assignMember, isPending: isAssignMemberPending } =
    useMutation({
      mutationKey: ["assign-houskeeping"],
      mutationFn: async (data) => {
        const response = await axios.post(
          "/api/company/assign-new-housekeeping-schedule",
          {
            unitId: data.location,
            memberId: data.employee,
            startDate: data.startDate,
            endDate: data.endDate,
          }
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
      const response = await axios.patch(
        "/api/company/assign-primary-unit",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "PRIMARY ASSIGNED");
      queryClient.invalidateQueries({ queryKey: ["unitsData"] });
      setIsModalOpen(false);
      primaryReset();
    },
    onError: (error) => {
      toast.error(error.message || "CHECK LOG");
    },
  });

  const onSubmit = (data) => {
    assignPrimary({
      unitId: selectedUser._id,
      location: selectedUser.building?._id,
      departmentName: department?.name,
      employeeId: data.employee,
    });
  };
  //----------------------------------------API---------------------------------------//
  const unitColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "buildingName", headerName: "Building", flex: 1 },
    {
      field: "unitNo",
      headerName: "Unit No",
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            navigate(
              `/app/dashboard/admin-dashboard/mix-bag/housekeeping-members/member-schedule/${params.value}`,
              {
                state: {
                  id: params.data.mongoId,
                  name: params.value,
                },
              }
            );
          }}
          className="underline text-primary cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },

    { field: "unitName", headerName: "Unit Name" },

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
          {/* <span
            onClick={() => handleEditUser(params.data)}
            className="text-subtitle hover:bg-gray-300 rounded-full cursor-pointer p-1"
          >
            <HiOutlinePencilSquare />
          </span> */}
        </div>
      ),
    },
  ];

  //---------------------------------------Event Handlers------------------------------//
  useEffect(() => {
    console.log("slected user : ", selectedUser);
  }, [selectedUser]);

  const handleViewUser = async (user) => {
    try {
      const response = await axios.get(
        `/api/company/get-housekeeping-schedule?unitId=${user?._id}&`
      );
      const matchingSchedule = response.data.data?.[0]; // adjust as needed
      console.log("matching schedule : ", matchingSchedule);

      if (matchingSchedule) {
        setSelectedUser({
          ...user,
          startDate: matchingSchedule.startDate,
          endDate: matchingSchedule.endDate,
          substitutions: matchingSchedule.substitutions || [],
          isEmployeeActive: matchingSchedule.employee?.isActive ?? true,
        });
      } else {
        toast.warning("No schedule found for this unit.");
        setSelectedUser(user);
      }

      setModalMode("view");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching schedule details:", error);
      toast.error("Failed to load schedule details.");
    }
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

  if (isUnitsPending) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <CircularProgress color="#1E3D73" />
      </div>
    );
  }

  if (!Array.isArray(unitsData) || unitsData.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <p className="text-gray-500">No units found.</p>
      </div>
    );
  }

  return (
    <div>
      <PageFrame>
        {isUnitsPending ? (
          <CircularProgress />
        ) : isSuccess && unitsData.length > 0 ? (
          <AgTable
            search
            tableTitle="Housekeeping Weekly Rotation Schedule"
            buttonTitle="Assign Housekeeping Member"
            data={unitsData}
            columns={unitColumns}
            handleClick={handleAddUser}
          />
        ) : (
          <p className="text-center text-gray-500">No units found.</p>
        )}
      </PageFrame>

      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${
          modalMode === "add"
            ? "Assign weekly schedule"
            : modalMode === "view"
            ? "Schedule details"
            : "Assign primary unit"
        }`}
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
                        {!isHouseKeepingPending ? (
                          houseKeepingData.map((item) => (
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
                <div className="col-span-2 w-full ">
                  {/* Show already scheduled ranges as compact badges */}

                  {/* Actual DateRange calendar */}
                  {watchedUnitId ? (
                    <>
                      <div className="my-4">
                        <span className="text-subtitle text-primary font-pmedium">
                          Assigned Details
                        </span>
                      </div>

                      {multipleRanges.length > 0 ? (
                        <div className="w-full max-w-full overflow-x-auto my-4">
                          <div className="flex gap-4 min-w-max">
                            {[...multipleRanges]
                              .sort(
                                (a, b) =>
                                  new Date(b.startDate) - new Date(a.startDate)
                              )
                              .map((range) => (
                                <div
                                  key={range.key}
                                  className="min-w-[280px] p-4 rounded-xl border border-borderGray bg-gray-50 shadow-sm"
                                >
                                  <div className="text-sm text-gray-500 mb-1">
                                    <strong>Dates:</strong>{" "}
                                    {range.startDate.toLocaleDateString(
                                      "en-GB"
                                    )}{" "}
                                    -{" "}
                                    {range.endDate.toLocaleDateString("en-GB")}
                                  </div>
                                  <div className="text-sm text-gray-700">
                                    <strong>Employee:</strong>{" "}
                                    {range.employeeName}
                                  </div>
                                  {/* <div className="text-sm text-gray-700">
                                    <strong>Manager:</strong> {range.manager}
                                  </div> */}
                                  {/* <div className="text-sm text-gray-700">
                                    <strong>Status:</strong>{" "}
                                    <span
                                      className={`font-semibold ${
                                        range.isActive === "Active"
                                          ? "text-green-600"
                                          : "text-red-500"
                                      }`}
                                    >
                                      {range.isActive}
                                    </span>
                                  </div> */}
                                </div>
                              ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center items-center h-16 p-4 border-borderGray border-[1px] rounded-xl">
                          <span>No members assigned currently.</span>
                        </div>
                      )}

                      <div className="my-4">
                        <span className="text-subtitle text-primary font-pmedium">
                          Assign a member
                        </span>
                      </div>
                      <DateRange
                        ranges={[selectionRange]}
                        onChange={handleDateSelect}
                        moveRangeOnFirstSelection={false}
                        disabledDay={(date) =>
                          disabledDatesSet.has(date.toDateString())
                        }
                      />
                    </>
                  ) : (
                    <div className="h-10 flex justify-between items-center p-4 border-borderGray border-[1px] rounded-xl">
                      <span className="text-content font-pregular">
                        Kindly select a unit to display the weekly schedule.
                      </span>
                    </div>
                  )}
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
            <DetalisFormatted
              title="Name"
              detail={`${selectedUser?.adminLead?.firstName} ${selectedUser?.adminLead?.lastName}`}
            />
            <DetalisFormatted
              title="Member Status"
              gap={"w-full"}
              detail={selectedUser.isEmployeeActive ? "Active" : "InActive"}
            />
            <DetalisFormatted title="Unit Name" detail={selectedUser?.unitNo} />
            <DetalisFormatted
              title="Building Name"
              gap={"w-full"}
              detail={selectedUser?.buildingName}
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
                    {...field}
                    size="small"
                    value={field.value}
                    disabled
                    label="Select Location"
                  />
                )}
              />
              <Controller
                name="unitId"
                control={primaryControl}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Select Unit"
                    disabled
                    value={field.value}
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    <MenuItem value="">Select Unit</MenuItem>

                    {unitsData
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
                control={primaryControl}
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
export default HousekeepingTeamMembersSchedule;
