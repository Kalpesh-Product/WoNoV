import React, { useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import PageFrame from "../../../components/Pages/PageFrame";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import YearWiseTable from "../../../components/Tables/YearWiseTable";

const AssignedTaskReports = () => {
  const axios = useAxiosPrivate();

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState([]);

  const { data: taskList = [], isLoading } = useQuery({
    queryKey: ["assigned-tasks"],
    queryFn: async () => {
      const response = await axios.get("/api/tasks/get-my-assigned-tasks");
      return response.data;
    },
  });

  const handleViewDetails = (params) => {
    setSelectedTask(params);
    setOpenModal(true);
  };
  console.log("selectedTask : ", selectedTask);

  const myTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "taskName",
      headerName: "Task",
      width: 250,
      cellRenderer: (params) => (
        <span
          className="text-primary underline cursor-pointer"
          onClick={() => handleViewDetails(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "assignedBy", headerName: "Assigned By", width: 300 },
    { field: "assignedDate", headerName: "Assigned Date" },
    { field: "dueDate", headerName: "Due Date" },
    { field: "completedDate", headerName: "Completed Date" },
    {
      field: "completedTime",
      headerName: "Completed Time",
      cellRenderer: (params) => humanTime(params.value),
    },
    { field: "department", headerName: "Department" },
    // { field: "endDate", headerName: "End Date" },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <div className="p-2 mb-2 flex gap-2">
    //       <span
    //         className="text-primary hover:underline text-content cursor-pointer"
    //         onClick={() => handleViewDetails(params)}
    //       >
    //         View Details
    //       </span>
    //     </div>
    //   ),
    // },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          exportData
          search={true}
          dateColumn={"assignedDate"}
          tableTitle={"Assigned Tasks Reports"}
          data={
            isLoading
              ? []
              : taskList.map((task, index) => ({
                  srNo: index + 1,
                  ...task,
                  taskName: task.taskName,
                  assignedDate: task.assignedDate,
                  dueDate: task.dueDate,
                  completedDate: task.completedDate,
                  completedTime: task.completedDate,
                  assignedBy: `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
                  department: task.department?.name,
                  description: task.description,
                }))
          }
          columns={myTaskReportsColumns}
        />
      </PageFrame>

      {/* Modal for Task Details */}
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Task Details"}
      >
        {selectedTask && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title="Task Name"
              detail={selectedTask.taskName}
            />
            <DetalisFormatted
              title="Description"
              detail={selectedTask.description}
            />
            <DetalisFormatted
              title="Assigned By"
              detail={selectedTask.assignedBy}
            />
            <DetalisFormatted
              title="Assigned Date"
              detail={humanDate(selectedTask.assignedDate)}
            />
            <DetalisFormatted
              title="Due Date"
              detail={humanDate(selectedTask.dueDate)}
            />
            <DetalisFormatted
              title="Completed Date"
              detail={humanDate(selectedTask.completedDate)}
            />
            <DetalisFormatted
              title="Completed Time"
              detail={humanTime(selectedTask.completedTime)}
            />
            <DetalisFormatted
              title="Department"
              detail={selectedTask.department}
            />
            <DetalisFormatted title="Priority" detail={selectedTask.priority} />
            <DetalisFormatted
              title="Status"
              detail={selectedTask.status || "—"}
            />
            <DetalisFormatted title="Remarks" detail={selectedTask.remarks} />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignedTaskReports;
