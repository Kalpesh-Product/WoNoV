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
import { api } from "../../utils/axios";

const MyProfile = ({ handleClose, pageTitle }) => {
  const { auth } = useAuth();
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);

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
        `/api/users/update-single-user/${userId}`,
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
    } catch (error) {

    }
  }

  async function fetchDepartments() {
    try {
      const response = await api.get("/api/departments/get-departments");
      return response.data.departments;
    } catch (error) {
    }
  }
 
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userId = auth.user._id;
        const response = await api.get(
          `/api/users/fetch-single-user/${userId}`
        );
        const fetchedUser = response.data.user || {};

        // Update all states based on fetched data
        const roles = await fetchRoles();
        const departments = await fetchDepartments();

        const dateString = fetchedUser?.startDate;
        const formattedDate = dayjs(dateString).format("MM/DD/YYYY");


        setPersonalDetails({
          name: fetchedUser.name || "",
          gender: fetchedUser.gender || "",
          dob: fetchedUser.dob ? dayjs(fetchedUser.dob) : null,
          fatherName: fetchedUser.fatherName,
          motherName: fetchedUser.motherName,
        });

        // Get current role and department from auth.user
        const currentRole = auth.user.role.roleTitle; // "Master-Admin"
        const currentDepartment = auth.user.department[0].name; // "TopManagement"

        setWorkDetails({
          role: currentRole, // Current role from auth
          roles: roles || [], // All available roles
          department: currentDepartment, // Current department from auth
          departments: departments || [], // All available departments
          designation: fetchedUser.workDetails?.designation || "",
          workLocation: fetchedUser.workLocation || "",
          workType: fetchedUser?.workType || "",
          employeeType: fetchedUser?.employeeType || "",
          startDate: fetchedUser.startDate
            ? dayjs(fetchedUser.startDate)
            : null,
          shift: fetchedUser?.shift || "",
          workPolicy: fetchedUser?.workPolicy || "",
        });

        setKycDetails({
          aadhaar: fetchedUser.kycDetails?.aadhaar || "",
          pan: fetchedUser.kycDetails?.pan || "",
        });

        setBankDetails({
          bankName: fetchedUser.bankDetails?.bankName || "",
          accountNumber: fetchedUser.bankDetails?.accountNumber || "",
          ifsc: fetchedUser.bankDetails?.ifsc || "",
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, [auth.user._id]);

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary">{pageTitle}</span>
        <PrimaryButton
          title={isEditable ? "Cancel" : "Edit"}
          handleSubmit={handleEditClick}
        />
      </div>
      <div className="border-2 border-gray-200 p-2 rounded-md sm:h-[30vh] sm:overflow-y-auto md:h-[55vh] overflow-y-auto">
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
