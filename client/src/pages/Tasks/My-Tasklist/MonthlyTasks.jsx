import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";

const MonthlyTasks = () => {
  const getLastDayOfMonth = () => {
    const now = new Date();
    return new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).toLocaleDateString("en-GB"); // dd/mm/yyyy
  };

  const dailyTaskColumns = [
    { field: "task", headerName: "Task", flex: 1 },
    { field: "assignedBy", headerName: "Assigned By", flex: 1 },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      cellRenderer: (params) => {
        const statusColorMap = {
          High: { backgroundColor: "#FFB6C1", color: "#8B0000" },
          Medium: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Low: { backgroundColor: "#90EE90", color: "#006400" },
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
    { field: "end", headerName: "End", flex: 1 },
  ];

  const rows = [
    {
      id: "1",
      task: "Complete WoNo Frontend Module",
      assignedBy: "Utkarsha Palkar",
      priority: "Medium",
      end: getLastDayOfMonth(),
    },
    {
      id: "2",
      task: "Implement Performance Graphs",
      assignedBy: "Utkarsha Palkar",
      priority: "High",
      end: getLastDayOfMonth(),
    },
    {
      id: "3",
      task: "Refactor Auth Module",
      assignedBy: "Utkarsha Palkar",
      priority: "Low",
      end: getLastDayOfMonth(),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Monthly Tasks"}
          data={rows}
          columns={dailyTaskColumns}
          // handleClick={() => console.log("Button clicked")}
          enableCheckbox
        />
      </div>
    </div>
  );
};

export default MonthlyTasks;
