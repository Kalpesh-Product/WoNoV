import { useState } from "react";
import {
  TextField,
  MenuItem,
  Select,
  Typography,
  IconButton,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  AvatarGroup,
  Avatar,
  Menu,
  TableBody,
  Autocomplete,
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { DesktopDatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { BsThreeDotsVertical } from "react-icons/bs";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { useNavigate } from "react-router-dom";

const intialProjects = [
  {
    id: 1,
    title: "WoNo Website",
    priority: "HIGH",
    startDate: "17th Nov, 2020",
    deadline: "21st May, 2028",
    assignees: {
      Aiwinraj: {
        dailyTasks: 3,
        monthlyTasks: 4,
        additionalTasks: 5,
      },
      Sankalp: {
        dailyTasks: 2,
        monthlyTasks: 6,
        additionalTasks: 3,
      },
      Aaron: {
        dailyTasks: 4,
        monthlyTasks: 5,
        additionalTasks: 2,
      },
    },
    status: "Upcoming",
  },
  {
    id: 2,
    title: "WoNo Platform",
    priority: "HIGH",
    startDate: "8th Nov, 2021",
    deadline: "15th Sept, 2022",
    assignees: {
      D: {
        dailyTasks: 2,
        monthlyTasks: 5,
        additionalTasks: 3,
      },
      E: {
        dailyTasks: 4,
        monthlyTasks: 3,
        additionalTasks: 6,
      },
      F: {
        dailyTasks: 1,
        monthlyTasks: 7,
        additionalTasks: 2,
      },
    },
    status: "In progress",
  },
  {
    id: 3,
    title: "BIZ Next Website",
    priority: "MEDIUM",
    startDate: "12th Mar, 2024",
    deadline: "23rd Sept, 2026",
    assignees: {
      G: {
        dailyTasks: 3,
        monthlyTasks: 2,
        additionalTasks: 4,
      },
      H: {
        dailyTasks: 5,
        monthlyTasks: 4,
        additionalTasks: 3,
      },
      I: {
        dailyTasks: 2,
        monthlyTasks: 6,
        additionalTasks: 1,
      },
    },
    status: "Pending",
  },
  {
    id: 4,
    title: "CMS",
    priority: "MEDIUM",
    startDate: "12th Mar, 2024",
    deadline: "23rd Sept, 2026",
    assignees: {
      G: {
        dailyTasks: 3,
        monthlyTasks: 2,
        additionalTasks: 4,
      },
      H: {
        dailyTasks: 5,
        monthlyTasks: 4,
        additionalTasks: 3,
      },
      I: {
        dailyTasks: 2,
        monthlyTasks: 6,
        additionalTasks: 1,
      },
    },
    status: "Completed",
  },
];

const categories = ["Upcoming", "In progress", "Pending", "Completed"];
const categoryColors = {
  Upcoming: "text-yellow-500",
  "In progress": "text-blue-500",
  Pending: "text-red-500",
  Completed: "text-green-500",
};

const priorities = ["HIGH", "MEDIUM", "LOW"];

const ProjectList = () => {
  const [projects, setProjects] = useState(intialProjects);
  const [view, setView] = useState("grid");
  const [openModal, setOpenModal] = useState(false);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      description: "",
      assignees: [],
      startDate: null,
      deadline: null,
      priority: "",
      status: "",
    },
  });

  const onSubmit = (data) => {
    if (!data.title || !data.priority || !data.status) {
      alert("Please fill in required fields!");
      return;
    }
  
    // Convert assignees from an array to an object with default values
    const assigneesObject = data.assignees.reduce((acc, name) => {
      acc[name] = {
        dailyTasks: 0,
        monthlyTasks: 0,
        additionalTasks: 0,
      };
      return acc;
    }, {});
  
    const formattedProject = {
      ...data,
      id: projects.length + 1, // Assign new ID
      startDate: data.startDate ? data.startDate.format("YYYY-MM-DD") : "",
      deadline: data.deadline ? data.deadline.format("YYYY-MM-DD") : "",
      assignees: assigneesObject, // Assign transformed assignees object
    };
  
    setProjects([...projects, formattedProject]); // Update projects list
    setOpenModal(false);
    reset(); // Reset the form fields after submission
  };
  

  return (
    <>
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <span className="font-pbold text-title text-primary">Projects</span>
          <div className="flex gap-4">
            <Select
              value={view}
              onChange={(e) => setView(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                paddingX: "5px",
                ".MuiOutlinedInput-input": {
                  padding: "5px", // Customize padding inside the input
                },
              }}
            >
              <MenuItem value="grid">Grid View</MenuItem>
              <MenuItem value="table">Table View</MenuItem>
            </Select>
            <PrimaryButton
              title={"Add Project"}
              handleSubmit={() => setOpenModal(true)}
            />
          </div>
        </div>

        {/* Toggle View */}
        {view === "grid" ? (
          <GridView projects={projects} />
        ) : (
          <TableView projects={projects} />
        )}
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Add Project"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Project Name */}
          <Controller
            name="title"
            control={control}
            rules={{ required: "Project Name is required" }}
            render={({ field, fieldState }) => (
              <TextField
                size="small"
                slotProps={{ inputLabel: { size: "small" } }}
                {...field}
                label="Project Name"
                value={field.value || []} 
                fullWidth
                sx={{ fontSize: "10px" }}
                margin="dense"
                error={!!fieldState.error}
                helperText={fieldState.error?.message}
              />
            )}
          />

          {/* Project Description */}
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <TextField
                size="small"
                {...field}
                label="Project Description"
                fullWidth
                margin="dense"
                multiline
                rows={3}
              />
            )}
          />

          {/* Assignees */}
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

          {/* Date Pickers */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Start Date"
                  slotProps={{ textField: { size: "small" } }}
                  value={field.value}
                  onChange={field.onChange}
                  renderInput={(params) => (
                    <TextField size="small" {...params} fullWidth />
                  )}
                />
              )}
            />
            <Controller
              name="deadline"
              control={control}
              render={({ field }) => (
                <DesktopDatePicker
                  label="Due Date"
                  value={field.value}
                  slotProps={{ textField: { size: "small" } }}
                  onChange={field.onChange}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              )}
            />
          </LocalizationProvider>

          {/* Priority Dropdown */}
          <Controller
            name="priority"
            control={control}
            rules={{ required: "Priority is required" }}
            render={({ field }) => (
              <Select {...field} fullWidth displayEmpty size="small">
                <MenuItem value="" disabled>
                  Select Priority
                </MenuItem>
                {priorities.map((p) => (
                  <MenuItem key={p} value={p}>
                    {p}
                  </MenuItem>
                ))}
              </Select>
            )}
          />

          {/* Status Dropdown */}
          <Controller
            name="status"
            control={control}
            rules={{ required: "Status is required" }}
            render={({ field }) => (
              <Select {...field} fullWidth displayEmpty size="small">
                <MenuItem value="" disabled>
                  Select Status
                </MenuItem>
                {categories.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
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

// Grid View Component
const GridView = ({ projects }) => {
  return (
    <div className="grid grid-cols-4 gap-6">
      {categories.map((category) => (
        <div key={category} className="w-full">
          <div className="p-4 pl-0 border-r-2 border-gray-300 mb-4">
            <span
              className={`text-subtitle font-pmedium ${categoryColors[category]}`}
            >
              {category}
            </span>
          </div>
          {projects
            .filter((p) => p.status === category)
            .map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
        </div>
      ))}
    </div>
  );
};

// Table View Component
const TableView = ({ projects }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Project</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Priority</TableCell>
            <TableCell>Start Date</TableCell>
            <TableCell>Deadline</TableCell>
            <TableCell>Assignees</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>{project.title}</TableCell>
              <TableCell>{project.status}</TableCell>
              <TableCell>{project.priority}</TableCell>
              <TableCell>{project.startDate || "N/A"}</TableCell>
              <TableCell>{project.deadline || "N/A"}</TableCell>

              <TableCell>
                <AvatarGroup max={4}>
                  {Object.keys(project.assignees).map((name, index) => (
                    <Avatar key={index}>{name[0]}</Avatar>
                  ))}
                </AvatarGroup>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

// Project Card Component for Grid View
const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-3 mb-4 border border-gray-200 h-64 flex flex-col justify-between">
      <div className="flex justify-between items-center">
        <span className="font-pmedium text-subtitle">{project.title}</span>
        <ProjectMenu project={project} />
      </div>
      <div>
        <span
          className={`px-2 py-1 text-content font-pmedium rounded-md ${getPriorityClass(
            project.priority
          )}`}
        >
          {project.priority}
        </span>
      </div>
      <Typography variant="body2">
        <strong>Started:</strong> {project.startDate || "N/A"}
      </Typography>
      <Typography variant="body2">
        <strong>Deadline:</strong> {project.deadline || "N/A"}
      </Typography>

      <div className="mt-3 flex flex-col">
        <Typography variant="body2" className="text-gray-500 font-semibold">
          Assignees:
        </Typography>
        <div className="flex justify-start">
          <AvatarGroup max={4}>
            {Object.keys(project.assignees).map((name, index) => (
              <Avatar
                key={index}
                sx={{
                  bgcolor: "gray",
                  width: 23,
                  height: 23,
                  fontSize: "10px",
                }}
              >
                {name[0]}
              </Avatar>
            ))}
          </AvatarGroup>
        </div>
      </div>
    </div>
  );
};

// Dropdown Menu for Actions
const ProjectMenu = ({ project }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleEditClick = () => {
    setAnchorEl(null);
    navigate(`/app/tasks/project-list/edit-project/${project.id}`, {
      state: { project },
    }); // Pass project data
  };
  return (
    <>
      <IconButton
        sx={{ padding: 0, fontSize: "20px" }}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <BsThreeDotsVertical />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={handleEditClick}>Edit Project</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Delete Project</MenuItem>
      </Menu>
    </>
  );
};

// Helper for priority colors
const getPriorityClass = (priority) => {
  return priority === "HIGH"
    ? "bg-red-100 text-red-600"
    : priority === "MEDIUM"
    ? "bg-yellow-100 text-yellow-600"
    : "bg-green-100 text-green-600";
};

export default ProjectList;
