import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, MenuItem, Popover, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import { MdCalendarToday, MdOutlineRemoveRedEye } from "react-icons/md";
import AgTable from "../../components/AgTable";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { DateRangePicker } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

const BIZNEST_COMPANY_ID = "6799f0cd6a01edbe1bc3fcea";

const getId = (value) => (typeof value === "object" ? value?._id : value) || "";

const joinName = (...parts) => parts.filter(Boolean).join(" ");

const getUserName = (user) =>
  user?.employeeName ||
  joinName(user?.firstName, user?.lastName) ||
  user?.name ||
  user?.email ||
  "—";

const getCompanyName = (company) =>
  company?.clientName || company?.companyName || company?.name || "—";

const getLocationName = (location, unit) =>
  location?.buildingName || unit?.building?.buildingName || "—";
const getUnitName = (unit) => unit?.unitNo || unit?.unitName || "—";
const getDepartmentName = (department) => department?.name || "—";

const formatDateTime = (value) =>
  value && dayjs(value).isValid()
    ? dayjs(value).format("DD-MM-YYYY hh:mm A")
    : "—";

const getEmployeeDepartments = (employee) =>
  Array.isArray(employee?.departments) ? employee.departments : [];

const buildDefaultValues = () => ({
  takenBy: "",
  dateOfPrintout: dayjs(),
  timeOfPrintout: dayjs(),
  location: "",
  unit: "",
  client: "",
  requestedBy: "",
  department: "",
  printoutCount: "",
});

