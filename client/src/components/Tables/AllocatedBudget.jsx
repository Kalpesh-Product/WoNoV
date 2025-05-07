import React, { useState, useMemo } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../AgTable";
import dayjs from "dayjs";
import { MdTrendingUp } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";
import { CircularProgress, Tabs, Tab, Box } from "@mui/material";
import { inrFormat } from "../../utils/currencyFormat";
import PrimaryButton from "../PrimaryButton";

const AllocatedBudget = ({ financialData, isLoading }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedFYIndex, setSelectedFYIndex] = useState(
    fiscalYears.length - 1
  );

  const selectedFY = fiscalYears[selectedFYIndex];

  console.log("From comsssp : ", financialData);

  const allTypes = useMemo(() => {
    const types = new Set();
    financialData?.forEach((item) => {
      item.tableData?.rows?.forEach((row) => {
        types.add(row.expanseType || "Unknown");
      });
    });
    return Array.from(types);
  }, [financialData]);

  // Extract all unique months from financialData
  const allMonths = useMemo(() => {
    const set = new Set(financialData?.map((item) => item.month));
    return Array.from(set).sort((a, b) => new Date(a) - new Date(b));
  }, [financialData]);

  const filteredMonths = useMemo(() => {
    const yearRanges = {
      "FY 2024-25": [new Date("2024-04-01"), new Date("2025-03-31")],
      "FY 2025-26": [new Date("2025-04-01"), new Date("2026-03-31")],
    };

    const [start, end] = yearRanges[selectedFY];

    return allMonths.filter((month) => {
      const date = new Date(month);
      return date >= start && date <= end;
    });
  }, [allMonths, selectedFY]);

  // Group by expanseType -> month
  const groupedData = useMemo(() => {
    const result = {};

    allTypes.forEach((type) => {
      result[type] = {};

      allMonths.forEach((month) => {
        // Find the matching financialData item for this month
        const monthData = financialData.find((fd) => fd.month === month);
        const rows =
          monthData?.tableData?.rows?.filter(
            (r) => (r.expanseType || "Unknown") === type
          ) || [];

        // Safely parse and sum projected/actual amounts
        const projectedAmount = rows.reduce(
          (sum, r) =>
            sum + Number((r.projectedAmount || "0").replace(/,/g, "")),
          0
        );
        // Use top-level amount value instead of row-based sum
        const actualAmount = rows.reduce(
          (sum, r) =>
            sum + Number((r.actualAmount ?? "0").toString().replace(/,/g, "")),
          0
        );

        console.log("Actual amount : ", actualAmount);

        result[type][month] = {
          month,
          projectedAmount,
          amount: inrFormat(actualAmount),
          tableData: {
            columns: monthData?.tableData?.columns || [],
            rows,
          },
        };
      });
    });

    return result;
  }, [financialData, allTypes, allMonths]);

  // Extract all unique expanseTypes from rows

  const totalProjectedAmountForFY = useMemo(() => {
    return filteredMonths.reduce((sum, month) => {
      return (
        sum +
        allTypes.reduce((typeSum, type) => {
          const data = groupedData[type]?.[month];
          return typeSum + (data?.projectedAmount || 0);
        }, 0)
      );
    }, 0);
  }, [filteredMonths, groupedData, allTypes]);

  if (isLoading) return <CircularProgress />;

  return (
    <div className="flex flex-col gap-4 border-default border-borderGray rounded-md p-4">
      {/* Header */}
      <div className="flex justify-between items-center py-2">
        <span className="text-title font-pmedium text-primary">
          Allocated Budget:
        </span>
        <span className="text-title font-pmedium">
          INR {inrFormat(totalProjectedAmountForFY)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <PrimaryButton
          title={"Prev"}
          handleSubmit={() =>
            setSelectedFYIndex((prev) => Math.max(prev - 1, 0))
          }
          disabled={selectedFYIndex === 0}
        />

        <span className="text-title font-pmedium">{selectedFY}</span>

        <PrimaryButton
          title={"Next"}
          handleSubmit={() =>
            setSelectedFYIndex((prev) =>
              Math.min(prev + 1, fiscalYears.length - 1)
            )
          }
          disabled={selectedFYIndex === fiscalYears.length - 1}
        />
      </div>

      {/* Tabs */}
      <div className="flex w-full border-[1px] border-borderGray rounded-xl">
        <Tabs
          value={selectedTab}
          sx={{
            overflow: "hidden", // Prevent overflow
            width: "100%", // Ensure tabs fit within screen width
            whiteSpace: "nowrap", // Prevent text from wrapping
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            "&:hover": {
              backgroundColor: "#fffff",
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 15px",
              minWidth: "20%", // Ensure tabs have a minimum width for responsiveness
              borderRight: "0.1px solid #d1d5db",
            },
            "& .MuiTabs-scrollButtons": {
              "&.Mui-disabled": { opacity: 0.3 }, // Style disabled scroll buttons
            },
          }}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable" // Makes tabs scrollable
          scrollButtons="auto" // Show scroll buttons when needed
          TabIndicatorProps={{ style: { display: "none" } }}
        >
          {allTypes.map((type, idx) => (
            <Tab key={type} label={type === "External" ? "Vendor" : type} />
          ))}
        </Tabs>
      </div>

      {/* Header Row */}
      <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
        <div className="flex justify-between items-center w-full px-4 py-2">
          <span className="w-1/3 text-sm text-muted font-pmedium text-title">
            MONTH
          </span>
          <span className="w-1/3 text-sm text-muted font-pmedium text-title flex items-center gap-1">
            PROJECTED
          </span>
          <span className="w-1/3 text-sm text-muted font-pmedium text-title flex items-center gap-1">
            ACTUAL
          </span>
        </div>
      </div>

      {/* Accordions per month */}
      {filteredMonths.map((month, index) => {
        const currentType = allTypes[selectedTab];
        const data = groupedData[currentType]?.[month];
        console.log("Inside data : ", data);

        return (
          <Accordion key={index} className="py-4">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              className="border-b-[1px] border-borderGray"
            >
              <div className="flex justify-between items-center w-full px-4">
                <span className="w-1/3 text-content font-pmedium">
                  {dayjs(month).format("MMM-YY")}
                </span>
                <span className="w-1/3 text-content font-pmedium flex items-center gap-1">
                  <MdTrendingUp className="text-yellow-600 w-4 h-4" />
                  {"INR " + data.projectedAmount.toLocaleString("en-IN")}
                </span>
                <span className="w-1/3 text-content font-pmedium flex items-center gap-1">
                  <BsCheckCircleFill className="text-green-600 w-4 h-4" />
                  {"INR " + data.amount}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="border-t-[1px] border-borderGray py-4">
                {data.tableData.rows.length > 0 ? (
                  <AgTable
                    search={data.tableData?.rows?.length >= 10}
                    data={data.tableData.rows}
                    columns={data.tableData.columns}
                    tableHeight={400}
                    hideFilter={data.tableData?.rows?.length <= 9}
                  />
                ) : (
                  <div className="text-center text-sm text-muted">
                    No data available for this category in{" "}
                    {dayjs(month).format("MMMM YYYY")}
                  </div>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </div>
  );
};

export default AllocatedBudget;
