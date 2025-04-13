import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";

const KRA = () => {
  const name = localStorage.getItem("employeeName") || "Employee";

  const [modalOpen, setModalOpen] = useState(false);
  const [newKRA, setNewKRA] = useState("");
  const [rows, setRows] = useState([
    { id: 1, kra: "2025-01-01" },
    { id: 2, kra: "2025-02-01" },
    { id: 3, kra: "2025-03-01" },
    { id: 4, kra: "2025-04-01" },
    { id: 5, kra: "2025-05-01" },
  ]);

  const handleAddKRA = () => {
    if (newKRA.trim()) {
      const newEntry = {
        id: rows.length + 1,
        kra: newKRA,
      };
      setRows([newEntry, ...rows]);
      setNewKRA("");
      setModalOpen(false);
      toast.success("Successfully added KRA");
    }
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
      cellRenderer: () => (
        <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
            View KRA
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
            label="KRA Description"
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
    </div>
  );
};

export default KRA;
