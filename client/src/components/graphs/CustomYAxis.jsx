import React from "react";
import Tooltip from "@mui/material/Tooltip";

const CustomYAxis = () => {
  const userData = {
    leavesAllocated: {
      privileged: 12, // Total annual allocation
      sick: 6, // Total annual allocation
      abrupt: 0, // No allocation for abrupt leaves
    },
    leavesTaken: {
      privileged: [2, 1, 2, 0, 1, 0, 0, 0, 1, 2, 0, 0], // Example data
      sick: [1, 1, 0, 2, 0, 1, 0, 0, 0, 1, 0, 0], // Example data
      abrupt: [], // No pre-defined abrupt leaves
    },
  };

  const currentMonthIndex = 0; // Change this value to test for other months

  const getCumulativeLeavesTaken = (type, monthIndex) => {
    return userData.leavesTaken[type]
      .slice(0, monthIndex + 1)
      .reduce((sum, leaves) => sum + leaves, 0); // Cumulative sum
  };

  const getMonthRange = (monthIndex) => {
    if (monthIndex === 0) return "Jan";
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return `Jan-${months[monthIndex]}`;
  };

  const getInnerBarSections = (type, monthIndex) => {
    const leavesTaken = getCumulativeLeavesTaken(type, monthIndex);
    const currentMonthAllocation = monthIndex + 1;

    if (type === "abrupt") {
      const privilegedTaken = getCumulativeLeavesTaken(
        "privileged",
        monthIndex
      );
      const sickTaken = getCumulativeLeavesTaken("sick", monthIndex);
      const abruptLeaves = Math.max(
        0,
        privilegedTaken - currentMonthAllocation,
        sickTaken - currentMonthAllocation
      );
      return {
        greenWidth: "0%",
        redWidth: abruptLeaves > 0 ? "100%" : "0%",
        displayText: abruptLeaves > 0 ? abruptLeaves : "",
        tooltipData: {
          months: getMonthRange(monthIndex),
          privileged: privilegedTaken,
          sick: sickTaken,
          abrupt: abruptLeaves,
        },
      };
    }

    const greenPercentage = Math.min(
      (currentMonthAllocation / leavesTaken) * 100,
      100
    );
    const redPercentage = 100 - greenPercentage;

    return {
      greenWidth: `${greenPercentage}%`,
      redWidth: `${redPercentage}%`,
      tooltipData: {
        months: getMonthRange(monthIndex),
        privileged: type === "privileged" ? leavesTaken : null,
        sick: type === "sick" ? leavesTaken : null,
        abrupt: null,
      },
    };
  };

  return (
    <div className="flex flex-col gap-4 rounded-md">
      <div className="flex">
        {/* Y-axis labels */}
        <div className="flex flex-col h-60 justify-between p-4 text-right">
          <div className="py-4">Privileged Leaves</div>
          <div className="py-4">Sick Leaves</div>
          <div className="py-4">Abrupt Leaves</div>
        </div>

        {/* Graph Bars */}
        <div className="h-60 border-l-default border-b-default border-borderGray flex flex-col justify-between flex-1 py-4 gap-4">
          {["privileged", "sick", "abrupt"].map((type) => {
            const { greenWidth, redWidth, displayText, tooltipData } =
              getInnerBarSections(type, currentMonthIndex);

            return (
              <Tooltip
                key={type}
                sx={{ backgroundColor: "white", color: "black" }}
                title={
                  <div className="text-sm">
                    <div className="flex items-center justify-between">
                      <div className="w-full">Months: </div>
                      <div className="w-full text-right">
                        {tooltipData.months}
                      </div>
                    </div>
                    {tooltipData.privileged !== null && (
                      <div>
                        <div className="flex items-center gap-10">
                          <div className="w-full">
                            Privileged Leave (Allocated):{" "}
                          </div>
                          <div className="text-right font-pmedium">
                            {userData.leavesAllocated.privileged}
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="w-full">
                            {" "}
                            Privileged Leave (Taken):
                          </div>
                          <div className="text-right font-pmedium">
                            {tooltipData.privileged}
                          </div>
                        </div>
                      </div>
                    )}
                    {tooltipData.sick !== null && (
                      <div>
                        <div className="flex items-center gap-10">
                          <div className="w-full">Sick Leave (Allocated): </div>
                          <div className="text-right font-pmedium">
                            {userData.leavesAllocated.sick}
                          </div>
                        </div>
                        <div className="flex items-center gap-10">
                          <div className="w-full">Sick Leave (Taken):</div>
                          <div className="text-right font-pmedium">
                            {tooltipData.sick}
                          </div>
                        </div>
                      </div>
                    )}
                    {tooltipData.abrupt !== null && (
                      <div className="flex justify-between">
                        <div className="w-full">Abrupt Leave</div>
                        <div className="w-full">:</div>
                        <div className="text-right font-pmedium">{tooltipData.abrupt}</div>
                        </div>
                    )}
                  </div>
                }
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: "white",
                      color: "black",
                      border: "1px solid #ccc", // Optional: Adds a border to the tooltip
                      boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)", // Optional: Adds a shadow
                    },
                  },
                  arrow: {
                    sx: {
                      color: "white", // Arrow color matches the tooltip background
                    },
                  },
                }}
                placement="top"
              >
                <div
                  className="relative flex items-center"
                  style={{ height: "100%", backgroundColor: "white" }} // Outer bar
                >
                  {/* Green section */}
                  {greenWidth !== "0%" && (
                    <div
                      className="h-[70%] flex justify-center items-center rounded-l-sm transition-all duration-500 ease-in-out"
                      style={{
                        width: greenWidth,
                        backgroundColor: "lightgreen",
                        color: "black",
                      }}
                    >
                      {parseFloat(greenWidth).toFixed(1)}%
                    </div>
                  )}

                  {/* Red section */}
                  {redWidth !== "0%" && (
                    <div
                      className="h-[70%] flex justify-center items-center rounded-r-sm transition-all duration-500 ease-in-out"
                      style={{
                        width: redWidth,
                        backgroundColor: "red",
                        color: "white",
                      }}
                    >
                      {displayText
                        ? displayText
                        : `${parseFloat(redWidth).toFixed(1)}%`}
                    </div>
                  )}
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>

      {/* X-axis */}
      <div className="flex justify-center items-center">
        <span>{getMonthRange(currentMonthIndex)}</span>
      </div>
    </div>
  );
};

export default CustomYAxis;
