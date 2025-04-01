import React from "react";
import AgTable from "../../../components/AgTable";
import { Chip } from "@mui/material";

const AdditionalTasks = () => {
  const dailyTaskColumns = [
    { field: "task", headerName: "Task", flex: 1 },
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
    { field: "end", headerName: "End", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
            <span className="text-primary hover:underline text-content cursor-pointer">
              View KRA
            </span>
          </div>
        </>
      ),
    },
  ];

  const rows = [
    {
      id: "1",
      task: "R&D on AWS",
      priority: "Low",
      end: "10:30 AM",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
          search={true}
          searchColumn={"kra"}
          tableTitle={"Additional Tasks"}
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

export default AdditionalTasks;
