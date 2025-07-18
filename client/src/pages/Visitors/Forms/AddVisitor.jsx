import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, MenuItem, CircularProgress } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import {
  DatePicker,
  LocalizationProvider,
  TimePicker,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import PageFrame from "../../../components/Pages/PageFrame";
import {
  isAlphanumeric,
  isValidPhoneNumber,
  noOnlyWhitespace,
} from "../../../utils/validators";

const AddVisitor = () => {
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
      firstName: "",
      lastName:"",
      email: "",
      gender: "",
      address: "",
      phoneNumber: "",
      purposeOfVisit: "",
      idProof: { idType: "", idNumber: "" },
      dateOfVisit: null,
      checkIn: null,
      checkOut: null,
      toMeet: "",
      department: "",
      clientToMeet: "",
      toMeetCompany: "",
      visitorType: "",
      visitorCompany: "",
      paymentAmount: "",
      paymentStatus: "",
      scheduledDate: null,
    },
  });

  const selectedCompany = watch("toMeetCompany");
  const selectedIdType = watch("idProof.idType");
  const visitorType = watch("visitorType");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: clientCompanies = [], clientCompaniesIsLoading } = useQuery({
    queryKey: ["clientCompanies"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { data: clientMembers = [], isLoading: clientMembersIsLoading } =
    useQuery({
      queryKey: ["clientMembers", selectedCompany],
      queryFn: async () => {
        try {
          const response = await axios.get(
            `/api/sales/co-working-client-members?clientId=${selectedCompany}`
          );
          return response.data;
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
      enabled: !!selectedCompany, // <-- Runs only if selectedCompany has a truthy value
    });

  //---------------------------------------Data processing----------------------------------------------------//
  const departmentMap = new Map();
  employees.forEach((employee) => {
    employee.departments?.forEach((department) => {
      departmentMap.set(department._id, department);
    });
  });
  const uniqueDepartments = Array.from(departmentMap.values());

  const departmentEmployees = employees.filter((item) =>
    item.departments?.some((dept) => dept._id === selectedDepartment)
  );
  //---------------------------------------Data processing----------------------------------------------------//
  const { mutate: addVisitor, isPending: isMutateVisitor } = useMutation({
    mutationKey: ["addVisitor"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/visitors/add-visitor", {
        ...data,
        department: selectedDepartment === "na" ? null : selectedDepartment,
        toMeet: selectedDepartment === "na" ? null : data.toMeet,
      });
      return response.data;
    },
    onSuccess: (data) => {
      reset();
      toast.custom((t) => (
        <div className="p-4 bg-successGreen rounded shadow text-green-800 flex flex-col gap-4">
          <span className="text-content font-pmedium">
            {data.message || "Visitor Added Successfully"}
          </span>
        </div>
      ));
    },
    onError: (error) => {
      toast.error(error.message || "Error Adding Visitor");
    },
  });
  const onSubmit = (data) => {
    const isBiznest = data.toMeetCompany === "6799f0cd6a01edbe1bc3fcea";

    const payload = {
      ...data,
      visitorFlag: "Visitor",
      department: isBiznest
        ? data.department === "na"
          ? null
          : data.department
        : null,
      toMeet: isBiznest
        ? data.department === "na"
          ? null
          : data.toMeet
        : data.toMeet || null, // allow client member ID
    };

    addVisitor(payload);
  };

  const handleReset = () => {
    reset();
  };

  useEffect(() => {
    setValue("checkIn", dayjs(new Date()));
  }, []);

  return (
    <div className=" p-4">
      <PageFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-4">
            <div>
              {/* Section: Basic Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Visitor Details
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-4 gap-4 p-4 ">
                <Controller
                  name="firstName"
                  control={control}
                  rules={{
                    required: "First Name is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      error={!!errors.firstName}
                      helperText={errors.firstName?.message}
                      label="First Name"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="lastName"
                  control={control}
                  rules={{
                    required: "Last Name is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      error={!!errors.lastName}
                      helperText={errors.lastName?.message}
                      label="Last Name"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="phoneNumber"
                  control={control}
                  rules={{
                    required: "Phone Number is required",
                    validate: {
                      isValidPhoneNumber,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Phone"
                      type="number"
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber?.message}
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="email"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      error={!!errors.email}
                      helperText={errors.email?.message}
                      label="Email"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="gender"
                  control={control}
                  rules={{ required: "Gender is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      error={!!errors.gender}
                      select
                      helperText={errors.gender?.message}
                      size="small"
                      label="Gender"
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select Gender
                      </MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </TextField>
                  )}
                />

                <Controller
                  name="visitorType"
                  control={control}
                  rules={{ required: "Visitor type is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      select
                      label="Select Visitor Type"
                      error={!!errors.visitorType}
                      helperText={errors.visitorType?.message}
                    >
                      <MenuItem value="" disabled>
                        Select Visitor Type
                      </MenuItem>
                      <MenuItem value="Walk In">Walk In</MenuItem>
                      <MenuItem value="Scheduled">Scheduled</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="visitorCompany"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      fullWidth
                      label={"Visitor company"}
                    />
                  )}
                />

                <Controller
                  name="purposeOfVisit"
                  control={control}
                  rules={{
                    required: "Purpose is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Purpose of visit"
                      error={!!errors.purposeOfVisit}
                      helperText={errors.purposeOfVisit?.message}
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">To Meet</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 p-4 ">
                <Controller
                  name="toMeetCompany"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label={"Select Company"}
                      fullWidth
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedDepartment("");
                      }}
                      select
                    >
                      <MenuItem value="" disabled>
                        Select Company
                      </MenuItem>
                      <MenuItem value="6799f0cd6a01edbe1bc3fcea">
                        BIZNest
                      </MenuItem>
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
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (selectedCompany === "6799f0cd6a01edbe1bc3fcea") {
                        return value ? true : "Department is required";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label={"Select Department"}
                      fullWidth
                      disabled={selectedCompany !== "6799f0cd6a01edbe1bc3fcea"}
                      onChange={(e) => {
                        field.onChange(e);
                        setSelectedDepartment(e.target.value);
                      }}
                      select
                      error={!!errors.department}
                      helperText={errors.department?.message}
                    >
                      <MenuItem value="">Select Department</MenuItem>
                      {visitorType === "Meeting" && (
                        <MenuItem value="na">N/A</MenuItem>
                      )}
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
                  control={control}
                  render={({ field }) => {
                    const isBiznest =
                      selectedCompany === "6799f0cd6a01edbe1bc3fcea";
                    const showClientMembers = selectedCompany && !isBiznest;
                    const showBiznestEmployees =
                      isBiznest &&
                      selectedDepartment &&
                      selectedDepartment !== "na";

                    return (
                      <TextField
                        {...field}
                        select
                        size="small"
                        fullWidth
                        disabled={
                          (!showClientMembers && !showBiznestEmployees) ||
                          (isBiznest && selectedDepartment === "na")
                        }
                        label={"Select Person"}
                      >
                        <MenuItem value="">Select the person to meet</MenuItem>

                        {/* Show client members if a non-BIZNest company is selected */}
                        {showClientMembers && !clientMembersIsLoading ? (
                          clientMembers.map((member) => (
                            <MenuItem key={member._id} value={member._id}>
                              {member.employeeName}
                            </MenuItem>
                          ))
                        ) : showClientMembers && clientMembersIsLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        ) : null}

                        {/* Show BIZNest employees from selected department */}
                        {showBiznestEmployees && !isLoading ? (
                          departmentEmployees.map((emp) => (
                            <MenuItem key={emp._id} value={emp._id}>
                              {emp.firstName} {emp.lastName}
                            </MenuItem>
                          ))
                        ) : showBiznestEmployees && isLoading ? (
                          <MenuItem disabled>
                            <CircularProgress size={20} />
                          </MenuItem>
                        ) : null}
                      </TextField>
                    );
                  }}
                />
              </div>

              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">
                    Date & Time
                  </span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 p-4 ">
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="scheduledDate"
                      control={control}
                      render={({ field }) => {
                        const visitType =
                          visitorType !== "Scheduled"
                            ? dayjs(new Date())
                            : field.value;
                        return (
                          <DatePicker
                            {...field}
                            format="DD-MM-YYYY"
                            label={"Scheduled Date"}
                            disablePast
                            disabled={visitorType !== "Scheduled"}
                            value={visitType}
                            onChange={(e) => field.onChange(e)}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                size: "small",
                                error: !!errors.scheduledDate,
                                helperText: errors.scheduledDate?.message,
                              },
                            }}
                          />
                        );
                      }}
                    />
                  </LocalizationProvider>

                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="checkIn"
                      control={control}
                      rules={{ required: "Check-In time is required" }}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          label={"Check-In Time"}
                          slotProps={{
                            textField: {
                              size: "small",
                              error: !!errors.checkIn,
                              helperText: errors.checkIn?.message,
                            },
                          }}
                          render={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Controller
                      name="checkOut"
                      control={control}
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          label={"Check-Out Time"}
                          slotProps={{
                            textField: {
                              size: "small",
                              error: !!errors.checkOut,
                              helperText: errors.checkOut?.message,
                            },
                          }}
                          render={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center gap-4">
            <PrimaryButton
              type="submit"
              title={"Submit"}
              isLoading={isMutateVisitor}
              disabled={isMutateVisitor}
            />
            <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
          </div>
        </form>
      </PageFrame>
    </div>
  );
};

export default AddVisitor;
