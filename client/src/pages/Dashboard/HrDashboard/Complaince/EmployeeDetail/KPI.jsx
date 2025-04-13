import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";

const KPI = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [newKPI, setNewKPI] = useState("");
  const [rows, setRows] = useState([
    { id: 1, kpi: "Achieved 90% lead conversion rate" },
    { id: 2, kpi: "Increased client retention by 20%" },
    { id: 3, kpi: "Reduced support response time to under 2 hrs" },
    { id: 4, kpi: "Completed 5 major releases on time" },
    { id: 5, kpi: "Improved NPS score from 45 to 60" },
  ]);

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

  const kpiColumn = [
    {
      headerName: "S. No",
      field: "serialNumber",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    { field: "kpi", headerName: "KPIs", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: () => (
        <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
            View KPI
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
    </div>
  );
};

export default KPI;
