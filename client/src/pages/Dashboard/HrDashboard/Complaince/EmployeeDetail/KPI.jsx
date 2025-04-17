import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../../components/DetalisFormatted";

const KPI = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewKPI, setViewKPI] = useState(null);
  const [newKPI, setNewKPI] = useState("");
  const [rows, setRows] = useState([
    {
      id: 1,
      kpi: "Achieved 90% lead conversion rate",
      assignedBy: "Utkarsha Palkar",
      targetDate: "31-03-2025",
      status: "Completed",
      comments: "Excellent performance",
    },
    {
      id: 2,
      kpi: "Increased client retention by 20%",
      assignedBy: "Utkarsha Palkar",
      targetDate: "15-04-2025",
      status: "In Progress",
      comments: "Need to monitor progress",
    },
    {
      id: 3,
      kpi: "Reduced support response time to under 2 hrs",
      assignedBy: "Utkarsha Palkar",
      targetDate: "10-04-2025",
      status: "Completed",
      comments: "Well-coordinated with support team",
    },
    {
      id: 4,
      kpi: "Completed 5 major releases on time",
      assignedBy: "Utkarsha Palkar",
      targetDate: "01-03-2025",
      status: "Completed",
      comments: "On-time delivery",
    },
    {
      id: 5,
      kpi: "Improved NPS score from 45 to 60",
      assignedBy: "Utkarsha Palkar",
      targetDate: "01-05-2025",
      status: "Pending",
      comments: "",
    },
  ]
  );


  const handleAddKPI = () => {
    if (newKPI.trim()) {
      const newEntry = {
        id: rows.length + 1,
        kpi: newKPI,
      };
      setRows([newEntry, ...rows]);
      setNewKPI("");
      setModalOpen(false);
      toast.success("Successfully added KPI");
    }
  };

  const handleViewKPI = (kpi) => {
    setViewKPI(kpi);
    setViewModalOpen(true);
  };

  const kpiColumn = [
    {
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    { field: "kpi", headerName: "KPIs", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewKPI(params.data)}
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
          buttonTitle="Add KPI"
          searchColumn="KPIs"
          tableTitle={`${name}'s KPI List`}
          data={rows}
          columns={kpiColumn}
          handleClick={() => setModalOpen(true)}
        />
      </div>

      {/* Modal for adding KPI */}
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New KPI"
      >
        <div>
          <TextField
            label="KPI Description"
            fullWidth
            value={newKPI}
            onChange={(e) => setNewKPI(e.target.value)}
          />
        </div>
        <PrimaryButton
          handleSubmit={handleAddKPI}
          type={"submit"}
          title={"Submit"}
          className="w-full mt-2"
        />
      </MuiModal>

      {/* Modal for viewing KPI */}
      {/* Modal for viewing KPI */}
      <MuiModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="KPI Detail"
      >
        {viewKPI && (
          <div className="space-y-3 text-sm">
            <DetalisFormatted title="Description" detail={viewKPI.kpi} />
            <DetalisFormatted title="Assigned By" detail={viewKPI.assignedBy} />
            <DetalisFormatted title="Target Date" detail={viewKPI.targetDate} />
            <DetalisFormatted title="Comments" detail={viewKPI.comments || "No comments"} />
          </div>
        )}
      </MuiModal>

    </div>
  );
};

export default KPI;
