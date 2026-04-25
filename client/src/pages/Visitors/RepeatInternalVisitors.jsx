import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { toast } from "sonner";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import YearWiseTable from "../../components/Tables/YearWiseTable";
import { PERMISSIONS } from "../../constants/permissions";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { queryClient } from "../../main";
import humanTime from "../../utils/humanTime";

const BIZNEST_COMPANY_ID = "6799f0cd6a01edbe1bc3fcea";

const RepeatInternalVisitors = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const canRepeatVisitor = userPermissions.includes(
    PERMISSIONS.VISITORS_MIX_BAG_REPEAT_VISITOR.value,
  );

  const [isViewEditModalOpen, setIsViewEditModalOpen] = useState(false);
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view");
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedDepartment, setSelectedDepartment] = useState("");

  const { setValue, handleSubmit, control, reset, watch } = useForm();

  const {
    control: repeatControl,
    handleSubmit: handleRepeatSubmit,
    reset: resetRepeatForm,
    watch: watchRepeat,
    formState: { errors: repeatErrors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      gender: "",
      visitorType: "",
      purposeOfVisit: "",
      visitorCompany: "",
      location: "",
      unit: "",
      toMeetCompany: "",
      department: "",
      toMeet: "",
      scheduledDate: null,
      checkIn: null,
      checkOut: null,
    },
  });

  const selectedCompany = watchRepeat("toMeetCompany");
  const watchLocation = watchRepeat("location");

  const { data: visitorsData = [] } = useQuery({
    queryKey: ["visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return response.data;
    },
  });

  const { data: unitsData = [] } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
      }
    },
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return response.data;
    },
  });

  const { data: clientCompanies = [] } = useQuery({
    queryKey: ["clientCompanies"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return response.data;
    },
  });

  const { data: clientMembers = [], isLoading: clientMembersIsLoading } =
    useQuery({
      queryKey: ["clientMembers", selectedCompany],
      queryFn: async () => {
        const response = await axios.get(
          `/api/sales/co-working-client-members?clientId=${selectedCompany}`,
        );
        return response.data;
      },
      enabled:
        !!selectedCompany && selectedCompany !== "6799f0cd6a01edbe1bc3fcea",
    });

  const departmentMap = new Map();
  employees.forEach((employee) => {
    employee.departments?.forEach((department) => {
      departmentMap.set(department._id, department);
    });
  });
  const uniqueDepartments = Array.from(departmentMap.values());

  const departmentEmployees = employees.filter((item) =>
    item.departments?.some((dept) => dept._id === selectedDepartment),
  );

  const { mutate, isPending: isUpdating } = useMutation({
    mutationFn: async (updatedData) => {
      const response = await axios.patch(
        `/api/visitors/update-visitor/${selectedVisitor.mongoId}`,
        updatedData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      toast.success("Visitor updated successfully");
      closeViewEditModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Update failed");
    },
  });

  const { mutate: repeatVisitor, isPending: isRepeatingVisitor } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch(
        `/api/visitors/repeat-internal-visitor/${selectedVisitor?.mongoId}`,
        payload,
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Repeat visitor submitted successfully");
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      setIsRepeatModalOpen(false);
      resetRepeatForm();
      navigate("/app/visitors/manage-visitors/internal-visitors");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to repeat visitor");
    },
  });

  const openModalWithMode = (visitor, mode) => {
    setSelectedVisitor(visitor);
    setModalMode(mode);
    setIsViewEditModalOpen(true);

    if (mode === "edit") {
      setValue("firstName", visitor.firstName || "");
      setValue("lastName", visitor.lastName || "");
      setValue("email", visitor.email || "");
      setValue("phoneNumber", visitor.phoneNumber || "");
      setValue("purposeOfVisit", visitor.purposeOfVisit || "");
      setValue(
        "checkOutRaw",
        visitor.checkOutRaw ? dayjs(visitor.checkOutRaw) : null,
      );
    }
  };

  const closeViewEditModal = () => {
    setIsViewEditModalOpen(false);
    setModalMode("view");
    setSelectedVisitor(null);
  };

  const openRepeatModal = (visitor) => {
    setSelectedVisitor(visitor);

    const selectedToMeetCompany =
      visitor?.toMeetCompany && typeof visitor.toMeetCompany === "object"
        ? visitor.toMeetCompany._id
        : visitor?.toMeetCompany || "";

    const selectedDepartmentId =
      visitor?.department && typeof visitor.department === "object"
        ? visitor.department._id
        : visitor?.department || "";

    const normalizedDepartment =
      selectedToMeetCompany === BIZNEST_COMPANY_ID ? selectedDepartmentId : "";

    setSelectedDepartment(normalizedDepartment || "");

    resetRepeatForm({
      firstName: visitor?.firstName || "",
      lastName: visitor?.lastName || "",
      email: visitor?.email || "",
      phoneNumber: visitor?.phoneNumber || "",
      gender: visitor?.gender || "",
      visitorType: visitor?.visitorType || "Walk In",
      purposeOfVisit: visitor?.purposeOfVisit || "",
      visitorCompany: visitor?.visitorCompany || "",
      location:
        visitor?.building && typeof visitor.building === "object"
          ? visitor.building._id
          : visitor?.building || "",
      unit:
        visitor?.unit && typeof visitor.unit === "object"
          ? visitor.unit._id
          : visitor?.unit || "",
      toMeetCompany: selectedToMeetCompany,
      department: normalizedDepartment,
      toMeet:
        visitor?.toMeet && typeof visitor.toMeet === "object"
          ? visitor.toMeet._id
          : visitor?.clientToMeet && typeof visitor.clientToMeet === "object"
            ? visitor.clientToMeet._id
            : "",
      scheduledDate: visitor?.scheduledDate
        ? dayjs(visitor.scheduledDate)
        : null,
      checkIn: dayjs(),
      checkOut: null,
    });

    setIsRepeatModalOpen(true);
  };

  const closeRepeatModal = () => {
    setIsRepeatModalOpen(false);
    setSelectedVisitor(null);
    setSelectedDepartment("");
    resetRepeatForm();
  };

  const submit = (data) => {
    const checkInDate = selectedVisitor?.checkIn
      ? dayjs(selectedVisitor.checkIn)
      : null;
    const checkOutRaw = data.checkOutRaw ? dayjs(data.checkOutRaw) : null;

    const combinedCheckout =
      checkInDate && checkOutRaw
        ? checkInDate
            .hour(checkOutRaw.hour())
            .minute(checkOutRaw.minute())
            .second(checkOutRaw.second())
            .millisecond(checkOutRaw.millisecond())
        : checkOutRaw;

    mutate({
      ...data,
      checkOut: combinedCheckout ? combinedCheckout.toISOString() : null,
    });
  };

  const submitRepeatVisitor = (data) => {
    const isScheduledVisitor = data.visitorType === "Scheduled";
    const parsedCheckIn = data.checkIn ? dayjs(data.checkIn) : dayjs();
    const hasCheckIn = !!parsedCheckIn?.isValid();
    const checkIn = hasCheckIn ? parsedCheckIn : dayjs();

    if (isScheduledVisitor && !data.scheduledDate) {
      toast.error("Scheduled date is required for scheduled visitors.");
      return;
    }
    const parsedCheckOut = data.checkOut ? dayjs(data.checkOut) : null;
    const hasCheckOut = !!parsedCheckOut?.isValid();
    const checkOut = hasCheckOut ? parsedCheckOut : null;

    if (hasCheckOut && checkOut.isBefore(checkIn)) {
      toast.error("Check-Out time cannot be before Check-In time.");
      return;
    }

    repeatVisitor({
      visitorType: data.visitorType,
      purposeOfVisit: data.purposeOfVisit,
      building: data.location || null,
      unit: data.unit || null,
      visitorCompany: data.visitorCompany || "",
      department:
        data.toMeetCompany === BIZNEST_COMPANY_ID
          ? data.department || null
          : null,
      toMeetCompany: data.toMeetCompany || null,
      toMeet:
        data.toMeetCompany === BIZNEST_COMPANY_ID ? data.toMeet || null : null,
      clientToMeet:
        data.toMeetCompany !== BIZNEST_COMPANY_ID ? data.toMeet || null : null,
      scheduledDate: isScheduledVisitor
        ? dayjs(data.scheduledDate).startOf("day").toISOString()
        : null,
      checkIn: checkIn.toISOString(),
      checkOut: hasCheckOut ? checkOut.toISOString() : null,
    });
  };

  const getBuildingName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.building?.buildingName) return visitor.building.buildingName;
    if (typeof visitor?.building === "string") {
      const matchedBuilding = auth?.user?.company?.workLocations?.find(
        (loc) => loc?._id === visitor.building,
      );
      return matchedBuilding?.buildingName || "N/A";
    }
    return "N/A";
  };

  const getUnitName = (visitor) => {
    if (!visitor) return "N/A";
    if (visitor?.unit?.unitNo) return visitor.unit.unitNo;
    if (typeof visitor?.unit === "string") {
      const matchedUnit = unitsData?.find((unit) => unit?._id === visitor.unit);
      return matchedUnit?.unitNo || matchedUnit?.name || "N/A";
    }
    return "N/A";
  };

  const visitorsColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "name", headerName: "Name" },
    { field: "purposeOfVisit", headerName: "Purpose" },
    {
      field: "scheduledDate",
      headerName: "Scheduled Date",
      cellRenderer: ({ data }) =>
        data?.visitorType === "Scheduled" && data?.scheduledDate
          ? dayjs(data.scheduledDate).format("DD-MM-YYYY")
          : "-",
    },
    { field: "toMeet", headerName: "To Meet" },
    { field: "date", headerName: "Date of Visit" },
    {
      field: "checkIn",
      headerName: "Check In",
      cellRenderer: (params) => humanTime(params.value),
    },
    { field: "checkOut", headerName: "Check Out" },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      cellRenderer: ({ data }) => {
        const menuItems = [];

        if (canRepeatVisitor) {
          menuItems.push({
            label: "Repeat Visitor",
            onClick: () => openRepeatModal(data),
          });
        }

        return (
          <div className="flex items-center gap-2">
            <div
              role="button"
              onClick={() => openModalWithMode(data, "view")}
              className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
            >
              <MdOutlineRemoveRedEye />
            </div>
            <ThreeDotMenu menuItems={menuItems} />
          </div>
        );
      },
    },
  ];

  const isBiznest = selectedCompany === BIZNEST_COMPANY_ID;
  const showClientMembers = selectedCompany && !isBiznest;
  const showBiznestEmployees = isBiznest && selectedDepartment;

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          dateColumn={"checkIn"}
          search
          tableTitle="Repeat Internal Visitors"
          data={visitorsData
            .filter((m) => m.visitorFlag !== "Client")
            .map((item, index) => ({
              ...item,
              srNo: index + 1,
              mongoId: item._id,
              firstName: item.firstName,
              lastName: item.lastName,
              name: `${item.firstName} ${item.lastName}`,
              email: item.email,
              visitorType: item.visitorType,
              visitorCompany: item.visitorCompany,
              date: item.date,
              phoneNumber: item.phoneNumber,
              purposeOfVisit: item.purposeOfVisit,
              toMeet: item.toMeet
                ? `${item.toMeet?.firstName} ${item.toMeet?.lastName}`
                : item.clientToMeet
                  ? item?.clientToMeet?.employeeName
                  : "",
              buildingName: getBuildingName(item),
              unitName: getUnitName(item),
              checkIn: item.checkIn,
              checkInBy: item.checkedInBy
                ? `${item.checkedInBy.firstName} ${item.checkedInBy.lastName}`
                : "-",
              checkOut: item.checkOut ? humanTime(item.checkOut) : "",
              checkOutRaw: item.checkOut,
              scheduledDate: item.scheduledDate || null,
              checkOutBy: item.checkedOutBy
                ? `${item.checkedOutBy.firstName} ${item.checkedOutBy.lastName}`
                : "-",
            }))}
          columns={visitorsColumns}
        />
      </PageFrame>

      <MuiModal
        open={isViewEditModalOpen}
        onClose={closeViewEditModal}
        title="Visitor Details"
      >
        <form
          onSubmit={handleSubmit(submit)}
          className="grid grid-cols-1 gap-4"
        >
          {modalMode === "view" ? (
            <>
              <DetalisFormatted
                title="First Name"
                detail={selectedVisitor?.firstName}
              />
              <DetalisFormatted
                title="Last Name"
                detail={selectedVisitor?.lastName}
              />
              <DetalisFormatted title="Email" detail={selectedVisitor?.email} />
              <DetalisFormatted
                title="Phone Number"
                detail={selectedVisitor?.phoneNumber}
              />
              <DetalisFormatted
                title="Purpose"
                detail={selectedVisitor?.purposeOfVisit}
              />
              <DetalisFormatted
                title="Visitor Type"
                detail={selectedVisitor?.visitorType}
              />
              <DetalisFormatted
                title="Visitor Company"
                detail={selectedVisitor?.visitorCompany}
              />
              <DetalisFormatted
                title="To Meet"
                detail={selectedVisitor?.toMeet}
              />
              <DetalisFormatted
                title="Building"
                detail={selectedVisitor?.buildingName || "N/A"}
              />
              <DetalisFormatted
                title="Unit"
                detail={selectedVisitor?.unitName || "N/A"}
              />
              <DetalisFormatted
                title="Date of Visit"
                detail={selectedVisitor?.date}
              />
              <DetalisFormatted
                title="Check In"
                detail={humanTime(selectedVisitor?.checkIn)}
              />
              <DetalisFormatted
                title="Check In By"
                detail={selectedVisitor?.checkInBy}
              />
              <DetalisFormatted
                title="Check Out"
                detail={
                  selectedVisitor?.checkOutRaw
                    ? humanTime(selectedVisitor.checkOutRaw)
                    : ""
                }
              />
              <DetalisFormatted
                title="Check Out By"
                detail={selectedVisitor?.checkOutBy}
              />
            </>
          ) : (
            <>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="First Name"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Last Name"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Email" size="small" fullWidth />
                )}
              />
              <Controller
                name="phoneNumber"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Phone Number"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="purposeOfVisit"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Purpose"
                    size="small"
                    fullWidth
                  />
                )}
              />
              <Controller
                name="checkOutRaw"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    label="Checkout Time"
                    value={field.value}
                    onChange={field.onChange}
                    slotProps={{
                      textField: { size: "small", fullWidth: true },
                    }}
                  />
                )}
              />
              <PrimaryButton
                title={isUpdating ? "Saving..." : "Save"}
                disabled={isUpdating}
                type="submit"
              />
            </>
          )}
        </form>
      </MuiModal>

      <MuiModal
        open={isRepeatModalOpen}
        onClose={closeRepeatModal}
        title="Repeat Visitor"
      >
        <form
          className="grid grid-cols-1 gap-4"
          onSubmit={handleRepeatSubmit(submitRepeatVisitor)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="firstName"
              control={repeatControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="First Name"
                  size="small"
                  disabled
                />
              )}
            />
            <Controller
              name="lastName"
              control={repeatControl}
              render={({ field }) => (
                <TextField {...field} label="Last Name" size="small" disabled />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="email"
              control={repeatControl}
              render={({ field }) => (
                <TextField {...field} label="Email" size="small" disabled />
              )}
            />
            <Controller
              name="phoneNumber"
              control={repeatControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Phone Number"
                  size="small"
                  disabled
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="gender"
              control={repeatControl}
              render={({ field }) => (
                <TextField {...field} label="Gender" size="small" disabled />
              )}
            />
            <Controller
              name="visitorCompany"
              control={repeatControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Visitor Company"
                  size="small"
                  disabled
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="visitorType"
              control={repeatControl}
              rules={{ required: "Select Visitor is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Visitor"
                  size="small"
                  error={!!repeatErrors.visitorType}
                  helperText={repeatErrors.visitorType?.message}
                >
                  <MenuItem value="Walk In">Walk In</MenuItem>
                  <MenuItem value="Scheduled">Scheduled</MenuItem>
                </TextField>
              )}
            />
            <Controller
              name="purposeOfVisit"
              control={repeatControl}
              rules={{ required: "Purpose of Visit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Purpose of Visit"
                  size="small"
                  error={!!repeatErrors.purposeOfVisit}
                  helperText={repeatErrors.purposeOfVisit?.message}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Controller
              name="location"
              control={repeatControl}
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Location"
                  size="small"
                  error={!!repeatErrors.location}
                  helperText={repeatErrors.location?.message}
                >
                  <MenuItem value="">Select Location</MenuItem>
                  {auth?.user?.company?.workLocations?.map((loc) => (
                    <MenuItem key={loc._id} value={loc._id}>
                      {loc.buildingName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="unit"
              control={repeatControl}
              rules={{ required: "Unit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Unit"
                  size="small"
                  error={!!repeatErrors.unit}
                  helperText={repeatErrors.unit?.message}
                >
                  <MenuItem value="">Select Unit</MenuItem>
                  {unitsData
                    .filter((item) => item?.building?._id === watchLocation)
                    .map((item) => (
                      <MenuItem key={item._id} value={item._id}>
                        {item.unitNo || item.name || "Unit"}
                      </MenuItem>
                    ))}
                </TextField>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Controller
              name="toMeetCompany"
              control={repeatControl}
              rules={{ required: "Company is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Select Company(To Meet)"
                  size="small"
                  onChange={(e) => {
                    field.onChange(e);
                    setSelectedDepartment("");
                  }}
                  error={!!repeatErrors.toMeetCompany}
                  helperText={repeatErrors.toMeetCompany?.message}
                >
                  <MenuItem value="" disabled>
                    Select Company
                  </MenuItem>
                  <MenuItem value="6799f0cd6a01edbe1bc3fcea">BIZNest</MenuItem>
                  {clientCompanies.map((client) => (
                    <MenuItem key={client._id} value={client._id}>
                      {client.clientName}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="department"
              control={repeatControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Department"
                  disabled={!isBiznest}
                  onChange={(e) => {
                    field.onChange(e);
                    setSelectedDepartment(e.target.value);
                  }}
                >
                  <MenuItem value="">Select Department</MenuItem>
                  {uniqueDepartments.map((department) => (
                    <MenuItem key={department._id} value={department._id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Controller
              name="toMeet"
              control={repeatControl}
              rules={{ required: "Person is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Person"
                  error={!!repeatErrors.toMeet}
                  helperText={repeatErrors.toMeet?.message}
                  disabled={!showClientMembers && !showBiznestEmployees}
                >
                  <MenuItem value="">Select the person to meet</MenuItem>
                  {showClientMembers && !clientMembersIsLoading
                    ? clientMembers.map((member) => (
                        <MenuItem key={member._id} value={member._id}>
                          {member.employeeName}
                        </MenuItem>
                      ))
                    : null}
                  {showBiznestEmployees
                    ? departmentEmployees.map((emp) => (
                        <MenuItem key={emp._id} value={emp._id}>
                          {emp.firstName} {emp.lastName}
                        </MenuItem>
                      ))
                    : null}
                </TextField>
              )}
            />
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Controller
                name="scheduledDate"
                control={repeatControl}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    format="DD-MM-YYYY"
                    label="Scheduled Date"
                    disablePast
                    disabled={watchRepeat("visitorType") !== "Scheduled"}
                    value={
                      watchRepeat("visitorType") !== "Scheduled"
                        ? dayjs()
                        : field.value
                    }
                    onChange={field.onChange}
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />
              <Controller
                name="checkIn"
                control={repeatControl}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Check-In Time"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                      },
                    }}
                  />
                )}
              />

              <Controller
                name="checkOut"
                control={repeatControl}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Check-Out Time"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        sx: {
                          "& .MuiInputBase-input": {
                            color: "#000000",
                          },
                          "& .MuiInputBase-input::placeholder": {
                            color: "#000000",
                            opacity: 1,
                          },
                          "& .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000000",
                          },
                          "&:hover .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000000",
                          },
                          "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                            borderColor: "#000000",
                          },
                          "& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#000000",
                            },
                          "&:hover .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#000000",
                            },
                          "& .MuiOutlinedInput-root.Mui-focused.Mui-error .MuiOutlinedInput-notchedOutline":
                            {
                              borderColor: "#000000",
                            },
                        },
                      },
                    }}
                    shouldDisableTime={(time, view) => {
                      const startTime = watchRepeat("checkIn");

                      if (!startTime) return false;

                      const startDate = dayjs(startTime).toDate();
                      const current = time.$d;

                      if (view === "hours") {
                        return current.getHours() < startDate.getHours();
                      }

                      if (view === "minutes") {
                        const selectedHour = dayjs(field.value).isValid()
                          ? dayjs(field.value).hour()
                          : null;

                        return (
                          selectedHour === startDate.getHours() &&
                          current.getMinutes() < startDate.getMinutes()
                        );
                      }

                      return false;
                    }}
                  />
                )}
              />
            </div>
          </LocalizationProvider>
          <PrimaryButton
            className="w-full"
            title={isRepeatingVisitor ? "Submitting..." : "Submit"}
            type="submit"
            disabled={isRepeatingVisitor}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default RepeatInternalVisitors;
