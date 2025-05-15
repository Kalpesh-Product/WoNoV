import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  TextField,
  MenuItem,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { inrFormat } from "../../utils/currencyFormat";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import CollapsibleTable from "../Tables/MuiCollapsibleTable";
import { parseAmount } from "../../utils/parseAmount";

const AllocatedBudget = ({
  financialData,
  isLoading,
  variant,
  noFilter = false,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedFYIndex, setSelectedFYIndex] = useState(0); // Default to FY 2024-25

  const selectedFY = fiscalYears[selectedFYIndex];

  const allTypes = useMemo(() => {
    const types = new Set();
    financialData?.forEach((item) => {
      item.tableData?.rows?.forEach((row) => {
        types.add(row.expanseType || "Unknown");
      });
    });
    return Array.from(types);
  }, [financialData]);


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



  const groupedData = useMemo(() => {
    const result = {};

    (noFilter ? ["All"] : allTypes).forEach((type) => {
      result[type] = {};
      allMonths.forEach((month) => {
        const monthData = financialData.find((fd) => fd.month === month);
        const rows = noFilter
          ? monthData?.tableData?.rows || []
          : monthData?.tableData?.rows?.filter(
              (r) => (r.expanseType || "Unknown") === type
            ) || [];

        const projectedAmount = rows.reduce(
          (sum, r) =>
            sum + Number((r.projectedAmount || "0").replace(/,/g, "")),
          0
        );
        const actualAmount = rows.reduce(
          (sum, r) => sum + (parseAmount(r.actualAmount)|| 0),
          0
        );

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
  }, [financialData, allTypes, allMonths, noFilter]);

  const collapsibleRows = useMemo(() => {
    const currentType = noFilter ? "All" : allTypes[selectedTab];

    return filteredMonths.map((month) => {
      const data = groupedData[currentType]?.[month];
      return {
        id: month,
        monthFormatted: dayjs(month).format("MMM-YY"),
        projected: `${data?.projectedAmount?.toLocaleString("en-IN") || "0"}`,
        actual: `${data?.amount || "Yes Here"}`,
        rows: data?.tableData?.rows || [],
        columns: data?.tableData?.columns || [],
      };
    });
  }, [filteredMonths, groupedData, allTypes, selectedTab]);

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
        <span className="text-title font-pmedium text-primary uppercase">
          Allocated Budget:
        </span>
        <span className="text-title font-pmedium">
          INR {inrFormat(totalProjectedAmountForFY)}
        </span>
      </div>

      {/* Fiscal Year Switch */}
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
      <hr />

      {/* Tabs */}
      {collapsibleRows.length === 0 ? null : !noFilter ? (
        <div>
          {allTypes.length <= 5 ? (
            <div className="flex w-full border-[1px] border-borderGray rounded-xl">
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
                variant={variant || "fullWidth"}
                scrollButtons="auto"
                sx={{
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: 3,
                  "& .MuiTab-root": {
                    textTransform: "none",
                    fontWeight: "medium",
                    padding: "12px 15px",
                    minWidth: "10%",
                    borderRight: "0.1px solid #d1d5db",
                  },
                  "& .MuiTabs-scrollButtons": {
                    "&.Mui-disabled": { opacity: 0.3 },
                  },
                }}
                TabIndicatorProps={{ style: { display: "none" } }}
              >
                {allTypes.map((type) => (
                  <Tab
                    key={type}
                    label={type === "External" ? "Vendor" : type}
                  />
                ))}
              </Tabs>
            </div>
          ) : (
            <FormControl fullWidth>
              <Autocomplete
                value={allTypes[selectedTab]}
                onChange={(e, newValue) => {
                  const selectedIndex = allTypes.findIndex(
                    (type) => type === newValue
                  );
                  setSelectedTab(selectedIndex);
                }}
                options={allTypes}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select Category"
                    size="small"
                    fullWidth
                  />
                )}
                getOptionLabel={(option) =>
                  option === "External" ? "Vendor" : option
                }
                isOptionEqualToValue={(option, value) => option === value}
              />
            </FormControl>
          )}
        </div>
      ) : null}

      {/* Collapsible Table */}

      {collapsibleRows.length === 0 ? (
        <div className="h-40 flex justify-center items-center">
          No Data available
        </div>
      ) : (
        <CollapsibleTable
          columns={[
            { field: "monthFormatted", headerName: "MONTH" },
            { field: "projected", headerName: "PROJECTED (INR)" },
            { field: "actual", headerName: "ACTUAL (INR)" },
          ]}
          data={collapsibleRows}
          renderExpandedRow={(row) =>
            row.rows.length > 0 ? (
              <AgTable
                search={row.rows.length >= 10}
                data={row.rows}
                columns={row.columns}
                tableHeight={400}
                hideFilter={row.rows.length <= 9}
              />
            ) : (
              <div className="bg-borderGray rounded-xl text-body text-muted text-center py-4">
                No data available for this category in {row.monthFormatted}
              </div>
            )
          }
        />
      )}
    </div>
  );
};

export default AllocatedBudget;
