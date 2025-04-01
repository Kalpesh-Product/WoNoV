import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Select, MenuItem, CircularProgress } from "@mui/material";
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

const AddVisitor = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
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
      visitorType: "",
      visitorCompany: "",
    },
  });
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const axios = useAxiosPrivate();
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
  const {mutate : addVisitor , isPending : isMutateVisitor} = useMutation({
    mutationKey: ["addVisitor"],
    mutationFn: async (data) => {
      const response = await axios.post("/api/visitors/add-visitor", data);
      return response.data
    },
    onSuccess:(data)=>{
      toast.success(data.message || "Visitor Added Successfully");
      reset()
    },
    onError:(data)=>{
      toast.error(data.message || "Error Adding Visitor");
    }
  })
  const onSubmit = (data) => {
    addVisitor(data);
  };

  const handleReset = () => {
    reset();
  };

  const [selectedValue, setSelectedValue] = useState("Walk In");

  const handleChange = (event) => {
    setSelectedValue(event.target.value);
  };

  return (
    <div className="h-[65vh] overflow-y-auto p-4">
      <form onSubmit={handleSubmit(onSubmit)} className="">
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {/* Section: Basic Information */}
            <div className="py-4 border-b-default border-borderGray">
              <span className="text-subtitle font-pmedium">
                Visitor Details
              </span>
            </div>
            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
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
                    <MenuItem value="Meeting Booking">Meeting Booking</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="visitorComapany"
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
                name="firstName"
                control={control}
                rules={{ required: "First Name is required" }}
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
                rules={{ required: "Last Name is required" }}
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
                name="address"
                control={control}
                rules={{ required: "Address is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Address"
                    error={!!errors.address}
                    helperText={errors.address?.message}
                    fullWidth
                  />
                )}
              />

              <Controller
                name="phoneNumber"
                control={control}
                rules={{ required: "Phone Number is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Phone"
                    error={!!errors.phoneNumber}
                    helperText={errors.phoneNumber?.message}
                    fullWidth
                  />
                )}
              />
              <Controller
                name="purposeOfVisit"
                control={control}
                rules={{ required: "Purpose is required" }}
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
            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
              <Controller
                name="department"
                control={control}
                rules={{ required: "Department is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label={"Select Department"}
                    fullWidth
                    onChange={(e) => {
                      field.onChange(e);
                      setSelectedDepartment(e.target.value);
                    }}
                    select
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
                control={control}
                rules={{ required: "This field is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    fullWidth
                    label={"Select Person"}
                  >
                    <MenuItem value="">Select the person to meet</MenuItem>
                    {!isLoading ? (
                      departmentEmployees.map((employee) => (
                        <MenuItem
                          key={employee._id}
                          value={employee._id}
                        >{`${employee.firstName} ${employee.lastName}`}</MenuItem>
                      ))
                    ) : (
                      <CircularProgress />
                    )}
                  </TextField>
                )}
              />
              <Controller
                name="idProof.idType"
                control={control}
                rules={{ required: "Id Type is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="ID Type"
                    select
                    error={!!errors.idProof?.idType}
                    helperText={errors.idProof?.idType?.message}
                    fullWidth
                  >
                    <MenuItem value="" disabled>
                      Select Id Type
                    </MenuItem>
                    <MenuItem value="aadhar">Aadhar</MenuItem>
                    <MenuItem value="pan">PAN</MenuItem>
                    <MenuItem value="drivingLicense">Driving License</MenuItem>
                  </TextField>
                )}
              />
              <Controller
                name="idProof.idNumber"
                control={control}
                rules={{ required: "ID Number is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="ID Number"
                    error={!!errors.idProof?.idNumber}
                    helperText={errors.idProof?.idNumber?.message}
                    fullWidth
                  />
                )}
              />
            </div>
          </div>
          <div>
            <div className="py-4 border-b-default border-borderGray">
              <span className="text-subtitle font-pmedium">Timings</span>
            </div>
            <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="dateOfVisit"
                  control={control}
                  rules={{ required: "Date of visit is required" }}
                  render={({ field }) => (
                    <DatePicker
                      {...field}
                      format="DD-MM-YYYY"
                      label={"Date of Visit"}
                      value={field.value || null}
                      onChange={(e) => field.onChange(e)}
                      slotProps={{
                        textField: {
                          fullWidth: true,
                          size: "small",
                          error: !!errors.dateOfVisit,
                          helperText: errors.dateOfVisit?.message,
                        },
                      }}
                    />
                  )}
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
                      slotProps={{ textField: { size: "small" } }}
                      render={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.checkIn}
                          helperText={errors.checkIn?.message}
                        />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Controller
                  name="checkOut"
                  control={control}
                  rules={{ required: "Check-Out time is required" }}
                  render={({ field }) => (
                    <TimePicker
                      {...field}
                      label={"Check-Out Time"}
                      slotProps={{ textField: { size: "small" } }}
                      render={(params) => (
                        <TextField
                          {...params}
                          fullWidth
                          error={!!errors.checkOut}
                          helperText={errors.checkOut?.message}
                        />
                      )}
                    />
                  )}
                />
              </LocalizationProvider>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-center gap-4">
          <PrimaryButton type="submit" title={"Submit"} isLoading={isMutateVisitor} disabled={isMutateVisitor} />
          <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
        </div>
      </form>
    </div>
  );
};

export default AddVisitor;
