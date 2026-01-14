import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TextField,
  Select,
  MenuItem,
  Button,
  Grid,
  InputLabel,
  FormControl,
  Avatar,
  CircularProgress,
  Chip,
} from "@mui/material";
import DetalisFormatted from "../../components/DetalisFormatted";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import {
  isAlphanumeric,
  noOnlyWhitespace,
  isValidEmail,
  isValidPhoneNumber,
  isValidPinCode,
} from "../../utils/validators";

const UserDetails = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const empId = auth?.user?.empId ?? "";

  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("profilePic", file);

    try {
      const response = await axios.patch(
        "/api/users/update-single-user",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // ✅ Show success message
      // alert(response.data.message || "Image uploaded successfully!");
      // toast.success(response.data.message || "Profile Image uploaded successfully!");
      toast.success("Profile Image uploaded successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000); // delay of 1000ms = 1 second
      if (response.data.profilePicture?.url) {
        setPreviewUrl(response.data.profilePicture.url);
      }
    } catch (error) {
      console.error("Upload Error:", error);
      // alert("Failed to upload image.");
      toast.success("Profile Image uploaded successfully!");
      setTimeout(() => {
        window.location.reload();
      }, 1000); // delay of 1000ms = 1 second
    } finally {
      setUploading(false);
    }
  };
  const { data: userDetails, isLoading } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const res = await axios.get(`/api/users/fetch-single-user/${empId}`);
      return res.data;
    },
  });

  const user = {
    name: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
    email: auth?.user?.email,
    designation: auth?.user?.designation,
    department:
      auth.user.departments?.map((department) => department?.name).join(", ") ||
      "",
    status: true,
    avatarColor: "#1976d2",
    workLocation:
      userDetails?.workLocation?.unitName ||
      userDetails?.workLocation?.unitNo ||
      userDetails?.workLocation?.building?.buildingName ||
      userDetails?.workLocation ||
      "",
  };

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Generate preview URL
    }
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {},
  });

  // Reset when data is loaded
  useEffect(() => {
    if (userDetails) {
      reset(userDetails);
    }
  }, [userDetails, reset]);

  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      return axios.patch(`/api/users/update-single-user`, updatedData);
    },
    onSuccess: (data) => {
      toast.success(data.message || "User details updated successfully!");
      setEditMode(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user details");
    },
  });

  const onSubmit = (data) => {
    const payload = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      gender: data.gender,
      phone: data.mobilePhone,
      email: data.email,
      homeAddress: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        country: data.country,
        state: data.state,
        city: data.city,
        pinCode: data.pinCode,
      },
      bankInformation: {
        bankName: data.bankName,
        bankIFSC: data.bankIfsc,
        branchName: data.branchName,
        nameOnAccount: data.nameOnAccount,
        accountNumber: data.accountNumber,
      },
      panAadhaarDetails: {
        aadhaarId: data.aadhaarId,
        pan: data.pan,
        pfUAN: data.pfUan,
        pfAccountNumber: data.pfAccountNumber,
        esiAccountNumber: data.esiAccountNumber,
      },
      familyInformation: {
        fatherName: data.fatherName,
        motherName: data.motherName,
        maritalStatus: data.maritalStatus,
        emergencyPhone: data.emergencyPhone,
      },
    };

    if (data.dob) {
      payload.dateOfBirth = dayjs(data.dob).toDate();
    }

    mutation.mutate(payload);
  };

  if (isLoading || !userDetails)
    return (
      <div className="h-72 place-items-center">
        <CircularProgress />
      </div>
    );

  const fields = [
    { name: "firstName", label: "First Name", disabled: false },
    { name: "middleName", label: "Middle Name", disabled: false },
    { name: "lastName", label: "Last Name", disabled: false },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
      disabled: true,
    },
    { name: "dob", label: "Date of Birth", type: "date", disabled: false },
    { name: "employeeID", label: "Employee ID", disabled: true },
    { name: "mobilePhone", label: "Mobile Phone", disabled: false },
    { name: "startDate", label: "Start Date", type: "date", disabled: true },
    { name: "workLocation", label: "Work Location", disabled: true },
    { name: "employeeType", label: "Employee Type", disabled: true },
    { name: "departments", label: "Department", disabled: true },
    { name: "role", label: "Role", disabled: true },
    { name: "reportsTo", label: "Reports To", disabled: true },
    { name: "jobTitle", label: "Job Title", disabled: true },
    { name: "jobDescription", label: "Job Description", disabled: true },
    { name: "shift", label: "Shift", disabled: true },
    {
      name: "workSchedulePolicy",
      label: "Work Schedule Policy",
      disabled: true,
    },
    { name: "attendanceSource", label: "Attendance Source", disabled: true },
    { name: "leavePolicy", label: "Leave Policy", disabled: true },
    { name: "holidayPolicy", label: "Holiday Policy", disabled: true },
    { name: "aadhaarId", label: "Aadhaar ID", disabled: false },
    { name: "pan", label: "PAN", disabled: false },
    { name: "pfUan", label: "PF UAN", disabled: false },
    { name: "pfAccountNumber", label: "PF Account No", disabled: true },
    { name: "esiAccountNumber", label: "ESI Account No", disabled: false },
    { name: "bankName", label: "Bank Name", disabled: false },
    { name: "bankIfsc", label: "Bank IFSC", disabled: false },
    { name: "branchName", label: "Branch Name", disabled: false },
    { name: "nameOnAccount", label: "Name On Account", disabled: false },
    { name: "accountNumber", label: "Account Number", disabled: false },

    { name: "addressLine1", label: "Address Line 1", disabled: false },
    { name: "addressLine2", label: "Address Line 2", disabled: false },
    { name: "state", label: "State", disabled: false },
    { name: "city", label: "City", disabled: false },
    { name: "country", label: "Country", disabled: false },
    { name: "pinCode", label: "Pin Code", disabled: false },
    { name: "fatherName", label: "Father Name", disabled: false },
    { name: "motherName", label: "Mother Name", disabled: false },
    { name: "maritalStatus", label: "Marital Status", disabled: false },
    { name: "emergencyPhone", label: "Emergency Phone", disabled: false },
    {
      name: "includeInPayroll",
      label: "Include In Payroll",
      type: "select",
      options: ["Yes", "No"],
      disabled: true,
    },
    { name: "payrollBatch", label: "Payroll Batch", disabled: true },
    {
      name: "professionalTaxExemption",
      label: "Professional Tax Exemption",
      type: "select",
      options: ["Yes", "No"],
      disabled: true,
    },
    {
      name: "includePF",
      label: "Include PF",
      type: "select",
      options: ["Yes", "No"],
      disabled: true,
    },
    {
      name: "pFContributionRate",
      label: "PF Contribution Rate",
      disabled: true,
    },
    { name: "employeePF", label: "Employee PF", disabled: true },
    { name: "employerPf", label: "Employer PF", disabled: true },
    {
      name: "includeEsi",
      label: "Include ESI",
      type: "select",
      options: ["Yes", "No"],
      disabled: true,
    },
    { name: "esiContribution", label: "ESI Contribution", disabled: true },
    { name: "hraType", label: "HRA", disabled: true },
    {
      name: "tdsCalculationBasedOn",
      label: "TDS Calculation Based On",
      disabled: true,
    },
    { name: "incomeTaxRegime", label: "Income Tax Regime", disabled: true },
  ];

  const sections = [
    {
      title: "Personal Informations",
      fields: [
        "firstName",
        "middleName",
        "lastName",
        "gender",
        "dob",
        "mobilePhone",
        "email",
        "fatherName",
        "motherName",
        "maritalStatus",
        "emergencyPhone",
        "aadharID",
        "pan",
        "pfUan",
        "pfAccountNumber",
        "esiAccountNumber",
        "bankName",
        "bankIfsc",
        "branchName",
        "nameOnAccount",
        "accountNumber",
        "addressLine1",
        "addressLine2",
        "state",
        "city",
        "country",
        "pinCode",
      ],
    },
    {
      title: "Work Details",
      fields: [
        "employeeID",
        "startDate",
        "workLocation",
        "employeeType",
        "departments",
        "role",
        "reportsTo",
        "jobTitle",
        "jobDescription",
        // "shift",
        "workSchedulePolicy",
        "attendanceSource",
      ],
    },
    {
      title: "Payroll & Verifications",
      fields: [
        "includeInPayroll",
        "payrollBatch",
        "professionalTaxExemption",
        "includePF",
        "pFContributionRate",
        "employeePF",
        "employerPf",
        "includeEsi",
        "esiContribution",
        "hraType",
        "tdsCalculationBasedOn",
        "incomeTaxRegime",
        "leavePolicy",
        "holidayPolicy",
        "pfAccountNumber",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <span className="text-title font-pmedium text-primary uppercase">
          My Profile
        </span>
      </div>
      <div className="flex items-center gap-8 w-full border-2 border-gray-200 p-4 rounded-xl">
        <div className="flex gap-6 items-center w-full">
          <div className="w-40 h-40">
            {/* <Avatar
                    style={{
                      backgroundColor: user.avatarColor,
                      width: "100%",
                      height: "100%",
                      fontSize: "5rem",
                    }}
                    src={user.email === "abrar@biznest.co.in" ? Abrar : undefined}>
                    {user.email !== "abrar@biznest.co.in" && user.name?.charAt(0)}
                  </Avatar> */}
            <Avatar
              style={{
                backgroundColor: user.avatarColor,
                width: "100%",
                height: "100%",
                fontSize: "5rem",
              }}
              src={previewUrl || auth?.user?.profilePicture?.url}
            >
              {!previewUrl &&
                !auth?.user?.profilePicture?.url &&
                user.name?.charAt(0)}
            </Avatar>
          </div>
          <div className=" w-96 flex flex-col gap-1">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
            </span>
            <span className="text-subtitle">{user.designation}</span>

            {/* File Upload START */}
            {/* File Input & Preview */}
            <label
              htmlFor="fileUpload"
              // className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 rounded-md cursor-pointer transition">
              className="flex flex-col items-start justify-center   rounded-md cursor-pointer transition"
            >
              {previewUrl ? (
                // <img
                //   src={previewUrl}
                //   alt="Company Logo Preview"
                //   className="w-32 h-32 object-cover rounded-md"
                // />
                <span> </span>
              ) : (
                <>
                  <span className="text-content text-white bg-primary font-pregular mt-8 px-5 py-3 rounded-md hover:scale-[1.05] transition">
                    Update Profile Image
                  </span>
                </>
              )}
              <input
                id="fileUpload"
                type="file"
                accept=".png, .jpg, .jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {/* Buttons: Change File & Upload */}
            {previewUrl && (
              <div className=" flex flex-col items-start gap-2">
                <label
                  htmlFor="fileUpload"
                  className="text-primary cursor-pointer underline"
                >
                  Change Image
                </label>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`px-4 py-2 rounded-md text-white ${
                    uploading
                      ? "bg-gray-400"
                      : "bg-primary hover:scale-[1.05] transition"
                  }`}
                >
                  {uploading ? "Uploading..." : "Save Image"}
                </button>
              </div>
            )}
            {/* File Upload END */}
          </div>
          {/* <div>&nbsp;&nbsp;</div> */}
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex gap-2">
              <div className="flex flex-col gap-4 text-gray-600">
                <span className="capitalize">Email : </span>
                <span className="capitalize">Phone: </span>
                <span className="capitalize">Department : </span>
                <span className="capitalize">Work Location : </span>
              </div>
              <div className="flex flex-col gap-4 text-gray-500">
                <span>{user.email}</span>
                <span>{auth?.user?.phone ?? "N/A"}</span>
                <span>{user.department}</span>

                <span>{user.workLocation}</span>
              </div>
            </div>
          </div>
          <div className="h-40  flex flex-col justify-start items-start  ">
            <div className="">
              <Chip
                label={user.status ? "Active" : "Inactive"}
                sx={{
                  backgroundColor: user.status ? "green" : "grey",
                  color: "white",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <PageFrame>
        <form onSubmit={handleSubmit(onSubmit)}>
          {sections.map((section) => (
            <div key={section.title} className="mb-8">
              <span className="text-subtitle font-pmedium">
                {section.title}
              </span>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {section.fields.map((fieldName) => {
                  const fieldConfig = fields.find((f) => f.name === fieldName);
                  if (!fieldConfig) return null;

                  const {
                    name,
                    label,
                    type,
                    options,
                    disabled: fieldDisabled,
                  } = fieldConfig;
                  const value = userDetails?.[name] ?? "";

                  const isURL =
                    typeof value === "string" && value.startsWith("http");

                  // Determine final disabled state
                  const isEditable = editMode && !fieldDisabled;
                  const isDisabled = !isEditable;

                  return (
                    <div key={name}>
                      {type === "select" ? (
                        isEditable ? (
                          <FormControl fullWidth>
                            <Controller
                              name={name}
                              control={control}
                              rules={{ required: `${label} is required` }}
                              render={({ field, fieldState: { error } }) => (
                                <TextField
                                  size="small"
                                  select
                                  {...field}
                                  label={label}
                                  error={!!error}
                                  helperText={error?.message}
                                >
                                  {options.map((opt) => (
                                    <MenuItem key={opt} value={opt}>
                                      {opt}
                                    </MenuItem>
                                  ))}
                                </TextField>
                              )}
                            />
                          </FormControl>
                        ) : (
                          <TextField
                            size="small"
                            fullWidth
                            label={label}
                            value={value || ""}
                            disabled
                          />
                        )
                      ) : type === "date" ? (
                        isEditable ? (
                          <Controller
                            name={name}
                            control={control}
                            rules={{ required: `${label} is required` }}
                            render={({ field, fieldState: { error } }) => (
                              <DatePicker
                                label={label}
                                format="DD-MM-YYYY"
                                value={field.value ? dayjs(field.value) : null}
                                onChange={(date) =>
                                  field.onChange(date ? date.toISOString() : "")
                                }
                                slotProps={{
                                  textField: {
                                    fullWidth: true,
                                    size: "small",
                                    error: !!error,
                                    helperText: error?.message,
                                  },
                                }}
                              />
                            )}
                          />
                        ) : (
                          <DatePicker
                            label={label}
                            value={value ? dayjs(value) : null}
                            format="DD-MM-YYYY"
                            onChange={() => {}}
                            disabled
                            slotProps={{
                              textField: { fullWidth: true, size: "small" },
                            }}
                          />
                        )
                      ) : isURL && !editMode ? (
                        <TextField
                          size="small"
                          fullWidth
                          label={label}
                          value={value}
                          disabled
                          helperText={
                            <a
                              href={value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 underline ml-2"
                            >
                              {label === "Leave Policy"
                                ? "View Leave Policy"
                                : label === "Holiday Policy"
                                ? "View Holiday Policy"
                                : "Open Link"}
                            </a>
                          }
                        />
                      ) : isEditable ? (
                        <Controller
                          name={name}
                          control={control}
                          rules={{
                            ...([
                              "firstName",
                              "lastName",
                              "mobilePhone",
                              "pinCode",
                              "email",
                            ].includes(name)
                              ? { required: `${label} is required` }
                              : {}),

                            validate: {
                              // noOnlyWhitespace,
                              ...([
                                "firstName",
                                // "middleName",
                                "lastName",
                                // "addressLine1",
                                // "addressLine2",
                              ].includes(name)
                                ? { isAlphanumeric }
                                : {}),
                              ...(name === "email" ? { isValidEmail } : {}),
                              ...(name === "mobilePhone"
                                ? { isValidPhoneNumber }
                                : {}),
                              ...(name === "pinCode" ? { isValidPinCode } : {}),
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <TextField
                              {...field}
                              size="small"
                              fullWidth
                              label={label}
                              error={!!error}
                              helperText={error?.message}
                            />
                          )}
                        />
                      ) : (
                        <TextField
                          size="small"
                          fullWidth
                          label={label}
                          value={value || ""}
                          disabled
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="flex justify-center">
            {!editMode ? (
              <div className="flex justify-end">
                <PrimaryButton
                  title={"Edit"}
                  handleSubmit={() => {
                    if (userDetails) reset(userDetails);
                    setEditMode(true);
                  }}
                />
              </div>
            ) : (
              ""
            )}
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            {editMode ? (
              <>
                <PrimaryButton title={"Save"} />
                <SecondaryButton
                  title={"Cancel"}
                  handleSubmit={() => setEditMode(false)}
                />
              </>
            ) : (
              <></>
            )}
          </div>
        </form>
      </PageFrame>
    </div>
  );
};

export default UserDetails;
