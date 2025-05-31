import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const AssignedTaskReports = () => {

  const axios = useAxiosPrivate()
  const { data: taskList, isLoading } = useQuery({
    queryKey: ["taskList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/get-assigned-tasks");
        return response.data
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const assignedTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 50 },
    { field: "task", headerName: "Task", width: 250 },
    { field: "project", headerName: "Project", width: 200 },
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
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-primary hover:underline text-content cursor-pointer">
              View Details
            </span>
          </div>
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          tableTitle={"Assigned Task Reports"}
          data={isLoading? []:[...taskList.map((task, index)=>({
            srNo : index + 1,
            task:task.taskName,
            // project : task.project.projectName,
            assignedBy : task.assignedBy.firstName,
            assignedTo : task.assignedTo.map((asignee)=> asignee.firstName),
            priority : task.priority,
            startDate : task.assignedDate,
            endDate : task.dueDate,
          }))]}
          columns={assignedTaskReportsColumns}
        />
      </div>
    </div>
  );
};

export default AssignedTaskReports;
