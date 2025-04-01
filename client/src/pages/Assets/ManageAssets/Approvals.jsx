import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import DangerButton from "../../../components/DangerButton";
import SecondaryButton from "../../../components/SecondaryButton";
import MuiModal from "../../../components/MuiModal";

const Approvals = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const handleActionClick = (action, asset) => {
    setSelectedAction(action);
    setSelectedAsset(asset);
    setOpenDialog(true);
  };

  const handleConfirmAction = () => {
    if (selectedAction === "approve") {
      // Implement your approve logic here
      console.log(`Asset ${selectedAsset.assetNumber} approved!`);
    } else if (selectedAction === "reject") {
      // Implement your reject logic here
      console.log(`Asset ${selectedAsset.assetNumber} rejected!`);
    }

    // Close the dialog after action
    setOpenDialog(false);
  };

  const assetsColumns = [
    { field: "id", headerName: "ID", width: 100 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "assigneeName", headerName: "Assignee Name", width: 150 },
    { field: "assetNumber", headerName: "Asset Number", width: 150 },
    { field: "category", headerName: "Category", width: 150 },
    { field: "brand", headerName: "Brand", width: 150 },
    { field: "location", headerName: "Location", width: 150 },
    { field: "status", headerName: "Status", width: 150 },
    { field: "assignmentDate", headerName: "Assignment Date", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2 items-center">
            <button
              className="p-2 py-2 bg-primary rounded-md text-white text-content leading-5"
              onClick={() => handleActionClick("approve", params.data)}
            >
              Approve
            </button>
            <button
              className="p-2 py-2 bg-red-200 rounded-md text-red-600 text-content leading-5"
              onClick={() => handleActionClick("reject", params.data)}
            >
              Reject
            </button>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      id: 1,
      department: "HR",
      assetNumber: "L0001",
      assigneeName: "John Doe",
      category: "Laptop",
      brand: "Lenovo",
      location: "ST-701",
      status: "Active",
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
      assignmentDate: "21/11/2024",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Assigned Assets"}
          data={rows}
          columns={assetsColumns}
        />
      </div>

      {/* Confirmation Dialog */}
      <MuiModal
        title={`Confirm ${selectedAction}`}
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <div className="flex flex-col gap-4">
          <div>
            Are you sure you want to <strong>{selectedAction}</strong> this
            asset?
          </div>
          <div className="flex justify-center items-center gap-4">
            <PrimaryButton title={"No"} handleSubmit={handleConfirmAction} />
            <DangerButton
              title={"Yes"}
              handleSubmit={() => setOpenDialog(false)}
            />
          </div>
        </div>
      </MuiModal>
    </div>
  );
};

export default Approvals;