const ManagePrintout = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const companyId = auth?.user?.company?._id || BIZNEST_COMPANY_ID;

  const [selectedPrintout, setSelectedPrintout] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: dayjs().startOf("month").toDate(),
      endDate: dayjs().endOf("month").toDate(),
      key: "selection",
    },
  ]);
  const [anchorEl, setAnchorEl] = useState(null);
  const openCalendar = Boolean(anchorEl);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: buildDefaultValues(),
  });

  const selectedClient = watch("client");
  const selectedDepartment = watch("department");
  const selectedLocation = watch("location");
  const isBiznestClient = selectedClient === companyId;

  const { data: printouts = [], isLoading: isPrintoutsLoading } = useQuery({
    queryKey: ["printouts"],
    queryFn: async () => {
      const response = await axios.get("/api/printout");
      return response.data?.printouts || [];
    },
  });

  const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return response.data;
    },
  });

  const { data: clientCompanies = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ["clientCompanies"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return response.data;
    },
  });

  const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return response.data;
    },
  });

  const { data: clientMembers = [], isLoading: isClientMembersLoading } =
    useQuery({
      queryKey: ["clientMembers", selectedClient],
      queryFn: async () => {
        const response = await axios.get(
          `/api/sales/co-working-client-members?clientId=${selectedClient}`
        );
        return response.data;
      },
      enabled: Boolean(selectedClient && !isBiznestClient),
    });

  const uniqueDepartments = useMemo(() => {
    const departmentMap = new Map();
    employees.forEach((employee) => {
      getEmployeeDepartments(employee).forEach((department) => {
        departmentMap.set(department._id, department);
      });
    });
    return Array.from(departmentMap.values());
  }, [employees]);

  const departmentEmployees = useMemo(
    () =>
      employees.filter((employee) =>
        getEmployeeDepartments(employee).some(
          (department) => department._id === selectedDepartment
        )
      ),
    [employees, selectedDepartment]
  );

  const filteredClientCompanies = useMemo(() => {
    const seenNames = new Set();

    return clientCompanies.filter((client) => {
      if (client?.isActive === false) return false;

      const normalizedName = (client?.clientName || "").trim().toLowerCase();
      if (!normalizedName || ["biznest", "biz nest"].includes(normalizedName)) {
        return false;
      }

      if (seenNames.has(normalizedName)) return false;
      seenNames.add(normalizedName);
      return true;
    });
  }, [clientCompanies]);

  const filteredPrintouts = useMemo(() => {
    const startDate = dateRange[0]?.startDate
      ? dayjs(dateRange[0].startDate).startOf("day")
      : null;
    const endDate = dateRange[0]?.endDate
      ? dayjs(dateRange[0].endDate).endOf("day")
      : null;

    return printouts.filter((printout) => {
      const takenAt = dayjs(printout.takenAt);
      if (!takenAt.isValid()) return false;
      if (startDate && takenAt.isBefore(startDate)) return false;
      if (endDate && takenAt.isAfter(endDate)) return false;
      return true;
    });
  }, [dateRange, printouts]);

  const tableRows = useMemo(
    () =>
      filteredPrintouts.map((printout, index) => ({
        rawPrintout: printout,
        srNo: index + 1,
        takenBy: getUserName(printout.takenBy),
        takenAt: formatDateTime(printout.takenAt),
        location: getLocationName(printout.location, printout.unit),
        unit: getUnitName(printout.unit),
        client: getCompanyName(printout.client),
        requestedBy: getUserName(printout.requestedBy),
        department: getDepartmentName(printout.department),
        printoutCount: printout.printoutCount,
      })),
    [filteredPrintouts]
  );

  const { mutate: updatePrintout, isPending: isUpdatingPrintout } = useMutation({
    mutationKey: ["updatePrintout"],
    mutationFn: async (formData) => {
      const payload = {
        takenBy: formData.takenBy,
        takenAt: dayjs(formData.dateOfPrintout)
          .hour(dayjs(formData.timeOfPrintout).hour())
          .minute(dayjs(formData.timeOfPrintout).minute())
          .second(0)
          .millisecond(0)
          .toISOString(),
        location: formData.location,
        unit: formData.unit,
        client: formData.client,
        requestedBy: formData.requestedBy,
        department: isBiznestClient ? formData.department || null : null,
        printoutCount: Number(formData.printoutCount),
      };

      const response = await axios.patch(
        `/api/printout/${selectedPrintout._id}`,
        payload
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Printout updated successfully");
      queryClient.invalidateQueries({ queryKey: ["printouts"] });
      setIsEditModalOpen(false);
      setSelectedPrintout(null);
      reset(buildDefaultValues());
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "An error occurred while updating printout"
      );
    },
  });

  const openViewModal = (printout) => {
    setSelectedPrintout(printout.rawPrintout);
    setIsViewModalOpen(true);
  };

  const openEditModal = (printout) => {
    const rawPrintout = printout.rawPrintout;
    setSelectedPrintout(rawPrintout);
    const takenAt = dayjs(rawPrintout.takenAt);

    reset({
      takenBy: getId(rawPrintout.takenBy),
      dateOfPrintout: takenAt.isValid() ? takenAt : dayjs(),
      timeOfPrintout: takenAt.isValid() ? takenAt : dayjs(),
      location: getId(rawPrintout.location) || getId(rawPrintout.unit?.building),
      unit: getId(rawPrintout.unit),
      client: getId(rawPrintout.client),
      requestedBy: getId(rawPrintout.requestedBy),
      department: getId(rawPrintout.department),
      printoutCount: rawPrintout.printoutCount || "",
    });
    setIsEditModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedPrintout(null);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPrintout(null);
    reset(buildDefaultValues());
  };

  const handleClientChange = (field, value) => {
    field.onChange(value);
    setValue("department", "");
    setValue("requestedBy", "");
  };

  const handleDepartmentChange = (field, value) => {
    field.onChange(value);
    setValue("requestedBy", "");
  };

  const handleOpenCalendar = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseCalendar = () => {
    setAnchorEl(null);
  };

  const detailItems = selectedPrintout
    ? [
        ["Taken By", getUserName(selectedPrintout.takenBy)],
        ["Taken At", formatDateTime(selectedPrintout.takenAt)],
        ["Building", getLocationName(selectedPrintout.location, selectedPrintout.unit)],
        ["Unit", getUnitName(selectedPrintout.unit)],
        ["Company", getCompanyName(selectedPrintout.client)],
        ["Person", getUserName(selectedPrintout.requestedBy)],
        ["Department", getDepartmentName(selectedPrintout.department)],
        ["Quantity", selectedPrintout.printoutCount],
      ]
    : [];

  const columns = [
    { field: "srNo", headerName: "Sr. No.", width: 110 },
    { field: "takenBy", headerName: "Taken By",flex:1},
    { field: "takenAt", headerName: "Taken At",flex:1},
    { field: "location", headerName: "Building",flex:1},
    { field: "unit", headerName: "Unit",flex:1},
    { field: "client", headerName: "Company",flex:1},
    { field: "requestedBy", headerName: "Person",flex:1},
    { field: "department", headerName: "Department",flex:1},
    { field: "printoutCount", headerName: "Quantity",flex:1},
    {
      field: "actions",
      headerName: "Action",
      pinned: "right",
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-2">
          <div
            role="button"
            onClick={() => openViewModal(data)}
            className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
          >
            <MdOutlineRemoveRedEye />
          </div>
          <ThreeDotMenu
            menuItems={[{ label: "Edit", onClick: () => openEditModal(data) }]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <div className="flex flex-col gap-4 pb-4">
          <div className="grid grid-cols-12 items-center w-full pb-4 border-b border-borderGray">
            <div className="col-span-12 md:col-span-4">
              <span className="text-title text-primary font-pmedium uppercase">
                Manage Printout
              </span>
            </div>
            <div className="col-span-12 md:col-span-4 flex justify-center">
              <div className="flex items-center gap-2">
                <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                  <span className="text-gray-600 text-content font-pregular">
                    {dayjs(dateRange[0]?.startDate).format("DD MMM YYYY")}
                  </span>
                </div>
                <div className="px-6 py-1 rounded-md border-primary border-[1px]">
                  <span className="text-gray-600 text-content font-pregular">
                    {dayjs(dateRange[0]?.endDate).format("DD MMM YYYY")}
                  </span>
                </div>
                <div
                  className="p-2 rounded-md bg-primary text-white cursor-pointer hover:bg-[#1E3D55]"
                  onClick={handleOpenCalendar}
                >
                  <MdCalendarToday size={19} />
                </div>
              </div>
            </div>
          </div>

          <Popover
            open={openCalendar}
            anchorEl={anchorEl}
            onClose={handleCloseCalendar}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
          >
            <DateRangePicker
              ranges={dateRange}
              onChange={(item) => setDateRange([item.selection])}
              moveRangeOnFirstSelection={false}
            />
          </Popover>

          <AgTable
            data={tableRows}
            columns={columns}
            search
            tableHeight={500}
            //hideFilter
            //hideTitle
            paginationPageSize={10}
          />
          {isPrintoutsLoading ? (
            <div className="flex justify-center p-4">
              <CircularProgress size={24} />
            </div>
          ) : null}
        </div>
      </PageFrame>

      <MuiModal
        open={isViewModalOpen}
        onClose={closeViewModal}
        title="Printout Details"
      >
        <div className="flex flex-col gap-3">
          {detailItems.map(([title, detail]) => (
            <DetalisFormatted key={title} title={title} detail={detail} />
          ))}
        </div>
      </MuiModal>

      <MuiModal
        open={isEditModalOpen}
        onClose={closeEditModal}
        title="Edit Printout"
      >
        <form onSubmit={handleSubmit(updatePrintout)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Controller
              name="takenBy"
              control={control}
              rules={{ required: "Taken by is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Taken By"
                  error={!!errors.takenBy}
                  helperText={errors.takenBy?.message}
                  fullWidth
                  disabled
                >
                  <MenuItem value="">Select Taken By</MenuItem>
                  {isEmployeesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    employees.map((employee) => (
                      <MenuItem key={employee._id} value={employee._id}>
                        {getUserName(employee)}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name="location"
              control={control}
              rules={{ required: "Location is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Location"
                  error={!!errors.location}
                  helperText={errors.location?.message}
                  fullWidth
                  onChange={(event) => {
                    field.onChange(event);
                    setValue("unit", "");
                  }}
                >
                  <MenuItem value="">Select Location</MenuItem>
                  {auth?.user?.company?.workLocations?.length ? (
                    auth.user.company.workLocations.map((location) => (
                      <MenuItem key={location._id} value={location._id}>
                        {location.buildingName}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No Locations Available</MenuItem>
                  )}
                </TextField>
              )}
            />

            <Controller
              name="unit"
              control={control}
              rules={{ required: "Unit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Select Unit"
                  disabled={!selectedLocation}
                  error={!!errors.unit}
                  helperText={errors.unit?.message}
                  fullWidth
                >
                  <MenuItem value="">Select Unit</MenuItem>
                  {isUnitsPending ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    unitsData
                      .filter((unit) => unit?.building?._id === selectedLocation)
                      .map((unit) => (
                        <MenuItem key={unit._id} value={unit._id}>
                          {getUnitName(unit)}
                        </MenuItem>
                      ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name="client"
              control={control}
              rules={{ required: "Company is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Select Company"
                  error={!!errors.client}
                  helperText={errors.client?.message}
                  fullWidth
                  onChange={(event) => handleClientChange(field, event.target.value)}
                >
                  <MenuItem value="">Select Company</MenuItem>
                  <MenuItem value={companyId}>BIZNest</MenuItem>
                  {isClientsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : (
                    filteredClientCompanies.map((client) => (
                      <MenuItem key={client._id} value={client._id}>
                        {client.clientName}
                      </MenuItem>
                    ))
                  )}
                </TextField>
              )}
            />

            <Controller
              name="department"
              control={control}
              rules={{
                validate: (value) =>
                  !isBiznestClient || value ? true : "Department is required",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Select Department"
                  disabled={!isBiznestClient}
                  error={!!errors.department}
                  helperText={errors.department?.message}
                  fullWidth
                  onChange={(event) =>
                    handleDepartmentChange(field, event.target.value)
                  }
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
              name="requestedBy"
              control={control}
              rules={{ required: "Person is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  size="small"
                  label="Select Person"
                  disabled={
                    !selectedClient || (isBiznestClient && !selectedDepartment)
                  }
                  error={!!errors.requestedBy}
                  helperText={errors.requestedBy?.message}
                  fullWidth
                >
                  <MenuItem value="">Select Person</MenuItem>
                  {isBiznestClient && isEmployeesLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : null}
                  {isBiznestClient
                    ? departmentEmployees.map((employee) => (
                        <MenuItem key={employee._id} value={employee._id}>
                          {getUserName(employee)}
                        </MenuItem>
                      ))
                    : null}
                  {!isBiznestClient && isClientMembersLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} />
                    </MenuItem>
                  ) : null}
                  {!isBiznestClient
                    ? clientMembers.map((member) => (
                        <MenuItem key={member._id} value={member._id}>
                          {member.employeeName}
                        </MenuItem>
                      ))
                    : null}
                </TextField>
              )}
            />

            <Controller
              name="printoutCount"
              control={control}
              rules={{
                required: "Printout count is required",
                min: { value: 1, message: "Printout count must be at least 1" },
                validate: (value) =>
                  Number.isInteger(Number(value)) ||
                  "Printout count must be a whole number",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  type="number"
                  label="Printout Count"
                  inputProps={{ min: 1, step: 1 }}
                  error={!!errors.printoutCount}
                  helperText={errors.printoutCount?.message}
                  fullWidth
                />
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dateOfPrintout"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Date"
                    format="DD-MM-YYYY"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!errors.dateOfPrintout,
                        helperText: errors.dateOfPrintout?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="timeOfPrintout"
                control={control}
                rules={{ required: "Time is required" }}
                render={({ field }) => (
                  <TimePicker
                    {...field}
                    label="Time"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: !!errors.timeOfPrintout,
                        helperText: errors.timeOfPrintout?.message,
                      },
                    }}
                  />
                )}
              />
            </LocalizationProvider>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <PrimaryButton
              type="submit"
              title="Save Changes"
              isLoading={isUpdatingPrintout}
              disabled={isUpdatingPrintout}
            />
            <SecondaryButton handleSubmit={closeEditModal} title="Cancel" />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default ManagePrintout;





// import { useMemo, useState } from "react";
// import { Controller, useForm } from "react-hook-form";
// import { CircularProgress, MenuItem, TextField } from "@mui/material";
// import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import dayjs from "dayjs";
// import { toast } from "sonner";
// import { MdOutlineRemoveRedEye } from "react-icons/md";
// import AgTable from "../../components/AgTable";
// import DetalisFormatted from "../../components/DetalisFormatted";
// import MuiModal from "../../components/MuiModal";
// import PageFrame from "../../components/Pages/PageFrame";
// import PrimaryButton from "../../components/PrimaryButton";
// import SecondaryButton from "../../components/SecondaryButton";
// import ThreeDotMenu from "../../components/ThreeDotMenu";
// import useAuth from "../../hooks/useAuth";
// import useAxiosPrivate from "../../hooks/useAxiosPrivate";

// const BIZNEST_COMPANY_ID = "6799f0cd6a01edbe1bc3fcea";

// const getId = (value) => (typeof value === "object" ? value?._id : value) || "";

// const joinName = (...parts) => parts.filter(Boolean).join(" ");

// const getUserName = (user) =>
//   user?.employeeName ||
//   joinName(user?.firstName, user?.lastName) ||
//   user?.name ||
//   user?.email ||
//   "—";

// const getCompanyName = (company) =>
//   company?.clientName || company?.companyName || company?.name || "—";

// const getUnitName = (unit) => unit?.unitNo || unit?.unitName || "—";
// const getDepartmentName = (department) => department?.name || "—";

// const formatDateTime = (value) =>
//   value && dayjs(value).isValid()
//     ? dayjs(value).format("DD-MM-YYYY hh:mm A")
//     : "—";

// const getEmployeeDepartments = (employee) =>
//   Array.isArray(employee?.departments) ? employee.departments : [];

// const buildDefaultValues = () => ({
//   takenBy: "",
//   dateOfPrintout: dayjs(),
//   timeOfPrintout: dayjs(),
//   unit: "",
//   client: "",
//   requestedBy: "",
//   department: "",
//   printoutCount: "",
// });

// const ManagePrintout = () => {
//   const axios = useAxiosPrivate();
//   const { auth } = useAuth();
//   const queryClient = useQueryClient();
//   const companyId = auth?.user?.company?._id || BIZNEST_COMPANY_ID;

//   const [selectedPrintout, setSelectedPrintout] = useState(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);

//   const {
//     control,
//     handleSubmit,
//     reset,
//     watch,
//     setValue,
//     formState: { errors },
//   } = useForm({
//     mode: "onChange",
//     defaultValues: buildDefaultValues(),
//   });

//   const selectedClient = watch("client");
//   const selectedDepartment = watch("department");
//   const isBiznestClient = selectedClient === companyId;

//   const { data: printouts = [], isLoading: isPrintoutsLoading } = useQuery({
//     queryKey: ["printouts"],
//     queryFn: async () => {
//       const response = await axios.get("/api/printout");
//       return response.data?.printouts || [];
//     },
//   });

//   const { data: employees = [], isLoading: isEmployeesLoading } = useQuery({
//     queryKey: ["employees"],
//     queryFn: async () => {
//       const response = await axios.get("/api/users/fetch-users");
//       return response.data;
//     },
//   });

//   const { data: clientCompanies = [], isLoading: isClientsLoading } = useQuery({
//     queryKey: ["clientCompanies"],
//     queryFn: async () => {
//       const response = await axios.get("/api/sales/co-working-clients");
//       return response.data;
//     },
//   });

//   const { data: unitsData = [], isPending: isUnitsPending } = useQuery({
//     queryKey: ["unitsData"],
//     queryFn: async () => {
//       const response = await axios.get("/api/company/fetch-units");
//       return response.data;
//     },
//   });

//   const { data: clientMembers = [], isLoading: isClientMembersLoading } =
//     useQuery({
//       queryKey: ["clientMembers", selectedClient],
//       queryFn: async () => {
//         const response = await axios.get(
//           `/api/sales/co-working-client-members?clientId=${selectedClient}`
//         );
//         return response.data;
//       },
//       enabled: Boolean(selectedClient && !isBiznestClient),
//     });

//   const uniqueDepartments = useMemo(() => {
//     const departmentMap = new Map();
//     employees.forEach((employee) => {
//       getEmployeeDepartments(employee).forEach((department) => {
//         departmentMap.set(department._id, department);
//       });
//     });
//     return Array.from(departmentMap.values());
//   }, [employees]);

//   const departmentEmployees = useMemo(
//     () =>
//       employees.filter((employee) =>
//         getEmployeeDepartments(employee).some(
//           (department) => department._id === selectedDepartment
//         )
//       ),
//     [employees, selectedDepartment]
//   );

//   const filteredClientCompanies = useMemo(() => {
//     const seenNames = new Set();

//     return clientCompanies.filter((client) => {
//       if (client?.isActive === false) return false;

//       const normalizedName = (client?.clientName || "").trim().toLowerCase();
//       if (!normalizedName || ["biznest", "biz nest"].includes(normalizedName)) {
//         return false;
//       }

//       if (seenNames.has(normalizedName)) return false;
//       seenNames.add(normalizedName);
//       return true;
//     });
//   }, [clientCompanies]);

//   const tableRows = useMemo(
//     () =>
//       printouts.map((printout, index) => ({
//         ...printout,
//         srNo: index + 1,
//         takenByName: getUserName(printout.takenBy),
//         takenAtFormatted: formatDateTime(printout.takenAt),
//         unitName: getUnitName(printout.unit),
//         clientName: getCompanyName(printout.client),
//         requestedByName: getUserName(printout.requestedBy),
//         departmentName: getDepartmentName(printout.department),
//       })),
//     [printouts]
//   );

//   const { mutate: updatePrintout, isPending: isUpdatingPrintout } = useMutation({
//     mutationKey: ["updatePrintout"],
//     mutationFn: async (formData) => {
//       const payload = {
//         takenBy: formData.takenBy,
//         takenAt: dayjs(formData.dateOfPrintout)
//           .hour(dayjs(formData.timeOfPrintout).hour())
//           .minute(dayjs(formData.timeOfPrintout).minute())
//           .second(0)
//           .millisecond(0)
//           .toISOString(),
//         unit: formData.unit,
//         client: formData.client,
//         requestedBy: formData.requestedBy,
//         department: isBiznestClient ? formData.department || null : null,
//         printoutCount: Number(formData.printoutCount),
//       };

//       const response = await axios.patch(
//         `/api/printout/${selectedPrintout._id}`,
//         payload
//       );
//       return response.data;
//     },
//     onSuccess: (data) => {
//       toast.success(data?.message || "Printout updated successfully");
//       queryClient.invalidateQueries({ queryKey: ["printouts"] });
//       setIsEditModalOpen(false);
//       setSelectedPrintout(null);
//       reset(buildDefaultValues());
//     },
//     onError: (error) => {
//       toast.error(
//         error?.response?.data?.message || "An error occurred while updating printout"
//       );
//     },
//   });

//   const openViewModal = (printout) => {
//     setSelectedPrintout(printout);
//     setIsViewModalOpen(true);
//   };

//   const openEditModal = (printout) => {
//     setSelectedPrintout(printout);
//     const takenAt = dayjs(printout.takenAt);

//     reset({
//       takenBy: getId(printout.takenBy),
//       dateOfPrintout: takenAt.isValid() ? takenAt : dayjs(),
//       timeOfPrintout: takenAt.isValid() ? takenAt : dayjs(),
//       unit: getId(printout.unit),
//       client: getId(printout.client),
//       requestedBy: getId(printout.requestedBy),
//       department: getId(printout.department),
//       printoutCount: printout.printoutCount || "",
//     });
//     setIsEditModalOpen(true);
//   };

//   const closeViewModal = () => {
//     setIsViewModalOpen(false);
//     setSelectedPrintout(null);
//   };

//   const closeEditModal = () => {
//     setIsEditModalOpen(false);
//     setSelectedPrintout(null);
//     reset(buildDefaultValues());
//   };

//   const handleClientChange = (field, value) => {
//     field.onChange(value);
//     setValue("department", "");
//     setValue("requestedBy", "");
//   };

//   const handleDepartmentChange = (field, value) => {
//     field.onChange(value);
//     setValue("requestedBy", "");
//   };

//   const detailItems = selectedPrintout
//     ? [
//         ["Taken By", getUserName(selectedPrintout.takenBy)],
//         ["Taken At", formatDateTime(selectedPrintout.takenAt)],
//         ["Unit", getUnitName(selectedPrintout.unit)],
//         ["Client", getCompanyName(selectedPrintout.client)],
//         ["Requested By", getUserName(selectedPrintout.requestedBy)],
//         ["Department", getDepartmentName(selectedPrintout.department)],
//         ["Printout Count", selectedPrintout.printoutCount],
//       ]
//     : [];

//   const columns = [
//     { field: "srNo", headerName: "Sr. No.", width: 110 },
//     { field: "takenByName", headerName: "Taken By" },
//     { field: "takenAtFormatted", headerName: "Taken At" },
//     { field: "unitName", headerName: "Unit" },
//     { field: "clientName", headerName: "Client" },
//     { field: "requestedByName", headerName: "Requested By" },
//     { field: "departmentName", headerName: "Department" },
//     { field: "printoutCount", headerName: "Printout Count" },
//     {
//       field: "actions",
//       headerName: "Action",
//       pinned: "right",
//       cellRenderer: ({ data }) => (
//         <div className="flex items-center gap-2">
//           <div
//             role="button"
//             onClick={() => openViewModal(data)}
//             className="p-2 rounded-full hover:bg-borderGray cursor-pointer"
//           >
//             <MdOutlineRemoveRedEye />
//           </div>
//           <ThreeDotMenu
//             menuItems={[{ label: "Edit", onClick: () => openEditModal(data) }]}
//           />
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="p-4">
//       <PageFrame>
//         <AgTable
//           data={tableRows}
//           columns={columns}
//           search
//           tableTitle="Manage Printout"
//           tableHeight={500}
//           //hideFilter
//           paginationPageSize={10}
//         />
//         {isPrintoutsLoading ? (
//           <div className="flex justify-center p-4">
//             <CircularProgress size={24} />
//           </div>
//         ) : null}
//       </PageFrame>

//       <MuiModal
//         open={isViewModalOpen}
//         onClose={closeViewModal}
//         title="Printout Details"
//       >
//         <div className="flex flex-col gap-3">
//           {detailItems.map(([title, detail]) => (
//             <DetalisFormatted key={title} title={title} detail={detail} />
//           ))}
//         </div>
//       </MuiModal>

//       <MuiModal
//         open={isEditModalOpen}
//         onClose={closeEditModal}
//         title="Edit Printout"
//       >
//         <form onSubmit={handleSubmit(updatePrintout)}>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Controller
//               name="takenBy"
//               control={control}
//               rules={{ required: "Taken by is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   size="small"
//                   label="Taken By"
//                   error={!!errors.takenBy}
//                   helperText={errors.takenBy?.message}
//                   fullWidth
//                 >
//                   <MenuItem value="">Select Taken By</MenuItem>
//                   {isEmployeesLoading ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={20} />
//                     </MenuItem>
//                   ) : (
//                     employees.map((employee) => (
//                       <MenuItem key={employee._id} value={employee._id}>
//                         {getUserName(employee)}
//                       </MenuItem>
//                     ))
//                   )}
//                 </TextField>
//               )}
//             />

//             <Controller
//               name="unit"
//               control={control}
//               rules={{ required: "Unit is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   size="small"
//                   label="Select Unit"
//                   error={!!errors.unit}
//                   helperText={errors.unit?.message}
//                   fullWidth
//                 >
//                   <MenuItem value="">Select Unit</MenuItem>
//                   {isUnitsPending ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={20} />
//                     </MenuItem>
//                   ) : (
//                     unitsData.map((unit) => (
//                       <MenuItem key={unit._id} value={unit._id}>
//                         {getUnitName(unit)}
//                       </MenuItem>
//                     ))
//                   )}
//                 </TextField>
//               )}
//             />

//             <Controller
//               name="client"
//               control={control}
//               rules={{ required: "Company is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   size="small"
//                   label="Select Company"
//                   error={!!errors.client}
//                   helperText={errors.client?.message}
//                   fullWidth
//                   onChange={(event) => handleClientChange(field, event.target.value)}
//                 >
//                   <MenuItem value="">Select Company</MenuItem>
//                   <MenuItem value={companyId}>BIZNest</MenuItem>
//                   {isClientsLoading ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={20} />
//                     </MenuItem>
//                   ) : (
//                     filteredClientCompanies.map((client) => (
//                       <MenuItem key={client._id} value={client._id}>
//                         {client.clientName}
//                       </MenuItem>
//                     ))
//                   )}
//                 </TextField>
//               )}
//             />

//             <Controller
//               name="department"
//               control={control}
//               rules={{
//                 validate: (value) =>
//                   !isBiznestClient || value ? true : "Department is required",
//               }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   size="small"
//                   label="Select Department"
//                   disabled={!isBiznestClient}
//                   error={!!errors.department}
//                   helperText={errors.department?.message}
//                   fullWidth
//                   onChange={(event) =>
//                     handleDepartmentChange(field, event.target.value)
//                   }
//                 >
//                   <MenuItem value="">Select Department</MenuItem>
//                   {uniqueDepartments.map((department) => (
//                     <MenuItem key={department._id} value={department._id}>
//                       {department.name}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               )}
//             />

//             <Controller
//               name="requestedBy"
//               control={control}
//               rules={{ required: "Person is required" }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   select
//                   size="small"
//                   label="Select Person"
//                   disabled={
//                     !selectedClient || (isBiznestClient && !selectedDepartment)
//                   }
//                   error={!!errors.requestedBy}
//                   helperText={errors.requestedBy?.message}
//                   fullWidth
//                 >
//                   <MenuItem value="">Select Person</MenuItem>
//                   {isBiznestClient && isEmployeesLoading ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={20} />
//                     </MenuItem>
//                   ) : null}
//                   {isBiznestClient
//                     ? departmentEmployees.map((employee) => (
//                         <MenuItem key={employee._id} value={employee._id}>
//                           {getUserName(employee)}
//                         </MenuItem>
//                       ))
//                     : null}
//                   {!isBiznestClient && isClientMembersLoading ? (
//                     <MenuItem disabled>
//                       <CircularProgress size={20} />
//                     </MenuItem>
//                   ) : null}
//                   {!isBiznestClient
//                     ? clientMembers.map((member) => (
//                         <MenuItem key={member._id} value={member._id}>
//                           {member.employeeName}
//                         </MenuItem>
//                       ))
//                     : null}
//                 </TextField>
//               )}
//             />

//             <Controller
//               name="printoutCount"
//               control={control}
//               rules={{
//                 required: "Printout count is required",
//                 min: { value: 1, message: "Printout count must be at least 1" },
//                 validate: (value) =>
//                   Number.isInteger(Number(value)) ||
//                   "Printout count must be a whole number",
//               }}
//               render={({ field }) => (
//                 <TextField
//                   {...field}
//                   size="small"
//                   type="number"
//                   label="Printout Count"
//                   inputProps={{ min: 1, step: 1 }}
//                   error={!!errors.printoutCount}
//                   helperText={errors.printoutCount?.message}
//                   fullWidth
//                 />
//               )}
//             />

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <Controller
//                 name="dateOfPrintout"
//                 control={control}
//                 rules={{ required: "Date is required" }}
//                 render={({ field }) => (
//                   <DatePicker
//                     {...field}
//                     label="Date"
//                     format="DD-MM-YYYY"
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true,
//                         error: !!errors.dateOfPrintout,
//                         helperText: errors.dateOfPrintout?.message,
//                       },
//                     }}
//                   />
//                 )}
//               />
//             </LocalizationProvider>

//             <LocalizationProvider dateAdapter={AdapterDayjs}>
//               <Controller
//                 name="timeOfPrintout"
//                 control={control}
//                 rules={{ required: "Time is required" }}
//                 render={({ field }) => (
//                   <TimePicker
//                     {...field}
//                     label="Time"
//                     slotProps={{
//                       textField: {
//                         size: "small",
//                         fullWidth: true,
//                         error: !!errors.timeOfPrintout,
//                         helperText: errors.timeOfPrintout?.message,
//                       },
//                     }}
//                   />
//                 )}
//               />
//             </LocalizationProvider>
//           </div>

//           <div className="flex items-center justify-center gap-4 mt-6">
//             <PrimaryButton
//               type="submit"
//               title="Save Changes"
//               isLoading={isUpdatingPrintout}
//               disabled={isUpdatingPrintout}
//             />
//             <SecondaryButton handleSubmit={closeEditModal} title="Cancel" />
//           </div>
//         </form>
//       </MuiModal>
//     </div>
//   );
// };

// export default ManagePrintout;


// const ManagePrintout = () => {
//   return (
//     <div className="p-4">
//       <h1 className="text-2xl font-semibold">Manage Printout</h1>
//       <p className="mt-2 text-gray-600">Manage Printout Page</p>
//     </div>
//   );
// };

// export default ManagePrintout;