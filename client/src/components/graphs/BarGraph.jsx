import React, { useState } from "react";
import Chart from "react-apexcharts";
import { Select, MenuItem, FormControl, Button } from "@mui/material";
import SecondaryButton from "../SecondaryButton";

const BarGraph = ({
  data,
  title,
  options,
  height,
  customLegend,
  firstParam,
  secondParam,
  year,
  departments, // ✅ new optional prop
}) => {
  const [selectedYear, setSelectedYear] = useState("2024-2025");
  const [departmentIndex, setDepartmentIndex] = useState(0);

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Determine current department (if departments are provided)
  const currentDepartment = departments?.[departmentIndex] || null;

  // Filter the data for the current department (if any)
  const filteredData = currentDepartment
    ? data.filter((item) =>
        item.name.toLowerCase().includes(currentDepartment.toLowerCase())
      )
    : data;

  const updatedOptions = {
    ...options,
    xaxis: {
      ...options?.xaxis,
    },
  };

  // Handle department navigation
  const handleNext = () => {
    if (departmentIndex < departments.length - 1) {
      setDepartmentIndex(departmentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (departmentIndex > 0) {
      setDepartmentIndex(departmentIndex - 1);
    }
  };

  return (
    <div className="bg-white rounded-md">
      {/* Header with title, year dropdown and department switcher */}
      <div className="p-4 flex justify-center items-center">
        <div className="flex gap-4 items-center">
          {year && (
            <FormControl size="small">
              <Select value={selectedYear} onChange={handleYearChange}>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
                <MenuItem value="2024-2025">2024-2025</MenuItem>
              </Select>
            </FormControl>
          )}
          {departments && (
            <>
              <SecondaryButton
                title={"Prev"}
                handleSubmit={handlePrev}
                disabled={departmentIndex === 0}
              />
              <div className="text-sm min-w-[120px] text-center">
                {currentDepartment}
              </div>

              <SecondaryButton
                title={"Next"}
                handleSubmit={handleNext}
                disabled={departmentIndex === departments.length - 1}
              />
            </>
          )}
        </div>
      </div>

      {/* Optional Legend */}
      {customLegend && (
        <div className="flex items-center gap-4 px-4 pb-2">
          <div className="flex items-center justify-center w-full bg-wonoGreen p-2 text-center text-white rounded-md gap-4">
            <span className="text-subtitle">{firstParam.title}</span>
            <span>:</span>
            <span className="text-subtitle">{firstParam.data}</span>
          </div>
          <div className="flex items-center justify-center w-full bg-primary p-2 text-center text-white rounded-md gap-4">
            <span className="text-subtitle">{secondParam.title}</span>
            <span>:</span>
            <span className="text-subtitle">{secondParam.data}</span>
          </div>
        </div>
      )}

      {/* Chart */}
      <Chart
        options={updatedOptions}
        series={filteredData}
        type="bar"
        height={height || 350}
      />
    </div>
  );
};

export default BarGraph;
