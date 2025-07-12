import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { TextField, Select, MenuItem, CircularProgress } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";
import { State, City } from "country-state-city";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../../components/Pages/PageFrame";
import {
  isAlphanumeric,
  isValidEmail,
  isValidPhoneNumber,
  noOnlyWhitespace,
} from "../../../utils/validators";
import dayjs from "dayjs";

const AddClient = () => {
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
      lastName: "",
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
      clientCompany: "",
      sector:"",
      hoState : "",
      hoCity : "",
      visitorType: "",
      visitorCompany: "",
      paymentAmount: "",
      paymentStatus: "",
    },
  });

  const selectedCompany = watch("clientCompany");
  const selectedIdType = watch("idProof.idType");
  const visitorType = watch("visitorType");

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);
  useEffect(() => {
    setValue("checkIn", dayjs(new Date()));
  }, []);

  const handleStateSelect = (stateCode) => {
    const city = City.getCitiesOfState("IN", stateCode);
    setCities(city);
  };
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
    const isBiznest = data.clientCompany === "6799f0cd6a01edbe1bc3fcea";

    const payload = {
      ...data,
      visitorFlag: "Client", // Identify this as a client visitor
      sector: data.sector,
      hoState: data.hoState,
      hoCity: data.hoCity,
      department: isBiznest
        ? data.department === "na"
          ? null
          : data.department
        : null,
      toMeet: isBiznest
        ? data.department === "na"
          ? null
          : data.toMeet
        : data.toMeet || null,
      checkIn: data.checkIn?.toISOString() || null,
      checkOut: data.checkOut?.toISOString() || null,
      dateOfVisit: data.dateOfVisit?.toISOString() || null,
    };

    addVisitor(payload);
  };

  const handleReset = () => {
    reset();
  };

  return (
    <div className=" p-4">
      <PageFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Section: Basic Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Client Details
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <div hidden>
                  <Controller
                    name="visitorType"
                    control={control}
                    rules={{ required: "Visitor type is required" }}
                    disabled
                    render={({ field }) => (
                      <TextField {...field} size="small" select label="Meeting">
                        <MenuItem value="Meeting" disabled>
                          Meeting
                        </MenuItem>
                      </TextField>
                    )}
                  />
                </div>
                <div className="flex gap-4 items-center">
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
                </div>

                <div className="flex gap-4 items-center">
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
                        type="number"
                        label="Phone"
                        error={!!errors.phoneNumber}
                        helperText={errors.phoneNumber?.message}
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
                </div>
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: "Email is required",
                    validate: {
                      isValidEmail,
                      noOnlyWhitespace,
                    },
                  }}
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
                      select
                    >
                      <MenuItem value="" disabled>
                        Select a Purpose of Visit
                      </MenuItem>
                      <MenuItem value="Meeting Room Booking">
                        Meeting Room Booking
                      </MenuItem>
                    </TextField>
                  )}
                />
              </div>

              <div>
                <div className="py-4 border-b-default border-borderGray">
                  <span className="text-subtitle font-pmedium">Timings</span>
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 p-4 ">
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
                              fullWidth: true,
                              error: !!errors.checkIn,
                              helperText: errors.checkIn?.message,
                            },
                          }}
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
                      render={({ field }) => (
                        <TimePicker
                          {...field}
                          label={"Check-Out Time"}
                          slotProps={{
                            textField: { size: "small", fullWidth: true },
                          }}
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

            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Company Details
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <Controller
                  name="clientCompany"
                  control={control}
                  rules={{
                    required: "Client Company is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Client Company"
                      fullWidth
                      error={!!errors.clientCompany}
                      helperText={errors.clientCompany?.message}
                    />
                  )}
                />

                <Controller
                  name="sector"
                  control={control}
                  rules={{
                    required: "Sector is required",
                    validate: {
                      noOnlyWhitespace,
                      isAlphanumeric,
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Sector"
                      fullWidth
                      error={!!errors.sector}
                      helperText={errors.sector?.message}
                    />
                  )}
                />

                <Controller
                  name="hoState"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      select
                      label="State"
                      onChange={(e) => {
                        field.onChange(e);
                        handleStateSelect(e.target.value);
                      }}
                      fullWidth
                    >
                      <MenuItem value="">Select a State</MenuItem>
                      {states.map((item) => (
                        <MenuItem value={item.isoCode} key={item.isoCode}>
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
                <Controller
                  name="hoCity"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      select
                      label="City"
                      fullWidth
                    >
                      <MenuItem value="">Select a City</MenuItem>
                      {cities.map((item) => (
                        <MenuItem
                          value={item.name}
                          key={`${item.name}-${item.stateCode}-${item.latitude}`}
                        >
                          {item.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Verification</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 p-4 ">
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
                      <MenuItem value="drivingLicense">
                        Driving License
                      </MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="idProof.idNumber"
                  control={control}
                  rules={{
                    required: "ID Number is required",
                    validate: (value) => {
                      if (selectedIdType === "aadhar") {
                        const regex = /^\d{4}-\d{4}-\d{4}$/;
                        if (!regex.test(value))
                          return "Aadhar must be in 1234-5678-9012 format";
                      }
                      if (selectedIdType === "pan") {
                        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
                        if (!regex.test(value))
                          return "PAN must be in format: ABCDE1234F";
                      }
                      if (selectedIdType === "drivingLicense") {
                        const regex = /^[A-Z]{2}[0-9]{2}\s?[0-9]{11}$/;
                        if (!regex.test(value))
                          return "DL must be like MH12 12345678901";
                      }
                      return true;
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="ID Number"
                      fullWidth
                      error={!!errors.idProof?.idNumber}
                      helperText={errors.idProof?.idNumber?.message}
                      onChange={(e) => {
                        let value = e.target.value;

                        if (selectedIdType === "aadhar") {
                          // Remove non-digit characters first
                          value = value.replace(/\D/g, "").slice(0, 12);

                          // Auto-insert hyphens after every 4 digits
                          const parts = value.match(/.{1,4}/g);
                          if (parts) value = parts.join("-");
                        }

                        field.onChange(value);
                      }}
                      value={field.value}
                    />
                  )}
                />
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

export default AddClient;
