import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const BIZNEST_COMPANY_ID = "6799f0cd6a01edbe1bc3fcea";

const getEmployeeDepartments = (employee) =>
  Array.isArray(employee?.departments) ? employee.departments : [];

const getUserFullName = (user) =>
  [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
  user?.name ||
  user?.email ||
  "Current User";

const AddPrintout = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const queryClient = useQueryClient();
  const companyId = auth?.user?.company?._id || BIZNEST_COMPANY_ID;
  const currentUserName = getUserFullName(auth?.user);

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      takenBy: auth?.user?._id || "",
      dateOfPrintout: dayjs(),
      timeOfPrintout: dayjs(),
      location: "",
      unit: "",
      client: "",
      requestedBy: "",
      department: "",
      printoutCount: "",
      remarks: "",
    },
  });

  const selectedClient = watch("client");
  const selectedDepartment = watch("department");
  const selectedLocation = watch("location");
  const isBiznestClient = selectedClient === companyId;

  const [personOptionsResetKey, setPersonOptionsResetKey] = useState(0);

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

  const { mutate: addPrintout, isPending: isAddingPrintout } = useMutation({
    mutationKey: ["addPrintout"],
    mutationFn: async (formData) => {
      const payload = {
        takenBy: auth?.user?._id,
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
        remark: formData.remarks?.trim() || "",
      };

      const response = await axios.post("/api/printout", payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || "Printout added successfully");
      queryClient.invalidateQueries({ queryKey: ["printouts"] });
      reset({
        takenBy: auth?.user?._id || "",
        dateOfPrintout: dayjs(),
        timeOfPrintout: dayjs(),
        location: "",
        unit: "",
        client: "",
        requestedBy: "",
        department: "",
        printoutCount: "",
        remarks: "",
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "An error occurred while adding printout"
      );
    },
  });

  const handleClientChange = (field, value) => {
    field.onChange(value);
    setValue("department", "");
    setValue("requestedBy", "");
    setPersonOptionsResetKey((key) => key + 1);
  };

  const handleDepartmentChange = (field, value) => {
    field.onChange(value);
    setValue("requestedBy", "");
    setPersonOptionsResetKey((key) => key + 1);
  };

  const handleReset = () => {
    reset({
      takenBy: auth?.user?._id || "",
      dateOfPrintout: dayjs(),
      timeOfPrintout: dayjs(),
      location: "",
      unit: "",
      client: "",
      requestedBy: "",
      department: "",
      printoutCount: "",
      remarks: "",
    });
  };

  return (
    <div className="p-4">
      <PageFrame>
        <form onSubmit={handleSubmit(addPrintout)}>
          <div className="py-4 border-b-default border-borderGray">
            <span className="text-subtitle font-pmedium">PRINTOUT DETAILS</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            <Controller
              name="takenBy"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  label="Taken By"
                  value={currentUserName}
                  disabled
                  fullWidth
                />
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
                          {unit.unitNo || unit.unitName}
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
              key={personOptionsResetKey}
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
                          {employee.firstName} {employee.lastName}
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

            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Controller
                name="dateOfPrintout"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Date"
                    disablePast
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

            <Controller
              name="printoutCount"
              control={control}
              rules={{
                required: "Quantity is required",
                min: { value: 1, message: "Quantity must be at least 1" },
                validate: (value) =>
                  Number.isInteger(Number(value)) ||
                  "Quantity must be a whole number",
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  size="small"
                  type="number"
                  label="Add Quantity"
                  inputProps={{ min: 1, step: 1 }}
                  error={!!errors.printoutCount}
                  helperText={errors.printoutCount?.message}
                  fullWidth
                />
              )}
            />

            <div className="md:col-span-3">
              <Controller
                name="remarks"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Comments / Remarks"
                    fullWidth
                    multiline
                    //minRows={1}
                  />
                )}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4">
            <PrimaryButton
              type="submit"
              title="Submit"
              isLoading={isAddingPrintout}
              disabled={isAddingPrintout}
            />
            <SecondaryButton handleSubmit={handleReset} title="Reset" />
          </div>
        </form>
      </PageFrame>
    </div>
  );
};

export default AddPrintout;
