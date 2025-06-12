import React, { useEffect, useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../components/PrimaryButton";
import { toast } from "sonner";
import dayjs from "dayjs";
import {
  PersonalDetails,
  WorkDetails,
  KycDetails,
  BankDetails,
} from "../../forms/ProfileDetail";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import Abrar from "../../assets/abrar.jpeg";
import { Avatar, Chip } from "@mui/material";

const MyProfile = ({ handleClose, pageTitle }) => {
  const [file, setFile] = useState(null);
  const api = useAxiosPrivate();
  const { auth } = useAuth();
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const axios = useAxiosPrivate();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Generate preview URL
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file before uploading.");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("logo", file);

    try {
      const response = await axios.post(
        "/api/users/update-single-user",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert(response.data.message || "Image uploaded successfully!");
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const user = {
    name: `${auth?.user?.firstName} ${auth?.user?.lastName}`,
    email: auth?.user?.email,
    designation: auth?.user?.designation,
    status: true,
    avatarColor: "#1976d2",
    workLocation:
      auth?.user?.company?.workLocations?.[0]?.buildingName ??
      "Unknown Location",
  };

  const [personalDetails, setPersonalDetails] = useState({
    name: "",
    gender: "",
    dob: null,
    fatherName: "",
    motherName: "",
  });

  const [workDetails, setWorkDetails] = useState({
    role: "",
    department: [],
    designation: "",
    workLocation: "",
    workType: "",
    employeeType: "",
    startDate: null,
    shift: "",
    workPolicy: "",
  });

  const [kycDetails, setKycDetails] = useState({
    aadhaar: "",
    pan: "",
  });

  const [bankDetails, setBankDetails] = useState({
    bankName: "",
    accountNumber: "",
    ifsc: "",
  });

  const [isEditable, setIsEditable] = useState(false);

  const handlePersonalDetailsChange = (field, value) => {
    setPersonalDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleWorkDetailsChange = (field, value) => {
    setWorkDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleKycDetailsChange = (field, value) => {
    setKycDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankDetailsChange = (field, value) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const consolidatedFormData = {
      ...personalDetails,
      ...workDetails,
      kycDetails,
      bankDetails,
    };

    // Send consolidatedFormData to API

    const userId = auth.user._id;
    try {
      const response = await api.patch(
        `/api/users/update-single-user`,
        consolidatedFormData
      );
      toast.success(response.data.message);
      setIsEditable(false);
      // return response.data;
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleEditClick = () => {
    setIsEditable((prev) => !prev);
  };

  async function fetchRoles() {
    try {
      const response = await api.get("/api/roles/get-roles");
      return response.data.roles;
    } catch (error) {}
  }

  async function fetchDepartments() {
    try {
      const response = await api.get("/api/departments/get-departments");
      return response.data.departments;
    } catch (error) {}
  }

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const empId = auth.user.empId; // Your API uses empId, not _id
        const [roles, departments] = await Promise.all([
          fetchRoles(),
          fetchDepartments(),
        ]);

        const response = await api.get(`/api/users/fetch-single-user/${empId}`);
        const user = response.data;

        setRoles(roles || []);
        setDepartments(departments || []);

        setPersonalDetails({
          name: `${user.firstName} ${user.lastName}`.trim(),
          gender: user.gender || "",
          dob: user.dob ? dayjs(user.dob, "DD/MM/YYYY") : null,
          fatherName: "", // Not present in API response
          motherName: "", // Not present in API response
        });

        setWorkDetails({
          role: user.jobTitle || "",
          department: user.department || "",
          designation: user.jobTitle || "",
          workLocation: user.workLocation || "",
          workType: "", // Not in response
          employeeType: user.employeeType || "",
          startDate: user.startDate
            ? dayjs(user.startDate, "DD/MM/YYYY")
            : null,
          shift: user.shift || "",
          workPolicy: user.workSchedulePolicy || "",
        });

        setKycDetails({
          aadhaar: user.aadharID || "",
          pan: user.pan || "",
        });

        setBankDetails({
          bankName: "", // Not in API response
          accountNumber: "", // Not in API response
          ifsc: "", // Not in API response
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile details");
      }
    };

    fetchUserDetails();
  }, [auth.user.empId]);

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary uppercase">
          My profile
        </span>
        <PrimaryButton
          title={isEditable ? "Cancel" : "Edit"}
          handleSubmit={handleEditClick}
        />
      </div>
      {/* <div className="flex items-center gap-8 w-full border-2 border-gray-200 p-4 rounded-md">
        <div className="flex gap-6 items-center">
          <div className="w-40 h-40">
            <Avatar
              style={{
                backgroundColor: user.avatarColor,
                width: "100%",
                height: "100%",
                fontSize: "5rem",
              }}
              src={user.email === "abrar@biznest.co.in" ? Abrar : undefined}>
              {user.email !== "abrar@biznest.co.in" && user.name?.charAt(0)}
            </Avatar>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
            </span>
            <span className="text-subtitle">{user.designation}</span>

        
            <label
              htmlFor="fileUpload"
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 p-6 rounded-md cursor-pointer transition">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Company Logo Preview"
                  className="w-32 h-32 object-cover rounded-md"
                />
              ) : (
                <>
                  <span className="text-content text-gray-500">
                    Upload Profile Image
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
       
            {previewUrl && (
              <div className="mt-4 flex flex-col items-center gap-2">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`px-4 py-2 rounded-md text-white ${
                    uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
                  }`}>
                  {uploading ? "Uploading..." : "Upload Image"}
                </button>
                <label
                  htmlFor="fileUpload"
                  className="text-blue-600 cursor-pointer underline">
                  Change Image
                </label>
              </div>
            )}
          
          </div>
        </div>
      </div> */}
      {/* <div className="flex items-center justify-between p-4">
        <span className="text-title font-pmedium text-primary uppercase">
          &nbsp;
        </span>
        <PrimaryButton
          title={isEditable ? "Cancel" : "Edit"}
          handleSubmit={handleEditClick}
        />
      </div> */}
      <div className="border-2 border-gray-200 p-2 rounded-md sm:h-[30vh] sm:overflow-y-auto md:h-[55vh] overflow-y-auto ">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <PersonalDetails
              formData={personalDetails}
              handleChange={handlePersonalDetailsChange}
              isEditable={isEditable}
            />

            <WorkDetails
              formData={workDetails}
              handleChange={handleWorkDetailsChange}
              isEditable={isEditable}
            />

            <KycDetails
              formData={kycDetails}
              handleChange={handleKycDetailsChange}
              isEditable={isEditable}
            />

            <BankDetails
              formData={bankDetails}
              handleChange={handleBankDetailsChange}
              isEditable={isEditable}
            />
          </LocalizationProvider>
          {isEditable ? (
            <div className="flex gap-4 items-center justify-center my-4">
              <PrimaryButton
                title={"Save"}
                type={"submit"}
                onClick={handleSubmit}
              />
              <SecondaryButton title={"Reset"} type={""} />
            </div>
          ) : (
            ""
          )}
        </form>
      </div>
    </div>
  );
};

export default MyProfile;
