import React from "react";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import { DesktopDatePicker } from "@mui/x-date-pickers";
import PageFrame from "../../../../components/Pages/PageFrame";

const EmployeeOnboard = () => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      gender: "",
      dob: null,
      mobileNumber: "",
      startDate: null,
      workLocation: "",
      employeeType: "",
      department: "",
      reportsTo: "",
      jobTitle: "",
      jobDescription: "",
      shift: "",
      workSchedulePolicy: "",
      attendanceSource: "",
      leavePolicy: "",
      holidayPolicy: "",
      aadharId: "",
      pan: "",
    },
  });

  const onSubmit = (data) => {};

  const handleReset = () => {
    reset();
  };

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
                    name="dob"
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
                  name="mobilePhone"
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
                      helperText={errors?.mobilePhone?.message}
                      error={!!errors.mobilePhone}
                    />
                  )}
                />
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
                      helperText={errors?.lastName?.message}
                      error={!!errors.lastName}
                    />
                  )}
                />
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
                        helperText={errors?.workLocation?.message}
                        error={!!errors.workLocation}
                      />
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
                        helperText={errors?.employeeType?.message}
                        error={!!errors.employeeType}
                      />
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
                        helperText={errors?.department?.message}
                        error={!!errors.department}
                      />
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
                        helperText={errors?.reportsTo?.message}
                        error={!!errors.reportsTo}
                      />
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
                <Controller
                  name="shift"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <TextField
                      {...field}
                      size="small"
                      label="Shift"
                      fullWidth
                    />
                  )}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Controller
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
                  />

                  <Controller
                    name="attendanceSource"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Attendance Source"
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="leavePolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Leave Policy"
                        fullWidth
                      />
                    )}
                  />
                  <Controller
                    name="holidayPolicy"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <TextField
                        {...field}
                        size="small"
                        label="Holiday Policy"
                        fullWidth
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            <div>
              {/* Section: Payroll Information */}
              <div className="py-4 border-b-default border-borderGray">
                <span className="text-subtitle font-pmedium">
                  Payroll Information
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
            <div>
              {/* Section: Payroll Information */}
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
                  name="aadharID"
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
              </div>
            </div>
            <div>
              {/* Section: Payroll Information */}
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
                  name="martialStatus"
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
            <PrimaryButton type="submit" title={"Submit"} />
            <SecondaryButton handleSubmit={handleReset} title={"Reset"} />
          </div>
        </form>
      </div>
    </PageFrame>
  );
};

export default EmployeeOnboard;
