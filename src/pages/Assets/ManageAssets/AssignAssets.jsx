import React, { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { TextField, MenuItem } from "@mui/material";

const AssignAssets = () => {
  const [openModal, setOpenModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Sample data for assignment types and departments
  const assignTypes = ["Rental", "Permanent"];
  const locations = ["ST", "DTC"];
  const locationTypes = ["Front Desk", "Cabin", "Meeting Room"];
  const departments = [
    "HR",
    "IT",
    "Finance",
    "Marketing",
    "Admin",
    "Operations",
  ];
  const floors = ["ST-701A", "ST-701B", "ST-601A", "ST501A", "G-1"];
  const meetingRooms = [
    "Baga",
    "Arambol",
    "Madrid",
    "Vagator",
    "San Francisco",
  ];

  // Handle Assign button click
  const handleOpenModal = (asset) => {
    setSelectedAsset(asset);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedAsset(null);
  };

  const assetsColumns = [
    { field: "id", headerName: "ID", flex: 1 },
    { field: "department", headerName: "Department", flex: 1 },
    { field: "assetNumber", headerName: "Asset Number", flex: 1 },
    { field: "category", headerName: "Category", flex: 1 },
    { field: "brand", headerName: "Brand", flex: 1 },
    { field: "price", headerName: "Price", flex: 1 },
    { field: "quantity", headerName: "Quantity", flex: 1 },
    { field: "purchaseDate", headerName: "Purchase Date", flex: 1 },
    { field: "warranty", headerName: "Warranty (Months)", flex: 1 },
    { field: "location", headerName: "Location", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <PrimaryButton
            title={"Assign"}
            handleSubmit={() => handleOpenModal(params.data)}
          />
        </div>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      department: "HR",
      assetNumber: "0001",
      category: "Laptop",
      brand: "Dell",
      price: "₹55,000",
      quantity: 2,
      purchaseDate: "02/01/2025",
      warranty: 12,
      location: "ST-701B",
      modelName: "Dell",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "11:36 AM",
    },
    {
      id: 2,
      department: "IT",
      assetNumber: "0002",
      category: "Printer",
      brand: "HP",
      price: "₹15,000",
      quantity: 1,
      purchaseDate: "15/02/2025",
      warranty: 24,
      location: "ST-601",
      modelName: "HP",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "12:00 PM",
    },
    {
      id: 3,
      department: "Finance",
      assetNumber: "0003",
      category: "Chair",
      brand: "Godrej",
      price: "₹5,000",
      quantity: 4,
      purchaseDate: "10/03/2025",
      warranty: 36,
      location: "ST-701",
      modelName: "Godrej",
      status: "Active",
      assignmentDate: "02/03/2025",
      assignmentTime: "10:30 AM",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"assetNumber"}
          tableTitle={"Assign Assets"}
          data={rows}
          columns={assetsColumns}
        />
      </div>

      {/* Modal for Assigning Asset */}
      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title="Assign Asset">
        {selectedAsset && (
          <div className="flex flex-col px-4">
            {/* Asset Details Section */}
            <div className="flex flex-col gap-4">
              <div className="text-subtitle font-semibold">Asset Details</div>
              <div className="grid grid-cols-2 gap-8 px-2 pb-8 border-b-default border-borderGray">
                <div className="flex items-center justify-between">
                  <span className="text-content">Asset Number</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.assetNumber}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Brand Name</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.brand}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Model Name</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.modelName}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Location</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.location}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Status</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Assignment Date</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.assignmentDate}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-content">Assignment Time</span>
                  <span className="text-content text-gray-500">
                    {selectedAsset.assignmentTime}
                  </span>
                </div>
              </div>
            </div>

            {/* Assignee Details Section */}
            <div className="flex flex-col gap-4 py-4">
              <div className="text-subtitle font-semibold">
                Assignee Details
              </div>
              <div className="grid grid-cols-2 gap-8 px-2">
                <TextField size="small" select label="Assign Type" fullWidth>
                  {assignTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField select label="Department" size="small" fullWidth>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField size="small" label="Assignee Name" fullWidth />
                {/* <TextField
                  label="Location"
                  value={selectedAsset.location}
                  fullWidth
                  size="small"
                  InputProps={{ readOnly: true }}
                /> */}

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
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-4 flex justify-center">
              <PrimaryButton title="Submit" handleSubmit={handleCloseModal} />
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignAssets;
