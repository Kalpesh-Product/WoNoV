import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import humanDate from "../../../utils/humanDateForamt";
import humanTime from "../../../utils/humanTime";

const MyTaskReports = () => {

  const axios = useAxiosPrivate()
  const { data: taskList=[], isLoading } = useQuery({
    queryKey: ["my-tasks"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/tasks/my-tasks");
        return response.data
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const myTaskReportsColumns = [
    { field: "srNo", headerName: "Sr No", width: 50 },
    { field: "taskName", headerName: "Task", width: 250 },
    { field: "assignedBy", headerName: "Assigned By",width:300},
    { field: "assignedDate", headerName: "Assigned Date"},
    { field: "dueDate", headerName: "Due Date"},
    { field: "completedDate", headerName: "Completed Date"},
    { field: "completedTime", headerName: "Completed Time"},
    // {
    //   field: "priority",
    //   headerName: "Priority",
    //   width:120,
    //   cellRenderer: (params) => {
    //     const priority = params.value
    //     const statusColorMap = {
    //         "High" : {backgroundColor : "red", color : '#ffff'},
    //         "Medium": { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
    //         "Low": { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
    //     }

    //     const {backgroundColor, color} = statusColorMap[priority] || {
    //         backgroundColor: "gray",
    //         color: "white",
    //       };
    //     return <Chip label={params.value} style={{backgroundColor, color}} />;
    //   },
    // },
    { field: "department", headerName: "Department" },
    { field: "endDate", headerName: "End Date" },
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
          tableTitle={"My Task Reports"}
          data={isLoading? []:[...taskList.map((task, index)=>({
            srNo : index + 1,
            taskName:task.taskName,
            assignedDate : humanDate(task.assignedDate),
            dueDate : humanDate(task.dueDate),
            completedDate : humanDate(task.completedDate),
            completedTime : humanTime(task.completedDate),
            assignedBy : `${task.assignedBy.firstName} ${task.assignedBy.lastName}`,
            priority : task.priority,
            department : task.department?.name,
      
            endDate : task.dueDate,
          }))]}
          columns={myTaskReportsColumns}
        />
      </div>
    </div>
  );
};

export default MyTaskReports;
