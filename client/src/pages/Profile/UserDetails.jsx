import { useState } from "react";
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
} from "@mui/material";
import DetalisFormatted from "../../components/DetalisFormatted";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { DatePicker } from "@mui/x-date-pickers";
import useAuth from "../../hooks/useAuth";
import dayjs from "dayjs";

const UserDetails = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const empId = auth.user.empId;

  const { data: userDetails, isLoading } = useQuery({
    queryKey: ["userDetails"],
    queryFn: async () => {
      const res = await axios.get(`/api/users/fetch-single-user/${empId}`);
      return res.data;
    },
  });

  const { control, handleSubmit, reset } = useForm({
    defaultValues: userDetails,
  });

  const mutation = useMutation({
    mutationFn: async (updatedData) => {
      return axios.put(`/api/users/update/${empId}`, updatedData);
    },
    onSuccess: () => {
      setEditMode(false);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  if (isLoading || !userDetails) return <div>Loading...</div>;

  const fields = [
    { name: "firstName", label: "First Name" },
    { name: "middleName", label: "Middle Name" },
    { name: "lastName", label: "Last Name" },
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: ["Male", "Female", "Other"],
    },
    { name: "dob", label: "Date of Birth", type: "date" },
    { name: "employeeID", label: "Employee ID" },
    { name: "mobilePhone", label: "Mobile Phone" },
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "workLocation", label: "Work Location" },
    { name: "employeeType", label: "Employee Type" },
    { name: "department", label: "Department" },
    { name: "jobTitle", label: "Job Title" },
    { name: "jobDescription", label: "Job Description" },
    { name: "shift", label: "Shift" },
    { name: "workSchedulePolicy", label: "Work Schedule Policy" },
    { name: "attendanceSource", label: "Attendance Source" },
    { name: "leavePolicy", label: "Leave Policy" },
    { name: "holidayPolicy", label: "Holiday Policy" },
    { name: "aadharID", label: "Aadhar ID" },
    { name: "pan", label: "PAN" },
    { name: "pFAcNo", label: "PF Account No" },
    { name: "addressLine1", label: "Address Line 1" },
    { name: "addressLine2", label: "Address Line 2" },
    { name: "state", label: "State" },
    { name: "city", label: "City" },
    { name: "pinCode", label: "Pin Code" },
    {
      name: "includeInPayroll",
      label: "Include In Payroll",
      type: "select",
      options: ["Yes", "No"],
    },
    { name: "payrollBatch", label: "Payroll Batch" },
    {
      name: "professionalTaxExemption",
      label: "Professional Tax Exemption",
      type: "select",
      options: ["Yes", "No"],
    },
    {
      name: "includePF",
      label: "Include PF",
      type: "select",
      options: ["Yes", "No"],
    },
    { name: "pFContributionRate", label: "PF Contribution Rate" },
    { name: "employeePF", label: "Employee PF" },
  ];

  return (
    <div>
      {!editMode && (
        <Grid container spacing={2}>
          {fields.map(({ name, label }) => (
            <Grid item xs={6} key={name}>
              <DetalisFormatted title={label} detail={userDetails[name]} />
            </Grid>
          ))}
        </Grid>
      )}

      {editMode && (
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            {fields.map(({ name, label, type, options }) => (
              <Grid item xs={6} key={name}>
                {type === "select" ? (
                  <FormControl fullWidth>
                    <InputLabel>{label}</InputLabel>
                    <Controller
                      name={name}
                      control={control}
                      defaultValue={userDetails[name] || ""}
                      render={({ field }) => (
                        <Select {...field} label={label}>
                          {options.map((opt) => (
                            <MenuItem key={opt} value={opt}>
                              {opt}
                            </MenuItem>
                          ))}
                        </Select>
                      )}
                    />
                  </FormControl>
                ) : type === "date" ? (
                  <Controller
                    name={name}
                    control={control}
                    defaultValue={
                      userDetails[name]
                        ? dayjs(userDetails[name], "DD-MM-YYYY")
                        : null
                    }
                    render={({ field }) => (
                      <DatePicker
                        label={label}
                        format="DD-MM-YYYY"
                        value={field.value}
                        onChange={(date) =>
                          field.onChange(date ? date.format("DD-MM-YYYY") : "")
                        }
                        slotProps={{
                          textField: { fullWidth: true },
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name={name}
                    control={control}
                    defaultValue={userDetails[name] || ""}
                    render={({ field }) => (
                      <TextField fullWidth label={label} {...field} />
                    )}
                  />
                )}
              </Grid>
            ))}
          </Grid>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            className="mt-4"
          >
            Save
          </Button>
          <Button
            variant="outlined"
            onClick={() => setEditMode(false)}
            className="ml-2"
          >
            Cancel
          </Button>
        </form>
      )}

      {!editMode && (
        <Button
          variant="contained"
          onClick={() => {
            reset(userDetails);
            setEditMode(true);
          }}
          className="mt-4"
        >
          Edit
        </Button>
      )}
    </div>
  );
};

export default UserDetails;
