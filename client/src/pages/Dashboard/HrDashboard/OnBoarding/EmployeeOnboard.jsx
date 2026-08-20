import React, { useEffect, useMemo } from "react";
import { City, Country, State } from "country-state-city";
import { useForm, Controller } from "react-hook-form";
import { Checkbox, ListItemText, MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useNavigate } from "react-router-dom";

const EmployeeOnboard = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const getPasswordPreviewStorageKey = (employeeId) =>
    employeeId ? `employee-password-preview:${employeeId}` : "";
  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
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
      emergencyPhone: "",
      email: "",
      startDate: null,
      workLocation: "",
      employeeType: "",
      departments: [],
      role: [],
      reportsTo: "",
      jobTitle: "",
      jobDescription: "",
      workSchedulePolicy: "",
      attendanceSource: "",
      leavePolicy: "",
      holidayPolicy: "",
      aadharId: "",
      pan: "",
      pfUan: "",
      pfAcNo: "",
      esiAccountNo: "",
      employerPf: "",
      includeInPayroll: "",
      annualCtc: "",
      allowancesAmount: "0",
      deductionsAmount: "0",
      internshipIsUnpaid: false,
      payrollBatch: "",
      professionTaxExemption: "",
      includePF: "",
      pfContributionRate: "",
      employeePF: "",
      includeEsi: "",
      esiContribution: "",
      hraType: "",
      hraPercentage: "",
      tdsCalculationBasedOn: "",
      taxPercentage: "",
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

    // defaultValues: {
    //   empId: "EMP00081",
    //   firstName: "Rahul",
    //   middleName: "Kumar",
    //   lastName: "Sharma",
    //   gender: "Male",
    //   dateOfBirth: null,
    //   phone: "9876543210",
    //   emergencyPhone: "9876543219",
    //   email: "rahul.sharma@example.com",
    //   startDate: null,
    //   workLocation: "",
    //   employeeType: "Full-time",
    //   departments: [],
    //   role: [],
    //   reportsTo: "",
    //   jobTitle: "Admin & Co-founder office Operations",
    //   jobDescription: "Responsible for maintaining  office Operations",
    //   workSchedulePolicy: "General Shift",
    //   // workSchedulePolicy: "Mon-Fri",
    //   attendanceSource: "web",
    //   leavePolicy: "",
    //   holidayPolicy: "",
    //   aadharId: "123456789012",
    //   pan: "ABCDE1234F",
    //   pfUan: "100200300400",
    //   pfAcNo: "PF123456789",
    //   esiAccountNo: "ESI987654321",
    //   employerPf: "12%",
    //   includeInPayroll: "yes",
    //   payrollBatch: "April-2024",
    //   professionTaxExemption: "no",
    //   includePF: "yes",
    //   pfContributionRate: "12",
    //   employeePF: "12",
    //   includeEsi: "yes",
    //   esiContribution: "",
    //   hraType: "",
    //   tdsCalculationBasedOn: "",
    //   incomeTaxRegime: "",
    //   addressLine1: "Flat 302, Green Residency",
    //   addressLine2: "MG Road",
    //   country: "India",
    //   state: "Karnataka",
    //   city: "Bengaluru",
    //   pinCode: "560001",
    //   bankIfsc: "HDFC0001234",
    //   bankName: "HDFC Bank",
    //   branchName: "MG Road Branch",
    //   nameOnAccount: "Rahul Sharma",
    //   accountNumber: "123456789012",
    //   fatherName: "Suresh Sharma",
    //   motherName: "Anita Sharma",
    //   maritalStatus: "Single",
    // },
  });

  const normalizeMultiSelectValue = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === "string")
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    return [];
  };

  const normalizeBoolean = (value) => {
    if (typeof value === "boolean") return value;
    if (typeof value !== "string") return undefined;
    const normalized = value.trim().toLowerCase();
    if (["true", "yes", "y"].includes(normalized)) return true;
    if (["false", "no", "n"].includes(normalized)) return false;
    return undefined;
  };

  const toOptionalNumber = (value) => {
    if (value === "" || value === null || value === undefined) return undefined;
    const number = Number(value);
    return Number.isFinite(number) ? number : undefined;
  };

   const normalizePolicyValue = (value) => {
    if (typeof value === "string") return value;
    if (value instanceof File) return value.name;
    return "";
  };
  const stripEmpty = (obj) => {
    if (Array.isArray(obj)) return obj.length ? obj : undefined;
    if (obj && typeof obj === "object") {
      const cleaned = Object.fromEntries(
        Object.entries(obj)
          .map(([k, v]) => [k, stripEmpty(v)])
          .filter(([_, v]) => v !== undefined && v !== "" && v !== null),
      );
      return Object.keys(cleaned).length ? cleaned : undefined;
    }
    return obj === "" || obj === null ? undefined : obj;
  };

  const { mutate: createUser, isPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/api/users/create-user", payload);
      return response.data;
    },
    onSuccess: (response) => {
      const employeeId = response?.employeeID;
      const passwordPreview = response?.passwordPreview || "xyz@123";

      if (employeeId) {
        sessionStorage.setItem(
          getPasswordPreviewStorageKey(employeeId),
          passwordPreview,
        );
      }

      toast.success(
        response?.message
          ? `${response.message}`
          : `Employee onboarded successfully`,
      );
      reset();
      navigate("/app/dashboard/HR-dashboard/employee/employee-list", {
        replace: true,
      });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Failed to onboard employee",
      );
    },
  });

  const onSubmit = (data) => {
    const rawPayload = {
      empId: data.empId?.trim(),
      firstName: data.firstName?.trim(),
      middleName: data.middleName?.trim(),
      lastName: data.lastName?.trim(),
      gender: data.gender,
      dateOfBirth: data.dateOfBirth
        ? data.dateOfBirth.toISOString()
        : undefined,
      phone: data.phone?.trim(),

      email: data.email?.trim(),
      role: data.role?.length ? data.role : undefined,
      departments: data.departments?.length ? data.departments : undefined,
      employeeType: data.employeeType ? { name: data.employeeType } : undefined,
      internshipIsUnpaid: Boolean(data.internshipIsUnpaid),
      designation: data.jobTitle?.trim(),
      jobTitle: data.jobTitle?.trim(),
      jobDescription: data.jobDescription?.trim(),
      startDate: data.startDate ? data.startDate.toISOString() : undefined,
      workLocation: data.workLocation,
      reportsTo: data.reportsTo || undefined,
      shift: data.shift,
      policies: {
        workSchedulePolicy: data.workSchedulePolicy,
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
        hraPercentage: data.hraPercentage?.trim(),
        tdsCalculationBasedOn: data.tdsCalculationBasedOn?.trim(),
        taxPercentage: data.taxPercentage?.trim(),
        incomeTaxRegime: data.incomeTaxRegime?.trim(),
      },
      salaryPackage: {
        amount: toOptionalNumber(data.annualCtc),
        grossAnnual: toOptionalNumber(data.annualCtc),
        currency: "INR",
        payFrequency: "annual",
        allowances: toOptionalNumber(data.allowancesAmount) ?? 0,
        deductions: toOptionalNumber(data.deductionsAmount) ?? 0,
      },
      familyInformation: {
        fatherName: data.fatherName?.trim(),
        motherName: data.motherName?.trim(),
        maritalStatus: data.maritalStatus?.trim(),
        emergencyPhone: data.emergencyPhone?.trim(),
      },
    };

    const payload = stripEmpty(rawPayload);
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

  const { data: usersData = [] } = useQuery({
    queryKey: ["usersData"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
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

  const { data: companyPolicies = [] } = useQuery({
    queryKey: ["policies"],
    queryFn: async () => {
      const response = await axios.get(
        "/api/company/get-company-documents/policies",
      );
      return Array.isArray(response.data?.policies)
        ? response.data.policies
        : [];
    },
  });

  const leavePolicies = companyPolicies.filter(
    (policy) =>
      policy?.policyType === "Leave" &&
      policy?.isActive !== false &&
      policy?.isDeleted !== true,
  );
  const holidayPolicies = companyPolicies.filter(
    (policy) =>
      policy?.policyType === "Holiday" &&
      policy?.isActive !== false &&
      policy?.isDeleted !== true,
  );

  const selectedCountryCode = watch("country");
  const selectedStateCode = watch("state");
  const annualCtc = Number(watch("annualCtc")) || 0;
  const includePF = watch("includePF");
  const includeEsi = watch("includeEsi");
  const hraType = watch("hraType");
  const tdsCalculationBasedOn = watch("tdsCalculationBasedOn");
  const isEsiIneligible = annualCtc / 12 > 21000;

  useEffect(() => {
    if (includePF === "no") {
      setValue("pfContributionRate", "");
      setValue("employeePF", "");
      setValue("employerPf", "");
    }

    if (isEsiIneligible) {
      setValue("includeEsi", "no");
      setValue("esiContribution", "");
    } else if (includeEsi === "no") {
      setValue("esiContribution", "");
    }

    if (hraType !== "Custom") {
      setValue("hraPercentage", "");
    }

    if (tdsCalculationBasedOn !== "Tax Percentage (Consultants)") {
      setValue("taxPercentage", "");
    }
  }, [
    hraType,
    includeEsi,
    includePF,
    isEsiIneligible,
    setValue,
    tdsCalculationBasedOn,
  ]);

  const countryOptions = useMemo(() => Country.getAllCountries(), []);

  const stateOptions = useMemo(
    () => (selectedCountryCode ? State.getStatesOfCountry(selectedCountryCode) : []),
    [selectedCountryCode],
  );

  const cityOptions = useMemo(
    () => {
      if (!selectedCountryCode || !selectedStateCode) {
        return [];
      }

      const cityOptions = City.getCitiesOfState(
        selectedCountryCode,
        selectedStateCode,
      );

      if (
        selectedCountryCode === "IN" &&
        selectedStateCode === "GA" &&
        !cityOptions.some((item) => item.name?.toLowerCase() === "anjuna")
      ) {
        cityOptions.push({
          name: "Anjuna",
          countryCode: "IN",
          stateCode: "GA",
        });
        cityOptions.sort((firstCity, secondCity) =>
          (firstCity.name || "").localeCompare(secondCity.name || ""),
        );
      }

      return cityOptions;
    },
    [selectedCountryCode, selectedStateCode],
  );
  const { data: rolesData = [] } = useQuery({
    queryKey: ["rolesData"],
    queryFn: async () => {
      const response = await axios.get("/api/roles/get-roles");
      return response.data || [];
    },
  });

  const departmentNameById = useMemo(
    () =>
      new Map(
        departmentsData.map((department) => [department._id, department.name]),
      ),
    [departmentsData],
  );

  const roleTitleById = useMemo(
    () => new Map(rolesData.map((role) => [role._id, role.roleTitle])),
    [rolesData],
  );

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
        role.roleTitle?.toLowerCase().endsWith("admin"),
      ),
    [rolesData],
  );

  const reportingManagerByRoleId = useMemo(() => {
    const map = new Map();

    adminRoles.forEach((role) => {
      const manager = usersData.find((user) =>
        user?.role?.some(
          (assignedRole) => assignedRole?.roleTitle === role.roleTitle,
        ),
      );

      const managerName = manager
        ? `${manager.firstName ?? ""} ${manager.lastName ?? ""}`.trim()
        : "";

      map.set(role._id, managerName);
    });

    return map;
  }, [adminRoles, usersData]);

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
            <div className="order-1">
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
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                      </TextField>
                    )}
                  />

                  <Controller
                    name="dateOfBirth"
                    control={control}
                    rules={{ required: "Date of Birth is required" }}
                    render={({ field }) => (
                      <DesktopDatePicker
                        inputFormat="DD/MM/YYYY"
                        label="Date of Birth"
                        {...field}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                            error: !!errors.dateOfBirth,
                            helperText: errors?.dateOfBirth?.message,
                          },
                        }}
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
                      inputProps={{ inputMode: "numeric", maxLength: 10 }}
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
            <div className="order-2">
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
                      helperText={errors?.addressLine1?.message}
                      error={!!errors.addressLine1}
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
                      helperText={errors?.addressLine2?.message}
                      error={!!errors.addressLine2}
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
                        select
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          setValue("state", "");
                          setValue("city", "");
                        }}
                        helperText={errors?.country?.message}
                        error={!!errors.country}
                      >
                        <MenuItem value="" disabled>
                          Select Country
                        </MenuItem>
                        {countryOptions.map((country) => (
                          <MenuItem key={country.isoCode} value={country.isoCode}>
                            {country.name}
                          </MenuItem>
                        ))}
                      </TextField>
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
                         select
                        onChange={(event) => {
                          field.onChange(event.target.value);
                          setValue("city", "");
                        }}
                        helperText={errors?.state?.message}
                        error={!!errors.state}
                      >
                        <MenuItem value="" disabled>
                          Select State
                        </MenuItem>
                        {stateOptions.map((state) => (
                          <MenuItem key={state.isoCode} value={state.isoCode}>
                            {state.name}
                          </MenuItem>
                        ))}
                      </TextField>
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
                        select
                        helperText={errors?.city?.message}
                        error={!!errors.city}
                      >
                        <MenuItem value="" disabled>
                          Select City
                        </MenuItem>
                        {cityOptions.map((city) => (
                          <MenuItem key={city.name} value={city.name}>
                            {city.name}
                          </MenuItem>
                        ))}
                      </TextField>
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
                        helperText={errors?.pinCode?.message}
                        error={!!errors.pinCode}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="order-3">
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
                        <MenuItem value="Intern">Intern</MenuItem>
                      </TextField>
                    )}
                  />
                  {watch("employeeType") === "Intern" && (
                    <Controller
                      name="internshipIsUnpaid"
                      control={control}
                      render={({ field }) => (
                        <TextField
                          value={field.value ? "yes" : "no"}
                          onChange={(event) =>
                            field.onChange(event.target.value === "yes")
                          }
                          size="small"
                          label="Unpaid Internship"
                          select
                          fullWidth
                        >
                          <MenuItem value="no">No</MenuItem>
                          <MenuItem value="yes">Yes</MenuItem>
                        </TextField>
                      )}
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Controller
                    name="departments"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || []}
                        size="small"
                        label="Department"
                        fullWidth
                        select
                        SelectProps={{
                          multiple: true,
                          onChange: (event) =>
                            field.onChange(
                              normalizeMultiSelectValue(event.target.value),
                            ),
                          renderValue: (selected) =>
                            normalizeMultiSelectValue(selected)
                              .map(
                                (deptId) =>
                                  departmentNameById.get(deptId) || deptId,
                              )
                              .join(", "),
                        }}
                        helperText={errors?.departments?.message}
                        error={!!errors.departments}
                      >
                        <MenuItem value="" disabled>
                          Select Department
                        </MenuItem>
                        {departmentsData.map((department) => (
                          <MenuItem key={department._id} value={department._id}>
                            <Checkbox
                              checked={normalizeMultiSelectValue(
                                field.value,
                              ).includes(department._id)}
                            />
                            <ListItemText primary={department.name} />
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />

                  <Controller
                    name="role"
                    control={control}
                    // rules={{
                    //   validate: (value) =>
                    //     value?.length ? true : "Role is required",
                    // }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || []}
                        size="small"
                        label="Role"
                        fullWidth
                        select
                        SelectProps={{
                          multiple: true,
                          onChange: (event) =>
                            field.onChange(
                              normalizeMultiSelectValue(event.target.value),
                            ),
                          renderValue: (selected) =>
                            normalizeMultiSelectValue(selected)
                              .map(
                                (roleId) => roleTitleById.get(roleId) || roleId,
                              )
                              .join(", "),
                        }}
                        helperText={errors?.role?.message}
                        error={!!errors.role}
                      >
                        <MenuItem value="" disabled>
                          Select Role
                        </MenuItem>
                        {rolesData.map((role) => (
                          <MenuItem key={role._id} value={role._id}>
                            <Checkbox
                              checked={normalizeMultiSelectValue(
                                field.value,
                              ).includes(role._id)}
                            />
                            <ListItemText primary={role.roleTitle} />
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                </div>
                  <Controller
                    name="reportsTo"
                    control={control}
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
                            {`${role.roleTitle}${reportingManagerByRoleId.get(role._id) ? ` (${reportingManagerByRoleId.get(role._id)})` : ""}`}
                          </MenuItem>
                        ))}
                      </TextField>
                    )}
                  />
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4 "> */}
                  <Controller
                    name="jobTitle"
                    control={control}
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
                {/* </div> */}
              </div>
                </div>
                
            </div>
            <div className="order-5">
              {/* Section: Compensation Details */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Compensation Details
                </span>
              </div>
              <div className="flex flex-col gap-4 p-4">
                <Controller
                  name="annualCtc"
                  control={control}
                  rules={{
                    validate: (value) => {
                      if (watch("internshipIsUnpaid")) return true;
                      if (watch("includeInPayroll") !== "yes" && !value) return true;
                      return Number(value) > 0 || "Annual CTC must be greater than 0";
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      type="number"
                      label="Annual CTC (INR)"
                      fullWidth
                      disabled={watch("internshipIsUnpaid")}
                      inputProps={{ min: 0, step: "0.01" }}
                      helperText={errors?.annualCtc?.message}
                      error={!!errors.annualCtc}
                    />
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    size="small"
                    label="Monthly Salary (INR)"
                    fullWidth
                    disabled
                    value={(Number(watch("annualCtc")) > 0
                      ? Number(watch("annualCtc")) / 12
                      : 0
                    ).toFixed(2)}
                  />
                  <TextField
                    size="small"
                    label="Daily Rate - 26 Working Days (INR)"
                    fullWidth
                    disabled
                    value={(Number(watch("annualCtc")) > 0
                      ? Number(watch("annualCtc")) / 12 / 26
                      : 0
                    ).toFixed(2)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Controller
                    name="allowancesAmount"
                    control={control}
                    rules={{
                      min: {
                        value: 0,
                        message: "Allowances cannot be negative",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        label="Monthly Fixed Allowances (INR)"
                        fullWidth
                        disabled={watch("internshipIsUnpaid")}
                        inputProps={{ min: 0, step: "0.01" }}
                        helperText={errors?.allowancesAmount?.message}
                        error={!!errors.allowancesAmount}
                      />
                    )}
                  />
                  <Controller
                    name="deductionsAmount"
                    control={control}
                    rules={{
                      min: {
                        value: 0,
                        message: "Deductions cannot be negative",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        label="Monthly Fixed Deductions (INR)"
                        fullWidth
                        disabled={watch("internshipIsUnpaid")}
                        inputProps={{ min: 0, step: "0.01" }}
                        helperText={errors?.deductionsAmount?.message}
                        error={!!errors.deductionsAmount}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="order-4">
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
                        helperText={errors?.attendanceSource?.message}
                        error={!!errors.attendanceSource}
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
                      <TextField
                        {...field}
                        value={field.value || ""}
                        size="small"
                        label="Leave Policy"
                        select
                        fullWidth
                        helperText={errors?.leavePolicy?.message}
                        error={!!errors.leavePolicy}
                        SelectProps={{
                          renderValue: (selected) =>
                            leavePolicies.find(
                              (policy) => policy.documentLink === selected,
                            )?.name || selected,
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select Leave Policy
                        </MenuItem>
                        {leavePolicies.length ? (
                          leavePolicies.map((policy) => (
                            <MenuItem
                              key={policy._id}
                              value={policy.documentLink}
                              className="flex justify-between gap-4"
                            >
                              <span>{policy.name}</span>
                              <a
                                href={policy.documentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                              >
                                View
                              </a>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No leave policies found</MenuItem>
                        )}
                      </TextField>
                    )}
                  />
                  <Controller
                    name="holidayPolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        value={field.value || ""}
                        size="small"
                        label="Holiday Policy"
                        select
                        fullWidth
                        helperText={errors?.holidayPolicy?.message}
                        error={!!errors.holidayPolicy}
                        SelectProps={{
                          renderValue: (selected) =>
                            holidayPolicies.find(
                              (policy) => policy.documentLink === selected,
                            )?.name || selected,
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select Holiday Policy
                        </MenuItem>
                        {holidayPolicies.length ? (
                          holidayPolicies.map((policy) => (
                            <MenuItem
                              key={policy._id}
                              value={policy.documentLink}
                              className="flex justify-between gap-4"
                            >
                              <span>{policy.name}</span>
                              <a
                                href={policy.documentLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline"
                                onMouseDown={(event) => event.stopPropagation()}
                                onClick={(event) => event.stopPropagation()}
                              >
                                View
                              </a>
                            </MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled>No holiday policies found</MenuItem>
                        )}
                      </TextField>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="order-7">
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
                      select
                      fullWidth
                      helperText={errors?.includeInPayroll?.message}
                      error={!!errors.includeInPayroll}
                    >
                      <MenuItem value="" disabled>
                        Select Include In Payroll
                      </MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </TextField>
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
                       select
                      fullWidth
                      helperText={errors?.payrollBatch?.message}
                      error={!!errors.payrollBatch}
                    >
                      <MenuItem value="" disabled>
                        Select Payroll Batch
                      </MenuItem>
                      <MenuItem value="Full Time Batch">Full Time Batch</MenuItem>
                      <MenuItem value="Intern Batch">Intern Batch</MenuItem>
                      <MenuItem value="Consultant Batch">
                        Consultant Batch
                      </MenuItem>
                    </TextField>
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
                      select
                      fullWidth
                      helperText={errors?.professionTaxExemption?.message}
                      error={!!errors.professionTaxExemption}
                    >
                      <MenuItem value="" disabled>
                        Select Profession Tax Exemption
                      </MenuItem>
                      <MenuItem value="yes">Yes</MenuItem>
                      <MenuItem value="no">No</MenuItem>
                    </TextField>
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
                        select
                        fullWidth
                        helperText={errors?.includePF?.message}
                        error={!!errors.includePF}
                      >
                        <MenuItem value="" disabled>
                          Select Include PF
                        </MenuItem>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                      </TextField>
                    )}
                  />
                  {includePF !== "no" && (
                    <Controller
                      name="pfContributionRate"
                      control={control}
                      defaultValue=""
                      render={({ field }) => (
                        <TextField
                          {...field}
                          size="small"
                          label="PF Contribution Rate"
                          select
                          fullWidth
                          helperText={errors?.pfContributionRate?.message}
                          error={!!errors.pfContributionRate}
                        >
                          <MenuItem value="" disabled>
                            Select PF Contribution Rate
                          </MenuItem>
                          <MenuItem value="Restrict Employee & Employer PF to 15,000">
                            Restrict Employee & Employer PF to 15,000
                          </MenuItem>
                          <MenuItem value="Employee & Employer PF on Actual Wage">
                            Employee & Employer PF on Actual Wage
                          </MenuItem>
                          <MenuItem value="Employee PF on Actual Wage & Employer PF to 15,000">
                            Employee PF on Actual Wage & Employer PF to 15,000
                          </MenuItem>
                        </TextField>
                      )}
                    />
                  )}
                </div>
                {includePF !== "no" && (
                  <Controller
                    name="employeePF"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Employee PF"
                        select
                        fullWidth
                        helperText={errors?.employeePF?.message}
                        error={!!errors.employeePF}
                      >
                        <MenuItem value="" disabled>
                          Select Employee PF
                        </MenuItem>
                        <MenuItem value="10%">10%</MenuItem>
                        <MenuItem value="12%">12%</MenuItem>
                      </TextField>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Section: Payroll Information II*/}
            <div className="order-8">
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Payroll Information II
                </span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-2 gap-4  ">
                  {includePF !== "no" && (
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
                          helperText={errors?.employerPf?.message}
                          error={!!errors.employerPf}
                        >
                          <MenuItem value="" disabled>
                            Select Employer PF
                          </MenuItem>
                          <MenuItem value="10%">10%</MenuItem>
                          <MenuItem value="12%">12%</MenuItem>
                          <MenuItem value="13%">13%</MenuItem>
                        </TextField>
                      )}
                    />
                  )}
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
                        disabled={isEsiIneligible}
                        helperText={
                          isEsiIneligible
                            ? "ESI is unavailable when monthly CTC exceeds INR 21,000"
                            : errors?.includeEsi?.message
                        }
                        error={!!errors.includeEsi}
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
                {(includeEsi !== "no" || isEsiIneligible) && (
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
                      disabled={isEsiIneligible}
                      helperText={errors?.esiContribution?.message}
                      error={!!errors.esiContribution}
                    >
                      <MenuItem value="" disabled>
                        Select ESI Contribution
                      </MenuItem>
                      <MenuItem value="Restrict Contribution to 21,000 of ESI Gross">
                        Restrict Contribution to 21,000 of ESI Gross
                      </MenuItem>
                      <MenuItem value="No Restriction">No Restriction</MenuItem>
                    </TextField>
                  )}
                />
                )}
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
                      helperText={errors?.hraType?.message}
                      error={!!errors.hraType}
                    >
                      <MenuItem value="" disabled>
                        Select HRA
                      </MenuItem>
                      <MenuItem value="Metropolitan (50%)">
                        Metropolitan (50%)
                      </MenuItem>
                      <MenuItem value="Non-Metropolitan (40%)">
                        Non-Metropolitan (40%)
                      </MenuItem>
                      <MenuItem value="Custom">Custom</MenuItem>
                    </TextField>
                  )}
                />
                {hraType === "Custom" && (
                  <Controller
                    name="hraPercentage"
                    control={control}
                    rules={{
                      required: "HRA percentage is required",
                      min: {
                        value: 0,
                        message: "HRA percentage cannot be negative",
                      },
                      max: {
                        value: 100,
                        message: "HRA percentage cannot exceed 100",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        label="HRA Percentage"
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        helperText={errors?.hraPercentage?.message}
                        error={!!errors.hraPercentage}
                      />
                    )}
                  />
                )}
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
                      helperText={errors?.tdsCalculationBasedOn?.message}
                      error={!!errors.tdsCalculationBasedOn}
                    >
                      <MenuItem value="" disabled>
                        Select TDS Calculation
                      </MenuItem>
                      <MenuItem value="Tax Slabs (Salaried Employee)">
                        Tax Slabs (Salaried Employee)
                      </MenuItem>
                      <MenuItem value="Tax Percentage (Consultants)">
                        Tax Percentage (Consultants)
                      </MenuItem>
                    </TextField>
                  )}
                />
                {tdsCalculationBasedOn === "Tax Percentage (Consultants)" && (
                  <Controller
                    name="taxPercentage"
                    control={control}
                    rules={{
                      required: "Tax percentage is required",
                      min: {
                        value: 0,
                        message: "Tax percentage cannot be negative",
                      },
                      max: {
                        value: 100,
                        message: "Tax percentage cannot exceed 100",
                      },
                    }}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        type="number"
                        label="Tax Percentage"
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: "0.01" }}
                        helperText={errors?.taxPercentage?.message}
                        error={!!errors.taxPercentage}
                      />
                    )}
                  />
                )}
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
                      helperText={errors?.incomeTaxRegime?.message}
                      error={!!errors.incomeTaxRegime}
                    >
                      <MenuItem value="" disabled>
                        Select Income Tax Regime
                      </MenuItem>
                      <MenuItem value="Old Tax Regime">Old Tax Regime</MenuItem>
                      <MenuItem value="New Tax Regime">New Tax Regime</MenuItem>
                    </TextField>
                  )}
                />
              </div>
            </div>
            <div className="order-6">
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
                  rules={{
                    // required: "Bank IFSC is required",
                    pattern: {
                      value: /^[A-Z]{4}0[A-Z0-9]{6}$/i,
                      message: "Enter a valid IFSC code",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Bank IFSC"
                      fullWidth
                      helperText={errors?.bankIfsc?.message}
                      error={!!errors.bankIfsc}
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
                      helperText={errors?.bankName?.message}
                      error={!!errors.bankName}
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
                      helperText={errors?.branchName?.message}
                      error={!!errors.branchName}
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
                      helperText={errors?.nameOnAccount?.message}
                      error={!!errors.nameOnAccount}
                    />
                  )}
                />
                <Controller
                  name="accountNumber"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "Account Number is required",
                    pattern: {
                      value: /^[0-9]{9,18}$/,
                      message: "Enter a valid account number",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Account Number"
                      fullWidth
                      helperText={errors?.accountNumber?.message}
                      error={!!errors.accountNumber}
                    />
                  )}
                />
              </div>
            </div>
            <div className="order-9">
              {/* Section: KYC Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">KYC</span>
              </div>
              <div className="grid grid-cols sm:grid-cols-1 md:grid-cols-1 gap-4 p-4">
                <Controller
                  name="aadharId"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "Aadhar ID is required",
                    pattern: {
                      value: /^[0-9]{12}$/,
                      message: "Enter a valid Aadhar ID",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Aadhar ID"
                      fullWidth
                      helperText={errors?.aadharId?.message}
                      error={!!errors.aadharId}
                    />
                  )}
                />

                <Controller
                  name="pan"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "PAN is required",
                    pattern: {
                      value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i,
                      message: "Enter a valid PAN",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PAN"
                      fullWidth
                      helperText={errors?.pan?.message}
                      error={!!errors.pan}
                    />
                  )}
                />

                <Controller
                  name="pfUan"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "PF UAN is required",
                    pattern: {
                      value: /^[0-9]{12}$/,
                      message: "Enter a valid PF UAN",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PF UAN"
                      fullWidth
                      helperText={errors?.pfUan?.message}
                      error={!!errors.pfUan}
                    />
                  )}
                />

                <Controller
                  name="pfAcNo"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "PF A/c No is required",
                    pattern: {
                      value: /^[A-Z0-9/-]{10,25}$/i,
                      message: "Enter a valid PF A/c No",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="PF A/c No"
                      fullWidth
                      helperText={errors?.pfAcNo?.message}
                      error={!!errors.pfAcNo}
                    />
                  )}
                />

                <Controller
                  name="esiAccountNo"
                  control={control}
                  defaultValue=""
                  rules={{
                    // required: "ESI A/c No is required",
                    pattern: {
                      value: /^[0-9]{10,17}$/,
                      message: "Enter a valid ESI A/c No",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="ESI A/c No"
                      fullWidth
                      helperText={errors?.esiAccountNo?.message}
                      error={!!errors.esiAccountNo}
                    />
                  )}
                />
              </div>
            </div>

            <div className="order-10">
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
                      helperText={errors?.fatherName?.message}
                      error={!!errors.fatherName}
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
                      helperText={errors?.motherName?.message}
                      error={!!errors.motherName}
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
                      helperText={errors?.maritalStatus?.message}
                      error={!!errors.maritalStatus}
                    />
                  )}
                />
                <Controller
                  name="emergencyPhone"
                  control={control}
                  rules={{
                    // required: "Emergency Mobile Number is required",
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: "Enter a valid 10-digit number",
                    },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Emergency Mobile Phone"
                      fullWidth
                      helperText={errors?.emergencyPhone?.message}
                      error={!!errors.emergencyPhone}
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
