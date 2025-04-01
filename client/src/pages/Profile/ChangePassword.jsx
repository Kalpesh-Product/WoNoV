import React, { useState } from "react";
import TextField from "@mui/material/TextField"; // Assuming you're using Material-UI for TextField
import PrimaryButton from "../../components/PrimaryButton";
import useAuth from "../../hooks/useAuth";
import { api } from "../../utils/axios";
import { toast } from "sonner";

const ChangePassword = ({ pageTitle }) => {
  const { auth } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordVerified, setPasswordVerified] = useState(false);

  const handleChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
    setErrorMessage(""); // Clear errors on input change
    setSuccessMessage(""); // Clear success message on input change
  };

  const handlePasswordCheck = async () => {
    try {
      if (!formData.currentPassword) {
        setErrorMessage("Please provide your current password");
        return;
      }
      const response = await api.post("/api/auth/check-password", {
        currentPassword: formData.currentPassword,
        id: auth.user._id,
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
      await api.post("/api/auth/update-password", {
        id: auth.user._id,
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
      {/* Header */}
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary">Change password</span>
      </div>

      {/* Current Password Field */}
      <div className="mb-4 w-full flex justify-start items-center gap-4">
        <TextField
          size="small"
          label="Current Password"
          type="password"
          disabled={passwordVerified}
          sx={{ width: "49.3%" }}
          value={formData.currentPassword}
          onChange={(e) => handleChange("currentPassword", e.target.value)}
          required
        />
        {!passwordVerified && (
          <PrimaryButton
            title="Verify"
            type="button"
            handleSubmit={handlePasswordCheck}
          />
        )}
      </div>

      {/* New Password and Confirm Password Fields */}
      <div className="grid grid-cols-2 gap-4">
        <TextField
          size="small"
          label="New Password"
          type="password"
          value={formData.newPassword}
          onChange={(e) => handleChange("newPassword", e.target.value)}
          fullWidth
          required
        />
        <TextField
          size="small"
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          fullWidth
          required
        />
      </div>

      {/* Error and Success Messages */}
      <div className="mt-4">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        {successMessage && <p className="text-green-500">{successMessage}</p>}
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
        <PrimaryButton title={"Submit"} handleSubmit={handlePasswordChange}>
          Change Password
        </PrimaryButton>
      </div>
    </div>
  );
};

export default ChangePassword;
