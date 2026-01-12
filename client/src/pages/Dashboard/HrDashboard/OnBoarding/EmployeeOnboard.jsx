import React, { useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";

const EmployeeOnboard = () => {
  const axios = useAxiosPrivate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      empId: "",
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dateOfBirth: null,
      phone: "",
      email: "",
      startDate: null,
      workLocation: "",
      employeeType: "",
      departments: "",
      role: "",
      reportsTo: "",
      jobTitle: "",
      jobDescription: "",
      shift: "",
      workSchedulePolicy: "",
      attendanceSource: "web",
      leavePolicy: "",
      holidayPolicy: "",
      aadharId: "",
      pan: "",
      pfUan: "",
      pfAcNo: "",
      esiAccountNo: "",
      employerPf: "",
      includeInPayroll: "",
      payrollBatch: "",
      professionTaxExemption: "",
      includePF: "",
      pfContributionRate: "",
      employeePF: "",
      includeEsi: "",
      esiContribution: "",
      hraType: "",
      tdsCalculationBasedOn: "",
      incomeTaxRegime: "",
      addressLine1: "",
      addressLine2: "",
      country: "",
      state: "",
      city: "",
      pinCode: "",
      bankIfsc: "",
      bankName: "",
      branchName: "",
      nameOnAccount: "",
      accountNumber: "",
      fatherName: "",
      motherName: "",
      maritalStatus: "",
    },
  });

  const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y"].includes(normalized)) return true;
    if (["false", "no", "n"].includes(normalized)) return false;
    return undefined;
  };

  const normalizePolicyValue = (value) =>
    typeof value === "string" ? value : "";

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/api/users/create-user", payload);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Employee onboarded successfully");
      reset();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to onboard employee"
      );
    },
  });

  const onSubmit = (data) => {
    const payload = {
      empId: data.empId?.trim(),
      firstName: data.firstName?.trim(),
      middleName: data.middleName?.trim(),
      lastName: data.lastName?.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth,
      phone: data.phone?.trim(),
      email: data.email?.trim(),
      role: data.role,
      departments: data.departments ? [data.departments] : [],
      employeeType: data.employeeType ? { name: data.employeeType } : undefined,
      designation: data.jobTitle?.trim(),
      jobTitle: data.jobTitle?.trim(),
      jobDescription: data.jobDescription?.trim(),
      startDate: data.startDate,
      workLocation: data.workLocation,
      reportsTo: data.reportsTo || undefined,
      shift: data.shift,
      policies: {
        workSchedulePolicy: data.shift,
        attendanceSource: data.attendanceSource,
        leavePolicy: normalizePolicyValue(data.leavePolicy),
        holidayPolicy: normalizePolicyValue(data.holidayPolicy),
      },
      attendanceSource: data.attendanceSource,
      homeAddress: {
        addressLine1: data.addressLine1?.trim(),
        addressLine2: data.addressLine2?.trim(),
        country: data.country?.trim(),
        state: data.state?.trim(),
        city: data.city?.trim(),
        pinCode: data.pinCode?.trim(),
      },
      bankInformation: {
        bankIFSC: data.bankIfsc?.trim(),
        bankName: data.bankName?.trim(),
        branchName: data.branchName?.trim(),
        nameOnAccount: data.nameOnAccount?.trim(),
        accountNumber: data.accountNumber?.trim(),
      },
      panAadhaarDetails: {
        aadhaarId: data.aadharId?.trim(),
        pan: data.pan?.trim(),
        pfAccountNumber: data.pfAcNo?.trim(),
        pfUAN: data.pfUan?.trim(),
        esiAccountNumber: data.esiAccountNo?.trim(),
      },
      payrollInformation: {
        includeInPayroll: normalizeBoolean(data.includeInPayroll),
        payrollBatch: data.payrollBatch?.trim(),
        professionTaxExemption: normalizeBoolean(data.professionTaxExemption),
        includePF: normalizeBoolean(data.includePF),
        pfContributionRate: data.pfContributionRate?.trim(),
        employeePF: data.employeePF?.trim(),
        employerPf: data.employerPf?.trim(),
        includeEsi: normalizeBoolean(data.includeEsi),
        esiContribution: data.esiContribution?.trim(),
        hraType: data.hraType?.trim(),
        tdsCalculationBasedOn: data.tdsCalculationBasedOn?.trim(),
        incomeTaxRegime: data.incomeTaxRegime?.trim(),
      },
      familyInformation: {
        fatherName: data.fatherName?.trim(),
        motherName: data.motherName?.trim(),
        maritalStatus: data.maritalStatus?.trim(),
      },
    };

    createUser(payload);
  };

  const handleReset = () => {
    reset();
  };

  const { data: unitsData = [] } = useQuery({
    queryKey: ["unitsData"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-units");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { data: departmentsData = [] } = useQuery({
    queryKey: ["departmentsData"],
    queryFn: async () => {
      const response = await axios.get("/api/departments/get-departments");

      return response.data || [];
    },
  });

  const { data: rolesData = [] } = useQuery({
    queryKey: ["rolesData"],
    queryFn: async () => {
      const response = await axios.get("/api/roles/get-roles");
      return response.data || [];
    },
  });

  const workLocations = useMemo(() => {
    const unitSet = new Set();
    return unitsData
      .map((unit) => unit.unitNo)
      .filter((unitNo) => {
        if (!unitNo || unitSet.has(unitNo)) {
          return false;
        }
        unitSet.add(unitNo);
        return true;
      });
  }, [unitsData]);

  const adminRoles = useMemo(
    () =>
      rolesData.filter((role) =>
        role.roleTitle?.toLowerCase().endsWith("admin")
      ),
    [rolesData]
  );

  return (
    <PageFrame>
      <div className="h-[65vh] overflow-y-auto">
        <div>
          <span className="text-primary font-pmedium text-title uppercase">
            employee onboarding
          </span>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="">
          <div className="grid grid-cols-2 sm:grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              {/* Section: Basic Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Basic Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4 ">
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4  ">
                  <Controller
                    name="firstName"
                    control={control}
                    rules={{ required: "First Name is Required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="First Name"
                        fullWidth
                        helperText={errors?.firstName?.message}
                        error={!!errors.firstName}
                      />
                    )}
                  />

                  <Controller
                    name="middleName"
                    control={control}
                    // rules={{ required: "Middle Name is Required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Middle Name"
                        fullWidth
                        helperText={errors?.middleName?.message}
                        error={!!errors.middleName}
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
                        label="Last Name"
                        fullWidth
                        helperText={errors?.lastName?.message}
                        error={!!errors.lastName}
                      />
                    )}
                  />
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                  <Controller
                    name="gender"
                    control={control}
                    rules={{ required: "Gender is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Gender"
                        select
                        fullWidth
                        helperText={errors?.gender?.message}
                        error={!!errors.gender}
                      >
                        <MenuItem value="" disabled>
                          Select a Gender
                        </MenuItem>
                        <MenuItem value="male">Male</MenuItem>
                        <MenuItem value="female">Female</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="dateOfBirth"
                    control={control}
                    rules={{ required: "Date of Birth is required" }}
                    render={({ field }) => (
                      <DesktopDatePicker
                        inputFormat=""
                        slotProps={{ textField: { size: "small" } }}
                        label="Date of Birth"
                        {...field}
                        renderInput={(params) => (
                          <TextField fullWidth {...params} />
                        )}
                      />
                    )}
                  />
                </div>

                <Controller
                  name="email"
                  control={control}
                  rules={{ required: "Email is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Email"
                      fullWidth
                      helperText={errors?.email?.message}
                      error={!!errors.email}
                    />
                  )}
                />
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                  <Controller
                    name="phone"
                    control={control}
                    rules={{
                      required: "Mobile number is required",
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: "Enter a valid 10-digit number",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Mobile Phone"
                        fullWidth
                        helperText={errors?.phone?.message}
                        error={!!errors.phone}
                      />
                    )}
                  />
                  <Controller
                    name="empId"
                    control={control}
                    rules={{ required: "Employee ID is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Employee ID"
                        fullWidth
                        helperText={errors?.empId?.message}
                        error={!!errors.empId}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Section: Home Address Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Home Address Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="addressLine1"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address Line 1"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="addressLine2"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Address Line 2"
                      fullWidth
                    />
                  )}
                />
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 ">
                  <Controller
                    name="country"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Country"
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="state"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="State"
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="city"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="City"
                        fullWidth
                      />
                    )}
                  />

                  <Controller
                    name="pinCode"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Pin Code"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Section: Job Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Job Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                {/* Start Date - Date Picker */}
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-3 gap-4 ">
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: "Start Date is required" }}
                    render={({ field }) => (
                      <DesktopDatePicker
                        inputFormat="DD/MM/YYYY"
                        label="Start Date"
                        {...field}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors?.startDate?.message,
                          },
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="workLocation"
                    control={control}
                    rules={{ required: "Work Location is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Work Location"
                        fullWidth
                        select
                        helperText={errors?.workLocation?.message}
                        error={!!errors.workLocation}
                      >
                        <MenuItem value="" disabled>
                          Select Work Location
                        </MenuItem>
                        {workLocations.map((unitNo) => (
                          <MenuItem key={unitNo} value={unitNo}>
                            {unitNo}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="employeeType"
                    control={control}
                    rules={{ required: "Employee Type is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Employee Type"
                        fullWidth
                        select
                        helperText={errors?.employeeType?.message}
                        error={!!errors.employeeType}
                      >
                        <MenuItem value="" disabled>
                          Select Employee Type
                        </MenuItem>
                        <MenuItem value="Full-time">Full-time</MenuItem>
                        <MenuItem value="Part-time">Part-time</MenuItem>
                      </TextField>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: "Department is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Department"
                        fullWidth
                        select
                        helperText={errors?.departments?.message}
                        error={!!errors.departments}
                      >
                        <MenuItem value="" disabled>
                          Select Department
                        </MenuItem>
                        {departmentsData.map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            {department.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="role"
                    control={control}
                    rules={{ required: "Role is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Role"
                        fullWidth
                        select
                        helperText={errors?.role?.message}
                        error={!!errors.role}
                      >
                        <MenuItem value="" disabled>
                          Select Role
                        </MenuItem>
                        {rolesData.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.roleTitle}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="reportsTo"
                    control={control}
                    rules={{ required: "Reporting Manager is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Reports To"
                        fullWidth
                        select
                        helperText={errors?.reportsTo?.message}
                        error={!!errors.reportsTo}
                      >
                        <MenuItem value="" disabled>
                          Select Reporting Manager
                        </MenuItem>
                        {adminRoles.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            {role.roleTitle}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 ">
                  <Controller
                    name="jobTitle"
                    control={control}
                    rules={{ required: "Job Title is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Job Title"
                        fullWidth
                        helperText={errors?.jobTitle?.message}
                        error={!!errors.jobTitle}
                      />
                    )}
                  />

                  <Controller
                    name="jobDescription"
                    control={control}
                    rules={{ required: "Job Description is required" }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Job Description"
                        fullWidth
                        helperText={errors?.jobDescription?.message}
                        error={!!errors.jobDescription}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div>
              {/* Section: Policies */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">Policies</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Controller
                    name="workSchedulePolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Shift"
                        select
                        fullWidth
                        helperText={errors?.workSchedulePolicy?.message}
                        error={!!errors.workSchedulePolicy}
                      >
                        <MenuItem value="" disabled>
                          Select Shift
                        </MenuItem>
                        <MenuItem value="General Shift">General Shift</MenuItem>
                        <MenuItem value="Night Shift">Night Shift</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="attendanceSource"
                    control={control}
                    defaultValue="web"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        select
                        label="Attendance Source"
                        fullWidth
                      >
                        <MenuItem value="web">Web</MenuItem>
                        <MenuItem value="mobile">Mobile</MenuItem>
                      </TextField>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* <Controller
                    name="workSchedulePolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Work Schedule Policy"
                        fullWidth
                      />
                    )}
                  /> */}

                  <Controller
                    name="leavePolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <UploadFileInput
                        label="leave Policy"
                        onChange={field.onChange}
                        value={field.value}
                        allowedExtensions={["pdf"]}
                        previewType="auto"
                      />
                    )}
                  />
                  <Controller
                    name="holidayPolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <UploadFileInput
                        label="Holiday Policy"
                        onChange={field.onChange}
                        value={field.value}
                        allowedExtensions={["pdf"]}
                        previewType="auto"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              {/* Section: Payroll Information I */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Payroll Information I
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="includeInPayroll"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Include In Payroll"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="payrollBatch"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Payroll Batch"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="professionTaxExemption"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Profession Tax Exemption"
                      fullWidth
                    />
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Controller
                    name="includePF"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Include PF"
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="pfContributionRate"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="PF Contribution Rate"
                        fullWidth
                      />
                    )}
                  />
                </div>
                <Controller
                  name="employeePF"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Employee PF"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>

            {/* Section: Payroll Information II*/}
            <div>
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Payroll Information II
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                  <Controller
                    name="employerPf"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Employer PF"
                        select
                        fullWidth
                      >
                        <MenuItem value="" disabled>
                          Select Employer PF
                        </MenuItem>
                        <MenuItem value="12%">12%</MenuItem>
                        <MenuItem value="13%">13%</MenuItem>
                        <MenuItem value="15%">15%</MenuItem>
                      </TextField>
                    )}
                  />
                  <Controller
                    name="includeEsi"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Include ESI"
                        select
                        fullWidth
                      >
                        <MenuItem value="" disabled>
                          Select Include ESI
                        </MenuItem>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </TextField>
                    )}
                  />
                </div>
                <Controller
                  name="esiContribution"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="ESI Contribution"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select ESI Contribution
                      </MenuItem>
                      <MenuItem value="restrict-21000">
                        Restrict Contribution to 21,000 of ESI Gross
                      </MenuItem>
                      <MenuItem value="no-restriction">No Restriction</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="hraType"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="HRA"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select HRA
                      </MenuItem>
                      <MenuItem value="metro-50">Metropolitan (50%)</MenuItem>
                      <MenuItem value="non-metro-40">
                        Non-Metropolitan (40%)
                      </MenuItem>
                      <MenuItem value="custom">Custom</MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="tdsCalculationBasedOn"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="TDS Calculation Based on"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select TDS Calculation
                      </MenuItem>
                      <MenuItem value="tax-slabs">
                        Tax Slabs (Salaried Employee)
                      </MenuItem>
                      <MenuItem value="tax-percentage">
                        Tax Percentage (Consultants)
                      </MenuItem>
                    </TextField>
                  )}
                />
                <Controller
                  name="incomeTaxRegime"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Income Tax Regime"
                      select
                      fullWidth
                    >
                      <MenuItem value="" disabled>
                        Select Income Tax Regime
                      </MenuItem>
                      <MenuItem value="old">Old Tax Regime</MenuItem>
                      <MenuItem value="new">New Tax Regime</MenuItem>
                    </TextField>
                  )}
                />
              </div>
            </div>
            <div>
              {/* Section: Bank Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Bank Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="bankIfsc"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Bank IFSC"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="bankName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Bank Name"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="branchName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Branch Name"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="nameOnAccount"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Name On Account"
                      fullWidth
                    />
                  )}
                />
                <Controller
                  name="accountNumber"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="AccountNumber"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
            <div>
              {/* Section: KYC Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">KYC</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="aadharId"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Aadhar ID"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="pan"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField {...field} size="small" label="PAN" fullWidth />
                  )}
                />

                <Controller
                  name="pfUan"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PF UAN"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="pfAcNo"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PF A/c No"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="esiAccountNo"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="ESI A/c No"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>

            <div>
              {/* Section: Family Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Family Information
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="fatherName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Father Name"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="motherName"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Mother Name"
                      fullWidth
                    />
                  )}
                />

                <Controller
                  name="maritalStatus"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Marital Status"
                      fullWidth
                    />
                  )}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-center gap-4">
            {/* <PrimaryButton type="submit" title={"Submit"} /> */}
            <PrimaryButton
              type="submit"
              title={isPending ? "Submitting..." : "Submit"}
            />
            <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
          </div>
        </form>
      </div>
    </PageFrame>
  );
};

export default EmployeeOnboard;
