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

const MyTaskReports = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const { data: taskList = [], isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      const response = await axios.get("/api/tasks/my-tasks");
      return response.data;
    },
  });

  const handleViewDetails = (params) => {
    setSelectedTask(params.data);
    setOpenModal(true);
  };
  const myTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 50 },
    {
      field: "taskName",
      headerName: "Task",
      width: 250,
      cellRenderer: (params) => (
        <span
          className="text-primary hover:underline cursor-pointer"
          onClick={() => handleViewDetails(params)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "assignedBy", headerName: "Assigned By", width: 300 },
    { field: "assignedDate", headerName: "Assigned Date" },
    { field: "dueDate", headerName: "Due Date" },
    { field: "completedDate", headerName: "Completed Date" },
    { field: "completedTime", headerName: "Completed Time" },
    { field: "department", headerName: "Department" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          exportData
          search={true}
          dateColumn={"assignedDate"}
          tableTitle={"My Task Reports"}
          data={
            isLoading
              ? []
              : taskList.map((task, index) => ({
                  ...task,
                  taskName: task.taskName,
                  assignedDate: (task.assignedDate),
                  dueDate: humanDate(task.dueDate),
                  completedDate: humanDate(task.completedDate),
                  completedTime: humanTime(task.completedDate),
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
        {selectedTask ? (
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
            <DetalisFormatted title="Due Date" detail={selectedTask.dueDate} />
            <DetalisFormatted
              title="Completed Date"
              detail={selectedTask.completedDate}
            />
            <DetalisFormatted
              title="Completed Time"
              detail={selectedTask.completedTime}
            />
            <DetalisFormatted
              title="Department"
              detail={selectedTask.department}
            />
            {/* <DetalisFormatted title="Priority" detail={selectedTask.priority} /> */}
            <DetalisFormatted title="Status" detail={selectedTask.status} />
            {/* <DetalisFormatted title="Remarks" detail={selectedTask.remarks} /> */}
          </div>
        ) : (
          <CircularProgress />
        )}
      </MuiModal>
    </div>
  );
};

export default MyTaskReports;
