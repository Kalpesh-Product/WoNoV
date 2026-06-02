import React, { useState } from "react";
import TextField from "@mui/material/TextField"; // Assuming you're using Material-UI for TextField
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PrimaryButton from "../../components/PrimaryButton";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageFrame from "../../components/Pages/PageFrame";

const ChangePassword = ({ pageTitle }) => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const userDepartments = auth?.user?.departments || [];
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const canChangePassword =
    userDepartments.some((dept) => dept?.name?.trim().toLowerCase() === "tech") ||
    roleTitles.some((roleTitle) => roleTitle?.includes("tech employee"));
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    if (field === "currentPassword") {
      setPasswordVerified(false);
    }
    setErrorMessage(""); // Clear errors on input change
    setSuccessMessage(""); // Clear success message on input change
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const getPasswordFieldProps = (field, disabled) => ({
    type: showPasswords[field] ? "text" : "password",
    disabled,
    InputProps: {
      endAdornment: (
        <InputAdornment position="end">
          <IconButton
            aria-label={`toggle ${field}`}
            onClick={() => togglePasswordVisibility(field)}
            edge="end"
            size="small"
            disabled={disabled}
          >
            {showPasswords[field] ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    },
  });

  const handlePasswordCheck = async () => {
    try {
      if (!formData.currentPassword) {
        setErrorMessage("Please provide your current password");
        return;
      }
      const response = await axios.post("/api/users/check-password", {
        currentPassword: formData.currentPassword,
      });
      toast.success(response.data.message);
      setPasswordVerified(true);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const handlePasswordChange = async () => {
    try {
      const { currentPassword, newPassword, confirmPassword } = formData;

      // Validate inputs
      if (!currentPassword || !newPassword || !confirmPassword) {
        setErrorMessage("All fields are required.");
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage("New password and confirm password do not match.");
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage("New password must be at least 6 characters long.");
        return;
      }

      // Simulate password change success
      await axios.post("/api/users/update-password", {
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });
      setSuccessMessage("Password changed successfully!");
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordVerified(false);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  return (
    <div>
      <PageFrame>
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <span className="text-title font-pmedium text-primary uppercase">
            Change password
          </span>
        </div>
        <div>
          {/* Current Password Field */}
          <div className="mb-4 w-full flex justify-start items-center gap-4">
            <TextField
              size="small"
              label="Current Password"
              {...getPasswordFieldProps(
                "currentPassword",
                !canChangePassword || passwordVerified
              )}
              sx={{ width: "49.3%" }}
              value={formData.currentPassword}
              onChange={(e) => handleChange("currentPassword", e.target.value)}
              required
            />
            {!passwordVerified && (
              <PrimaryButton
                title="Verify"
                type="button"
                disabled={!canChangePassword}
                handleSubmit={handlePasswordCheck}
              />
            )}
          </div>

          {/* New Password and Confirm Password Fields */}
          <div className="grid grid-cols-2 gap-4">
            <TextField
              size="small"
              label="New Password"
              {...getPasswordFieldProps(
                "newPassword",
                !canChangePassword || !passwordVerified
              )}
              value={formData.newPassword}
              onChange={(e) => handleChange("newPassword", e.target.value)}
              fullWidth
              required
            />
            <TextField
              size="small"
              label="Confirm Password"
              {...getPasswordFieldProps(
                "confirmPassword",
                !canChangePassword || !passwordVerified
              )}
              value={formData.confirmPassword}
              onChange={(e) => handleChange("confirmPassword", e.target.value)}
              fullWidth
              required
            />
          </div>

          {/* Error and Success Messages */}
          <div className="mt-4">
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {successMessage && (
              <p className="text-green-500">{successMessage}</p>
            )}
          </div>

          <div className="flex flex-col gap-3 text-gray-500">
            <span className="text-subtitle">Password Requirements</span>
            <ul className="text-content list-disc pl-5">
              <li>Must be at least 8 characters long.</li>
              <li>Should include both uppercase and lowercase letters.</li>
              <li>Must contain at least one number or special character.</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="mt-4 flex justify-center items-center">
            <PrimaryButton
              title={"Submit"}
              handleSubmit={handlePasswordChange}
              disabled={!canChangePassword || !passwordVerified}>
              Change Password
            </PrimaryButton>
          </div>
        </div>
      </PageFrame>
    </div>
  );
};

export default ChangePassword;
