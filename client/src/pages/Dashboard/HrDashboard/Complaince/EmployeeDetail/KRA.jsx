import React, { useState } from "react";
import AgTable from "../../../../../components/AgTable";
import MuiModal from "../../../../../components/MuiModal";
import { TextField } from "@mui/material";
import PrimaryButton from "../../../../../components/PrimaryButton";
import { toast } from "sonner";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../../components/DetalisFormatted";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../../hooks/useAxiosPrivate";
import { useSelector } from "react-redux";
import PageFrame from "../../../../../components/Pages/PageFrame";

const KRA = () => {
  const axios = useAxiosPrivate();
  const id = useSelector((state) => state.hr.selectedEmployee);
  const name = localStorage.getItem("employeeName") || "Employee";
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewKRA, setViewKRA] = useState(null);
  const [newKRA, setNewKRA] = useState("");
  const [rows, setRows] = useState([
    {
      id: 1,
      kra: "01-01-2025",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "31-01-2025",
      status: "Reviewed",
      comments: "Met all goals",
    },
    {
      id: 2,
      kra: "01-02-2025",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "28-02-2025",
      status: "Pending",
      comments: "Awaiting feedback",
    },
    {
      id: 3,
      kra: "01-03-2025",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "29-03-2025",
      status: "Reviewed",
      comments: "Great improvement",
    },
    {
      id: 4,
      kra: "01-04-2025",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "30-04-2025",
      status: "In Progress",
      comments: "",
    },
    {
      id: 5,
      kra: "01-05-2025",
      assignedBy: "Utkarsha Palkar",
      reviewDate: "31-05-2025",
      status: "Pending",
      comments: "",
    },
  ]);

  const { data: kra, isLoading } = useQuery({
    queryKey: ["kra"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/tasks/get-tasks/?empId=${id}&type=KRA`
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

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
      headerName: "Sr No",
      field: "serialNumber",
      valueGetter: (params) => params.node.rowIndex + 1,
      width: 100,
    },
    { field: "description", headerName: "task", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="p-2 mb-2 flex gap-2">
          <span
            className="text-subtitle cursor-pointer"
            onClick={() => handleViewKRA(params.data)}>
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          <AgTable
            search={true}
            buttonTitle="Add KRA"
            searchColumn="kra"
            tableTitle={`${name}'s KRA List`}
            data={isLoading ? [] : kra}
            columns={kraColumn}
            handleClick={() => setModalOpen(true)}
          />
        </div>
      </PageFrame>

      {/* Modal for adding KRA */}
      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New KRA">
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
        title="KRA Detail">
        {viewKRA && (
          <>
            <DetalisFormatted title="Period" detail={viewKRA.kra} />
            <DetalisFormatted title="Assigned By" detail={viewKRA.assignedBy} />
            <DetalisFormatted title="Review Date" detail={viewKRA.reviewDate} />
            <DetalisFormatted
              title="Comments"
              detail={viewKRA.comments || "No comments"}
            />
          </>
        )}
      </MuiModal>
    </div>
  );
};

export default KRA;
