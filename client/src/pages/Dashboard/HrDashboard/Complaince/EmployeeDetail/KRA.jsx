import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const KRA = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewKRA, setViewKRA] = useState(null);
  const [newKRA, setNewKRA] = useState("");
  const [rows, setRows] = useState([
    {
      id: 1,
      kra: "2025-01-01",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "2025-01-31",
      status: "Reviewed",
      comments: "Met all goals",
    },
    {
      id: 2,
      kra: "2025-02-01",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "2025-02-28",
      status: "Pending",
      comments: "Awaiting feedback",
    },
    {
      id: 3,
      kra: "2025-03-01",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "2025-03-29",
      status: "Reviewed",
      comments: "Great improvement",
    },
    {
      id: 4,
      kra: "2025-04-01",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "2025-04-30",
      status: "In Progress",
      comments: "",
    },
    {
      id: 5,
      kra: "2025-05-01",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "2025-05-31",
      status: "Pending",
      comments: "",
    },
  ]);

  const handleAddKRA = () => {
    if (newKRA.trim()) {
      const newEntry = {
        id: rows.length + 1,
        kra: newKRA,
        assignedBy: "Auto",
        reviewDate: "TBD",
        status: "Pending",
        comments: "",
      };
      setRows([newEntry, ...rows]);
      setNewKRA("");
      setModalOpen(false);
      toast.success("Successfully added KRA");
    }
  };

  const handleViewKRA = (rowData) => {
    setViewKRA(rowData);
    setViewModalOpen(true);
  };

  const kraColumn = [
    {
      headerName: "S. No",
      field: "serialNumber",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    { field: "kra", headerName: "KRAs", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewKRA(params.data)}
          >
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          buttonTitle="Add KRA"
          searchColumn="kra"
          tableTitle={`${name}'s KRA List`}
          data={rows}
          columns={kraColumn}
          handleClick={() => setModalOpen(true)}
        />
      </div>

      {/* Modal for adding KRA */}
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New KRA"
      >
        <div>
          <TextField
            label="KRA Period (e.g. 2025-06-01)"
            fullWidth
            value={newKRA}
            onChange={(e) => setNewKRA(e.target.value)}
          />
        </div>
        <PrimaryButton
          handleSubmit={handleAddKRA}
          type={"submit"}
          title={"Submit"}
          className="w-full mt-2"
        />
      </MuiModal>

      {/* Modal for viewing KRA */}
      <MuiModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="KRA Detail"
      >
        {viewKRA && (
          <div className="space-y-3 text-sm">
            <div><strong>Period:</strong>&nbsp; {viewKRA.kra}</div>
            <div><strong>Assigned By:</strong>&nbsp; {viewKRA.assignedBy}</div>
            <div><strong>Review Date:</strong>&nbsp; {viewKRA.reviewDate}</div>
            <div><strong>Comments:</strong>&nbsp; {viewKRA.comments || "No comments"}</div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default KRA;
