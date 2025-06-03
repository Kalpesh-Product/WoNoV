import React, { useState, useMemo } from "react";
import dayjs from "dayjs";
import {
  Tabs,
  Tab,
  CircularProgress,
  TextField,
  FormControl,
  Autocomplete,
} from "@mui/material";
import { inrFormat } from "../../utils/currencyFormat";
import PrimaryButton from "../PrimaryButton";
import AgTable from "../AgTable";
import { parseAmount } from "../../utils/parseAmount";
import {
  MdNavigateBefore,
  MdNavigateNext,
  MdOutlineSkipNext,
} from "react-icons/md";
import WidgetSection from "../WidgetSection";

const AllocatedBudget = ({
  financialData,
  isLoading,
  variant,
  hideTitle,
  noFilter = false,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const fiscalYears = ["FY 2024-25", "FY 2025-26"];
  const [selectedFYIndex, setSelectedFYIndex] = useState(0);
  const selectedFY = fiscalYears[selectedFYIndex];

  const allTypes = useMemo(() => {
    const types = new Set();
    financialData?.forEach((item) => {
      item.tableData?.rows?.forEach((row) => {
        types.add(row.expanseType || "Unknown");
      });
    });
    return ["All", ...Array.from(types)];
  }, [financialData]);

  const allMonths = useMemo(() => {
    const set = new Set(financialData?.map((item) => item.month));
    return Array.from(set).sort((a, b) => new Date(a) - new Date(b));
  }, [financialData]);

  const filteredMonths = useMemo(() => {
    const yearRanges = {
      "FY 2024-25": [new Date("2024-03-01"), new Date("2025-03-31")],
      "FY 2025-26": [new Date("2025-03-01"), new Date("2026-03-31")],
    };
    const [start, end] = yearRanges[selectedFY];
    return allMonths.filter((month) => {
      const date = new Date(month);
      return date >= start && date <= end;
    });
  }, [allMonths, selectedFY]);

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  const groupedData = useMemo(() => {
    const result = {};
    (noFilter ? ["All"] : allTypes).forEach((type) => {
      result[type] = {};
      allMonths.forEach((month) => {
        const monthData = financialData.find((fd) => fd.month === month);
        const rows =
        noFilter || type === "All"
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
          (sum, r) => sum + (parseAmount(r.actualAmount) || 0),
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

  const monthDataForSelectedType = useMemo(() => {
    const currentType = noFilter ? "All" : allTypes[selectedTab];
    const currentMonth = filteredMonths[selectedMonthIndex];
    const data = groupedData[currentType]?.[currentMonth];

    return {
      month: currentMonth,
      monthFormatted: dayjs(currentMonth).format("MMMM YYYY"),
      rows: data?.tableData?.rows || [],
      columns: data?.tableData?.columns || [],
    };
  }, [
    filteredMonths,
    selectedMonthIndex,
    groupedData,
    allTypes,
    selectedTab,
    noFilter,
  ]);

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
    <>
      <WidgetSection
        title={"BIZ Nest DEPARTMENT WISE EXPENSE DETAILS"}
        border
      >
        <div className="flex flex-col gap-4 rounded-md ">
          {!hideTitle ? (
            <div className="flex justify-between items-center">
              <span className="text-title font-pmedium text-primary uppercase">
                Allocated Budget:
              </span>
              <span className="text-title font-pmedium">
                INR {inrFormat(totalProjectedAmountForFY)}
              </span>
            </div>
          ) : (
            ""
          )}

          <div className="flex items-center justify-between gap-4">
            <div className="w-1/3">
              {/* {filteredMonths.length > 0 && !noFilter && (
                <div>
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
                </div>
              )} */}
            </div>
            <div className="flex gap-4 justify-end items-center w-3/4 ">
              <div className="">
                {/* Month Switcher */}
                {filteredMonths.length > 0 && (
                  <div className="flex gap-4 items-center">
                    <PrimaryButton
                      title={<MdNavigateBefore />}
                      handleSubmit={() =>
                        setSelectedMonthIndex((prev) => Math.max(prev - 1, 0))
                      }
                      disabled={selectedMonthIndex === 0}
                    />
                    <span className="text-body font-pmedium uppercase">
                      {monthDataForSelectedType.monthFormatted}
                    </span>
                    <PrimaryButton
                      title={<MdNavigateNext />}
                      handleSubmit={() =>
                        setSelectedMonthIndex((prev) =>
                          Math.min(prev + 1, filteredMonths.length - 1)
                        )
                      }
                      disabled={
                        selectedMonthIndex === filteredMonths.length - 1
                      }
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-4 items-center">
                <PrimaryButton
                  title={<MdNavigateBefore />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) => Math.max(prev - 1, 0))
                  }
                  disabled={selectedFYIndex === 0}
                />
                <span className="text-body font-pmedium">{selectedFY}</span>
                <PrimaryButton
                  title={<MdNavigateNext />}
                  handleSubmit={() =>
                    setSelectedFYIndex((prev) =>
                      Math.min(prev + 1, fiscalYears.length - 1)
                    )
                  }
                  disabled={selectedFYIndex === fiscalYears.length - 1}
                />
              </div>
            </div>
          </div>
          <hr className="mt-4"/>

          {/* AgTable */}
          {monthDataForSelectedType.rows.length > 0 ? (
            <div className="h-full">
              <AgTable
                search
                data={monthDataForSelectedType.rows}
                columns={monthDataForSelectedType.columns}
                tableHeight={350}
                // hideFilter={monthDataForSelectedType.rows.length <= 9}
              />
            </div>
          ) : (
            <div className="h-96 flex justify-center items-center text-muted">
              No data available for this category in{" "}
              {monthDataForSelectedType.monthFormatted}
            </div>
          )}
        </div>
      </WidgetSection>
    </>
  );
};

export default AllocatedBudget;
