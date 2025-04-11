import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";

const DailyTasks = () => {
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
      task: "Conduct Employee Satisfaction Survey",
      assignedBy: "Utkarsha Palkar",
      priority: "High",
      end: "06:30 PM",
    },
    {
      id: "2",
      task: "Organize Monthly HR Report",
      assignedBy: "Utkarsha Palkar",
      priority: "Medium",
      end: "06:30 PM",
    },
    {
      id: "3",
      task: "Update Recruitment Tracker",
      assignedBy: "Utkarsha Palkar",
      priority: "High",
      end: "06:30 PM",
    },
    {
      id: "4",
      task: "Plan Employee Onboarding Session",
      assignedBy: "Utkarsha Palkar",
      priority: "Low",
      end: "06:30 PM",
    },
    {
      id: "5",
      task: "Follow-up on Exit Interviews",
      assignedBy: "Utkarsha Palkar",
      priority: "High",
      end: "06:30 PM",
    },
    {
      id: "6",
      task: "Draft New Leave Policy",
      assignedBy: "Utkarsha Palkar",
      priority: "Medium",
      end: "06:30 PM",
    },
    {
      id: "7",
      task: "Review Training Feedback Forms",
      assignedBy: "Utkarsha Palkar",
      priority: "High",
      end: "06:30 PM",
    },
    {
      id: "8",
      task: "Schedule Team Bonding Activity",
      assignedBy: "Utkarsha Palkar",
      priority: "Medium",
      end: "06:30 PM",
    },
    {
      id: "9",
      task: "Audit Payroll Records",
      assignedBy: "Utkarsha Palkar",
      priority: "Low",
      end: "06:30 PM",
    },
    {
      id: "10",
      task: "Prepare Compliance Checklist",
      assignedBy: "Utkarsha Palkar",
      priority: "Low",
      end: "06:30 PM",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Daily KRA"}
          data={rows}
          columns={dailyTaskColumns}
          handleClick={() => console.log("Button clicked")}
          enableCheckbox
        />
      </div>
    </div>
  );
};

export default DailyTasks;
