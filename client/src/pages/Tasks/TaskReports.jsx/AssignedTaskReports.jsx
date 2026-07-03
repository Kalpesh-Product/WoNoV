import React, { useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";
import PageFrame from "../../../components/Pages/PageFrame";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import { formatDateTimeFields } from "../../../utils/formatDateTime";
import StatusChip from "../../../components/StatusChip";
import dayjs from "dayjs";
import useAuth from "../../../hooks/useAuth";

const AssignedTaskReports = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const deptId = useSelector((state) => state.performance.selectedDepartment);

  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState([]);
  const [selectedTaskRange, setSelectedTaskRange] = useState(null);

  const { data: taskList = [], isLoading } = useQuery({
    queryKey: ["department-tasks", deptId],
    queryFn: async () => {
      if (!deptId) return [];

      const [pendingTasks, completedTasks] = await Promise.all([
        axios.get(`/api/tasks/get-tasks?dept=${deptId}`),
        axios.get(`/api/tasks/get-completed-tasks/${deptId}`),
      ]);

      return [...pendingTasks.data, ...completedTasks.data].filter(
        (task) => task.taskType === "Department"
      );
    },
    enabled: Boolean(deptId),
  });

  const handleViewDetails = (params) => {
    setSelectedTask(formatDateTimeFields(params));
    setOpenModal(true);
  };

  const formatAssignedTo = (assignedTo) => {
    if (!assignedTo) return "";

    const currentUserId = auth?.user?._id;
    const currentUserName =
      [
        auth?.user?.firstName,
        auth?.user?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim() || auth?.user?.name || "";

    if (Array.isArray(assignedTo)) {
      return assignedTo
        .map((member) =>
          typeof member === "string"
            ? member === currentUserId && currentUserName
              ? currentUserName
              : member
            : [
                member?.firstName,
                member?.lastName,
              ]
                .filter(Boolean)
                .join(" "),
        )
        .filter(Boolean)
        .join(", ");
    }

    if (typeof assignedTo === "string") {
      return assignedTo === currentUserId && currentUserName
        ? currentUserName
        : assignedTo;
    }

    return [
      assignedTo?.firstName,
      assignedTo?.lastName,
    ]
      .filter(Boolean)
      .join(" ");
  };

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
    { field: "assignedTo", headerName: "Assign To", width: 300,hide: true },
    { field: "completedBy", headerName: "Completed By", width: 300 },
    { field: "assignedDate", headerName: "Assigned Date" },
    { field: "dueDate", headerName: "Due Date" },
    {
      field: "dueTime",
      headerName: "Due Time",
    },
    {
      field: "completedDate",
      headerName: "Completed Date",
    },
    {
      field: "completedTime",
      headerName: "Completed Time",
    },
    { field: "department", headerName: "Department" },
    { field: "status", headerName: "Status", pinned: "right", cellRenderer: (params) => (
      <StatusChip status={params.value} />
    ) }   ,
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

  const currentMonthLabel = (
    selectedTaskRange?.startDate ? dayjs(selectedTaskRange.startDate) : dayjs()
  ).format("MMMM");

  const handleTaskRangeChange = ({ selectedRange }) => {
    setSelectedTaskRange((prev) => {
      const prevStart = prev?.startDate ? dayjs(prev.startDate).valueOf() : null;
      const prevEnd = prev?.endDate ? dayjs(prev.endDate).valueOf() : null;
      const nextStart = selectedRange?.startDate
        ? dayjs(selectedRange.startDate).valueOf()
        : null;
      const nextEnd = selectedRange?.endDate
        ? dayjs(selectedRange.endDate).valueOf()
        : null;

      if (prevStart === nextStart && prevEnd === nextEnd) {
        return prev;
      }

      return selectedRange;
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <YearWiseTable
          exportData
          taskExportDateTimeFormatting
          search={true}
          dateColumn={"assignedDate"}
          tableTitle={`Department Tasks Reports - ${currentMonthLabel}`}
          data={
            isLoading
              ? []
              : taskList.map((task, index) => ({
                srNo: index + 1,
                ...task,
                taskName: task.taskName,
                assignedDate: task.assignedDate,
                dueDate: task.dueDate,
                dueTime: task.dueTime,
                completedDate: task.completedDate,
                completedTime: task.completedDate,
                assignedBy: task.assignedBy
                  ? [
                    task.assignedBy.firstName,
                    task.assignedBy.middleName,
                    task.assignedBy.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ")
                  : "",
                assignedTo: formatAssignedTo(task.assignedTo),
                completedBy: task.completedBy,
                department: task.department?.name || task.department,
                description: task.description,
                status: task.status,
              }))
          }
          columns={myTaskReportsColumns}
          onDateFilterChange={handleTaskRangeChange}
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
              title="Assign To"
              detail={selectedTask.assignedTo || "-"}
            />
            <DetalisFormatted
              title="Completed By"
              detail={selectedTask.completedBy}
            />
            <DetalisFormatted
              title="Assigned Date"
              detail={selectedTask.assignedDate}
            />
            <DetalisFormatted
              title="Due Date"
              detail={`${selectedTask.dueDate}, ${selectedTask.dueTime}`}
            />
            <DetalisFormatted
              title="Completed Date"
              detail={`${selectedTask.completedDate}, ${selectedTask.completedTime}`}
            />

            <DetalisFormatted
              title="Department"
              detail={selectedTask.department}
            />
            {/* <DetalisFormatted title="Priority" detail={selectedTask.priority} /> */}
            <DetalisFormatted
              title="Status"
              detail={selectedTask.status || "—"}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default AssignedTaskReports;
