import React, { useState } from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import StatusChip from "../../../components/StatusChip";
import formatDateTime, {
  formatDateTimeFields,
} from "../../../utils/formatDateTime";

const DepartmentTaskReports = () => {
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleViewDetails = (params) => {
    setSelectedTask(
      formatDateTimeFields({
        ...params.data,
        startDate: params.data?.startDate,
        endDate: params.data?.endDate,
      }),
    );
    setOpenModal(true);
  };

  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-tasks");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 50 },
    { field: "task", headerName: "Task", width: 250 },
    { field: "project", headerName: "Project", width: 200 },
    { field: "department", headerName: "Department", width: 200 },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    { field: "assignedTo", headerName: "Assigned To", flex: 1 },
    {
      field: "priority",
      headerName: "Priority",
      width:120,
      cellRenderer: (params) => {
        const priority = params.value
        const statusColorMap = {
            "High" : {backgroundColor : "red", color : '#ffff'},
            "Medium": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
            "Low": { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        }

        const {backgroundColor, color} = statusColorMap[priority] || {
            backgroundColor: "gray",
            color: "white",
          };
        return <Chip label={params.value} style={{backgroundColor, color}} />;
      },
    },
    { field: "startDate", headerName: "Start Date", flex: 1 },
    { field: "endDate", headerName: "End Date", flex: 1 },
    {
      field: "status",
      headerName: "Status",
      pinned: "right",
      cellRenderer: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "action",
      headerName: "Action",
      pinned: "right",
      width: 100,
      cellRenderer: (params) => (
        <button
          type="button"
          title="View Task Details"
          onClick={() => handleViewDetails(params)}
          className="h-8 w-8 flex items-center justify-center"
        >
          <MdOutlineRemoveRedEye size={22} color="#111827" />
        </button>
      ),
    },
    { field: "comment", headerName: "Comment", hide: true },
  ];

  const departmentTaskReportsData = [
    {
      id: 1,
      task: "Develop Authentication Module",
      project: "HR Management System",
      assignedBy: "Kalpesh Naik",
      assignedTo:'Sankalp',
      priority: "High",
      startDate: "2024-02-10",
      endDate: "2024-02-20",
    },
    {
      id: 2,
      task: "Fix Payment Gateway Issue",
      project: "E-commerce Platform",
      assignedBy: "Kalpesh Naik",
      assignedTo:'Allan',
      priority: "Medium",
      startDate: "2024-02-12",
      endDate: "2024-02-18",
    },
    {
      id: 3,
      task: "Optimize Database Queries",
      project: "Inventory Management",
      assignedBy: "Kalpesh Naik",
      assignedTo:'Muskan',
      priority: "High",
      startDate: "2024-02-05",
      endDate: "2024-02-15",
    },
    {
      id: 4,
      task: "Implement Notification System",
      project: "Social Media App",
      assignedBy: "Kalpesh Naik",
      assignedTo:'Aiwinraj',
      priority: "Low",
      startDate: "2024-02-08",
      endDate: "2024-02-22",
    },
    {
      id: 5,
      task: "UI/UX Design for Dashboard",
      project: "Admin Panel",
      assignedBy: "Kalpesh Naik",
      assignedTo:'Aaron',
      priority: "Medium",
      startDate: "2024-02-14",
      endDate: "2024-02-25",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          tableTitle={"Department Task Reports"}
          data={isLoading ? [] : [...taskList.map((task, index) => ({
            srNo: index + 1,
            task: task.taskName,
            project: task.project?.projectName || "-",
            department: task.project?.department?.name || task.department?.name || "-",
            assignedBy: task.assignedBy?.firstName
              ? `${task.assignedBy.firstName} ${task.assignedBy.lastName || ""}`.trim()
              : "-",
            assignedTo: Array.isArray(task.assignedTo)
              ? task.assignedTo
                  .map((assignee) =>
                    assignee?.firstName
                      ? `${assignee.firstName} ${assignee.lastName || ""}`.trim()
                      : ""
                  )
                  .filter(Boolean)
                  .join(", ")
              : "-",
            priority: task.priority,
            startDate: task.assignedDate,
            endDate: task.dueDate,
            status: task.status,
            comment: task.comment,
          }))]}
          columns={departmentTaskReportsColumns}
        />
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Task Details"}
      >
        {selectedTask && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted title="Sr No" detail={selectedTask.srNo} />
            <DetalisFormatted title="Task" detail={selectedTask.task} />
            <DetalisFormatted title="Project" detail={selectedTask.project} />
            <DetalisFormatted title="Department" detail={selectedTask.department} />
            <DetalisFormatted title="Assigned By" detail={selectedTask.assignedBy} />
            <DetalisFormatted title="Assigned To" detail={selectedTask.assignedTo} />
            <DetalisFormatted title="Priority" detail={selectedTask.priority} />
            <DetalisFormatted title="Start Date" detail={selectedTask.startDate} />
            <DetalisFormatted title="End Date" detail={selectedTask.endDate} />
            <DetalisFormatted title="Status" detail={selectedTask.status || "-"} />
            <DetalisFormatted title="Comment" detail={selectedTask.comment || "-"} />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default DepartmentTaskReports;
