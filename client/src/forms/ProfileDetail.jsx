import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";

export const PersonalDetails = ({ formData, handleChange, isEditable }) => {
  return (
    <div>
      <h3 className="text-subtitle font-pmedium my-4">
        Personal and Family Details
      </h3>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
        <TextField
          size="small"
          disabled={!isEditable}
          label="Name"
          value={formData.name || ""}
          onChange={(e) => handleChange("name", e.target.value)}
          fullWidth
          required
        />

        <TextField
          name="gender"
          select
          disabled={!isEditable}
          label="Select Gender"
          size="small"
          value={formData.gender || ""}
          onChange={(e) => handleChange("gender", e.target.value)}
        >
          <MenuItem value="" disabled>
            Select Gender
          </MenuItem>
          <MenuItem value="Male">Male</MenuItem>
          <MenuItem value="Female">Female</MenuItem>
        </TextField>

        <DesktopDatePicker
          label="Date of Birth"
          disabled={!isEditable}
          // inputFormat="DD/MM/YYYY"
          slotProps={{ textField: { size: "small" } }}
          value={formData.dob}
          onChange={(newValue) => handleChange("dob", newValue)}
        />
        <TextField
          size="small"
          disabled={!isEditable}
          label="Father's Name"
          value={formData.fatherName || ""}
          onChange={(e) => handleChange("fatherName", e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          disabled={!isEditable}
          label="Mother's Name"
          value={formData.motherName || ""}
          onChange={(e) => handleChange("motherName", e.target.value)}
          fullWidth
        />
      </div>
    </div>
  );
};

export const WorkDetails = ({ formData, handleChange, isEditable }) => {
  return (
    <div>
      <h3 className="text-subtitle font-pmedium my-4">Work Details</h3>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopDatePicker
            name="startDate"
            label="Start Date"
            inputFormat="DD/MM/YYYY"
            disabled={!isEditable} 
            slotProps={{ textField: { size: "small" } }}
            value={formData.startDate}
            onChange={(newValue) => handleChange("startDate", newValue)}
            renderInput={(params) => (
              <TextField
                name="startDate"
                size="small"
                disabled={!isEditable}   
                {...params}
                fullWidth
                required
              />
            )}
          />
          <TextField
            name="department"
            size="small"
            fullWidth
            disabled={true}
            label="Department"
            value={formData.department || ""}
            onChange={(e) => handleChange("department", e.target.value)}
          >
            <MenuItem value="" disabled>
              Select Department
            </MenuItem>
            {formData.departments &&
              formData.departments.map((dept) => (
                <MenuItem key={dept._id} value={dept.name}>
                  {dept.name}
                </MenuItem>
              ))}
          </TextField>

          <TextField
            name="role"
            size="small"
            fullWidth
            disabled={true}
            label="Role"
            value={formData.role || ""}
            onChange={(e) => handleChange("role", e.target.value)}
          >
            <MenuItem value="">Select Role</MenuItem>
            {formData.roles &&
              formData.roles.map((role) => (
                <MenuItem key={role._id} value={role.roleTitle}>
                  {role.roleTitle}
                </MenuItem>
              ))}
          </TextField>
        </LocalizationProvider>
      </div>
    </div>
  );
};

export const KycDetails = ({ formData, handleChange, isEditable }) => {
  return (
    <div>
      <h3 className="text-subtitle font-pmedium my-4">KYC Details</h3>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
        <TextField
          size="small"
          disabled={!isEditable}
          label="Aadhaar Number"
          value={formData?.aadhaar || ""}
          onChange={(e) => handleChange("aadhaar", e.target.value)}
          fullWidth
          required
        />
        <TextField
          size="small"
          disabled={!isEditable}
          label="PAN Number"
          value={formData?.pan || ""}
          onChange={(e) => handleChange("pan", e.target.value)}
          fullWidth
          required
        />
      </div>
    </div>
  );
};

export const BankDetails = ({ formData, handleChange, isEditable }) => {
  return (
    <div>
      <h3 className="text-subtitle font-pmedium my-4">Bank Details</h3>
      <div className="grid lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1 gap-4">
        <TextField
          size="small"
          disabled={!isEditable}
          label="Bank Name"
          value={formData?.bankName || ""}
          onChange={(e) => handleChange("bankName", e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          disabled={!isEditable}
          label="Account Number"
          value={formData?.accountNumber || ""}
          onChange={(e) => handleChange("accountNumber", e.target.value)}
          fullWidth
        />
        <TextField
          size="small"
          disabled={!isEditable}
          label="IFSC Code"
          value={formData?.ifsc || ""}
          onChange={(e) => handleChange("ifsc", e.target.value)}
          fullWidth
        />
      </div>
    </div>
  );
};
