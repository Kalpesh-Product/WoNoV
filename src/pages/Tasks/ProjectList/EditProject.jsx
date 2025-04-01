import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import AgTable from "../../../components/AgTable"; // ✅ Import AgTable
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import {
  TextField,
  Button,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import PrimaryButton from "../../../components/PrimaryButton";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const EditProject = () => {
  const { id } = useParams(); // Get project ID from URL
  const location = useLocation(); // Get project details from state
  const [openModal, setOpenModal] = useState(false);
  const axios = useAxiosPrivate()

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      taskName: "",
      description: "",
      taskType: "",
      assignees: [],
      dueDate: null,
      priority: "",
    },
  });


  const onSubmit = (data) => {
    console.log("Task Data:", data);
    reset(); // Reset form after submission
    setOpenModal(false);
  };

  const project = location.state?.project; // Extract project data

  console.log(project);

  if (!project) {
    return <Typography variant="h6">Project not found!</Typography>;
  }

  // ✅ Convert project data: Each assignee becomes a separate row
  const projectData = Object.keys(project.assignees).map((assignee, index) => ({
    id: `${project.id}-${index}`, // Unique ID for AgGrid
    assignee, // Individual assignee
    dailyTasks: project.assignees[assignee].dailyTasks,
    monthlyTasks: project.assignees[assignee].monthlyTasks,
    additionalTasks: project.assignees[assignee].additionalTasks,
  }));

  // ✅ Define AgGrid columns
  const columnDefs = [
    { field: "assignee", headerName: "Assignee", flex: 2 }, // Move Assignees to First Column
    { field: "dailyTasks", headerName: "Daily Tasks", flex: 1 },
    { field: "monthlyTasks", headerName: "Monthly Tasks", flex: 1 },
    { field: "additionalTasks", headerName: "Additional Tasks", flex: 1 },
  ];

  return (
    <>
      <div className="p-4">
        {/* ✅ Render AgTable with transformed project details */}
        <AgTable
          buttonTitle={"Add Task"}
          data={projectData}
          search={true}
          columns={columnDefs}
          handleClick={() => setOpenModal(true)}
          tableTitle="Project Details"
          paginationPageSize={5}
          enableCheckbox={false} // Disable checkbox selection
        />
      </div>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Add Task"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Task Name */}
          <Controller
            name="taskName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Task Name"
                fullWidth
                required
              />
            )}
          />

          {/* Task Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Task Description"
                multiline
                rows={3}
                fullWidth
                required
              />
            )}
          />

          {/* Task Type Dropdown */}
          <Controller
            name="taskType"
            control={control}
            render={({ field }) => (
              <Select {...field} displayEmpty required size="small">
                <MenuItem value="" disabled>
                  Select Type
                </MenuItem>
                <MenuItem value="development">Development</MenuItem>
                <MenuItem value="design">Design</MenuItem>
                <MenuItem value="testing">Testing</MenuItem>
                <MenuItem value="research">Research</MenuItem>
              </Select>
            )}
          />

          {/* Assignees (Multi-Select) */}
          <Controller
            name="assignees"
            control={control}
            render={({ field }) => (
              <Autocomplete
                {...field}
                multiple
                options={["Aiwinraj", "Sankalp", "Aaron", "Kalpesh", "Muskan"]} // Example list
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Assignees"
                    fullWidth
                    size="small"
                  />
                )}
                onChange={(_, value) => field.onChange(value)}
              />
            )}
          />

          {/* Due Date Picker */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="dueDate"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Due Date"
                  value={field.value}
                  slotProps={{ textField: { size: "small" } }}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField size="small" {...params} fullWidth />
                  )}
                />
              )}
            />
          </LocalizationProvider>

          {/* Priority Dropdown */}
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select {...field} required displayEmpty size="small">
                <MenuItem value="" disabled>
                  Select Priority
                </MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            )}
          />
          <div className="flex justify-center items-center">
            <PrimaryButton title={"Submit"} type={"submit"} />
          </div>
        </form>
      </MuiModal>
    </>
  );
};

export default EditProject;
