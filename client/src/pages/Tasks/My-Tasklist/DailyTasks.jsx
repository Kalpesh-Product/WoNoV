import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";
import { BsThreeDotsVertical } from "react-icons/bs";

const DailyTasks = () => {
  const dailyTaskColumns = [
    { field: "task", headerName: "Task", flex: 1 },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      cellRenderer: (params) => {
        // Map boolean to string status
        const statusColorMap = {
          Medium: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Low: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={params.value}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    { field: "project", headerName: "Project", flex: 1 },
    { field: "end", headerName: "End", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
              <BsThreeDotsVertical />
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      id: "1",
      task: "Fix API Integration",
      assignedBy: "John Doe",
      priority: "High",
      project: "E-Commerce App",
      end: "10:30 AM",
    },
    {
      id: "2",
      task: "Design Landing Page",
      assignedBy: "Jane Smith",
      priority: "Medium",
      project: "Marketing Website",
      end: "12:00 PM",
    },
    {
      id: "3",
      task: "Update Database Schema",
      assignedBy: "Alice Johnson",
      priority: "High",
      project: "CRM System",
      end: "02:00 PM",
    },
    {
      id: "4",
      task: "Write Unit Tests",
      assignedBy: "Michael Scott",
      priority: "Low",
      project: "Task Management App",
      end: "03:00 PM",
    },
    {
      id: "5",
      task: "Setup CI/CD Pipeline",
      assignedBy: "David Lee",
      priority: "High",
      project: "Internal Tools",
      end: "04:30 PM",
    },
    {
      id: "6",
      task: "Research on GraphQL",
      assignedBy: "Emma Watson",
      priority: "Medium",
      project: "API Development",
      end: "05:00 PM",
    },
    {
      id: "7",
      task: "Resolve Merge Conflicts",
      assignedBy: "Chris Brown",
      priority: "High",
      project: "HR System",
      end: "06:00 PM",
    },
    {
      id: "8",
      task: "Optimize Page Load Speed",
      assignedBy: "Rachel Green",
      priority: "Medium",
      project: "Company Website",
      end: "07:00 PM",
    },
    {
      id: "9",
      task: "Write Technical Documentation",
      assignedBy: "Monica Geller",
      priority: "Low",
      project: "Open Source Project",
      end: "08:00 PM",
    },
    {
      id: "10",
      task: "Schedule Team Meeting",
      assignedBy: "Chandler Bing",
      priority: "Low",
      project: "Team Collaboration",
      end: "09:00 PM",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Daily Tasks"}
          data={rows}
          columns={dailyTaskColumns}
          buttonTitle={"Add My Task"}
          handleClick={() => console.log("Button clicked")}
          enableCheckbox
        />
      </div>
    </div>
  );
};

export default DailyTasks;
