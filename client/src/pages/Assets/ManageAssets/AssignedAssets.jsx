import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Button,
  Typography,
  Box,
  MenuItem,
  Select,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";

const AssignedAssets = () => {
  const locations = ["ST", "DTC"];
  const locationTypes = ["Front Desk", "Cabin", "Meeting Room"];

  const floors = ["ST-701A", "ST-701B", "ST-601A", "ST501A", "G-1"];
  const meetingRooms = [
    "Baga",
    "Arambol",
    "Madrid",
    "Vagator",
    "San Francisco",
  ];

  const [assetRows, setAssetRows] = useState([
    {
      id: 1,
      department: "HR",
      assetNumber: "L0001",
      assigneeName: "John Doe",
      category: "Laptop",
      brand: "Lenovo",
      location: "ST-701",
      status: "Active",
      isRevoked: false,
      assignmentDate: "21/11/2024",
    },
    {
      id: 2,
      department: "IT",
      assetNumber: "P0002",
      assigneeName: "Jane Smith",
      category: "Printer",
      brand: "HP",
      location: "ST-601",
      status: "Revoked",
      isRevoked: true,
      assignmentDate: "21/11/2024",
    },
    {
      id: 3,
      department: "Finance",
      assetNumber: "C0003",
      assigneeName: "Michael Johnson",
      category: "Chair",
      brand: "Godrej",
      location: "ST-701",
      status: "Active",
      isRevoked: false,
      assignmentDate: "21/11/2024",
    },
    {
      id: 4,
      department: "Marketing",
      assetNumber: "B0004",
      assigneeName: "Emily Brown",
      category: "Bottle",
      brand: "Milton",
      location: "ST-702",
      status: "Active",
      isRevoked: false,
      assignmentDate: "21/11/2024",
    },
    {
      id: 5,
      department: "HR",
      assetNumber: "M0005",
      assigneeName: "David Wilson",
      category: "Marker",
      brand: "Camlin",
      location: "ST-602",
      status: "Revoked",
      isRevoked: true,
      assignmentDate: "21/11/2024",
    },
    {
      id: 6,
      department: "Admin",
      assetNumber: "D0006",
      assigneeName: "Sophia Martinez",
      category: "Desk",
      brand: "IKEA",
      location: "ST-701",
      status: "Active",
      isRevoked: false,
      assignmentDate: "21/11/2024",
    },
    {
      id: 7,
      department: "Operations",
      assetNumber: "S0007",
      assigneeName: "Chris Evans",
      category: "Scanner",
      brand: "Canon",
      location: "ST-701",
      status: "Revoked",
      isRevoked: true,
      assignmentDate: "21/11/2024",
    },
  ]);

  // Modal state
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [assetToRevoke, setAssetToRevoke] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  // React Hook Form
  const { control, handleSubmit, reset } = useForm();

  // 🔥 Reset the form when `selectedAsset` changes
  useEffect(() => {
    if (selectedAsset) {
      reset({
        assignType: "", // Default value
        department: selectedAsset.department,
        assigneeName: selectedAsset.assigneeName,
        location: selectedAsset.location,
      });
    }
  }, [selectedAsset, reset]);

  // 🔥 Fix: Force re-render after revocation
  // const [updatedRows, setUpdatedRows] = useState(assetRows);

  // Function to handle "Revoke" action
  // const handleRevoke = (id) => {
  //   setAssetRows((prevRows) =>
  //     prevRows.map((row) =>
  //       row.id === id ? { ...row, status: "Revoked", isRevoked: true } : row
  //     )
  //   );
  // };

  // Function to handle "Revoke" action
  const handleRevoke = () => {
    if (assetToRevoke) {
      setAssetRows((prevRows) =>
        prevRows.map((row) =>
          row.id === assetToRevoke.id
            ? { ...row, status: "Revoked", isRevoked: true }
            : row
        )
      );
    }
    setConfirmModalOpen(false);
  };

  // Function to show the confirmation modal
  const confirmRevoke = (asset) => {
    setAssetToRevoke(asset);
    setConfirmModalOpen(true);
  };

  // Function to show details modal
  const showDetails = (asset) => {
    setSelectedAsset(asset);
    setIsEditMode(false); // Default to view mode
    setDetailsModalOpen(true);
  };

  // Function to handle edit save
  const handleSave = (data) => {
    setAssetRows((prevRows) =>
      prevRows.map((row) =>
        row.id === selectedAsset.id ? { ...row, ...data } : row
      )
    );
    setDetailsModalOpen(false);
  };

  // 🔄 Ensures AgTable re-renders when `assetRows` changes
  // useEffect(() => {
  //   setUpdatedRows([...assetRows]); // Force UI update
  // }, [assetRows]);

  const assetsColumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "assigneeName", headerName: "Assignee Name", width: 150 },
    { field: "assetNumber", headerName: "Asset Number", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "brand", headerName: "Brand", width: 150 },
    { field: "location", headerName: "Location", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    { field: "assignmentDate", headerName: "Assignment Date", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        // const { id, isRevoked } = params.data;
        const asset = params.data;
        // if (isRevoked) return null;
        return (
          <div className="p-2 mb-2 flex gap-2 items-center">
            <button
              className="p-2 py-2 bg-primary rounded-md text-white text-content leading-5"
              onClick={() => showDetails(asset)}>
              Details
            </button>
            {!asset.isRevoked && (
              <button
                className="p-2 py-2 bg-red-200 rounded-md text-red-600 text-content leading-5"
                onClick={() => confirmRevoke(asset)}>
                Revoke
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"assetNumber"}
          tableTitle={"Assigned Assets"}
          // data={updatedRows} // ✅ Pass updatedRows instead of assetRows
          data={assetRows}
          columns={assetsColumns}
          rowStyle={(params) => ({
            backgroundColor: params.data.isRevoked ? "#f2f2f2" : "white",
            color: params.data.isRevoked ? "#a0a0a0" : "black",
          })}
        />
      </div>

      {/* Confirmation Modal for Revoking */}
      <MuiModal
        open={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Revocation">
        <Typography variant="body1">
          Are you sure you want to revoke this asset assignment?
        </Typography>
        <Box display="flex" justifyContent="flex-end" mt={3} gap={2}>
          <SecondaryButton
            title={"No"}
            // variant="contained"
            // color="secondary"
            handleSubmit={() => setConfirmModalOpen(false)}
          />
          <Button variant="contained" color="error" onClick={handleRevoke}>
            Yes, Revoke
          </Button>
        </Box>
      </MuiModal>

      {/* Details/Edit Modal */}
      <MuiModal
        open={isDetailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          reset();
        }}
        title="Assignee Details">
        {selectedAsset && (
          <>
            {!isEditMode ? (
              // 🔹 View Mode
              <div className="grid grid-cols-2 gap-6 px-6 pb-0">
                <div className="flex items-center justify-between">
                  <span className="text-content font-medium">Assign Type</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.assignType}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content font-medium">Department</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.department}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content font-medium">
                    Assignee Name
                  </span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.assigneeName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content font-medium">Location</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content font-medium">Status</span>
                  <span
                    className={`text-content font-semibold ${
                      selectedAsset.status === "Revoked"
                        ? "text-red-500"
                        : "text-green-500"
                    }`}>
                    {selectedAsset.status}
                  </span>
                </div>
                <div className="flex col-span-2 justify-center">
                  <PrimaryButton
                    title={"Edit"}
                    handleSubmit={() => setIsEditMode(true)}
                  />
                </div>
              </div>
            ) : (
              // 🔹 Edit Mode (Form)
              <form
                onSubmit={handleSubmit(handleSave)}
                className="grid grid-cols-2 gap-6 px-6 pb-0">
                <Controller
                  name="assignType"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <Select {...field} size="small" displayEmpty>
                      <MenuItem value="" disabled>
                        Select Assign Type
                      </MenuItem>
                      <MenuItem value="Rental">Rental</MenuItem>
                      <MenuItem value="Permanent">Permanent</MenuItem>
                    </Select>
                  )}
                />

                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Controller
                    name="department"
                    control={control}
                    defaultValue={selectedAsset.department}
                    render={({ field }) => (
                      <Select {...field} label="Department" size="small">
                        <MenuItem value="HR">HR</MenuItem>
                        <MenuItem value="IT">IT</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                        <MenuItem value="Marketing">Marketing</MenuItem>
                        <MenuItem value="Admin">Admin</MenuItem>
                        <MenuItem value="Operations">Operations</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

                <Controller
                  name="assigneeName"
                  control={control}
                  defaultValue={selectedAsset.assigneeName}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Assignee Name"
                      fullWidth
                      size="small"
                    />
                  )}
                />

                {/* <FormControl fullWidth>
                  <InputLabel>Location</InputLabel>
                  <Controller
                    name="location"
                    control={control}
                    defaultValue={selectedAsset.location}
                    render={({ field }) => (
                      <Select {...field} label="Location" size="small">
                        <MenuItem value="ST-601">ST</MenuItem>
                        <MenuItem value="ST-602">DTC</MenuItem>
                  
                      </Select>
                    )}
                  />
                </FormControl> */}

                <TextField select label="Location" size="small" fullWidth>
                  {locations.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField select label="Floor" size="small" fullWidth>
                  {floors.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="Location Type" size="small" fullWidth>
                  {locationTypes.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="Meeting Room" size="small" fullWidth>
                  {meetingRooms.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>

                <div className="flex gap-2 col-span-2">
                  <div className="w-1/2 justify-items-end">
                    <PrimaryButton title={"Save"} type="submit" />
                  </div>
                  <div className="w-1/2">
                    <SecondaryButton
                      title={"Cancel"}
                      handleSubmit={() => {
                        setIsEditMode(false);
                        reset();
                      }}
                    />
                  </div>
                </div>
              </form>
            )}
          </>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignedAssets;
