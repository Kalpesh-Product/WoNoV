import React, { useState } from "react";
import Chart from "react-apexcharts";
import { Select, MenuItem, FormControl } from "@mui/material";

const BarGraph = ({ data, title, options, height, customLegend, firstParam, secondParam,year }) => {
  const [selectedYear, setSelectedYear] = useState("2024-2025");

  // Function to update year selection
  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  // Dynamically update only the x-axis title
  const updatedOptions = {
    ...options,
    xaxis: {
      ...options?.xaxis,
      title: { text: selectedYear },
    },
  };

  return (
    <div className="bg-white rounded-md">
      {/* Header section with title and financial year dropdown */}
      <div className=" p-4 pt-0  flex justify-end">
        {title && <span className="text-lg">{title}</span>}
        {year && (
           <FormControl size="small">
           <Select value={selectedYear} onChange={handleYearChange}>
             <MenuItem value="2023-2024">2023-2024</MenuItem>
             <MenuItem value="2024-2025">2024-2025</MenuItem>
           </Select>
         </FormControl>
        )}  
      </div>

      <div>
        <div>
        {customLegend ? (
          <div className="flex items-center gap-4">
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
        ) : ""}
        </div>
        <Chart
          options={updatedOptions}
          series={data}
          type="bar"
          height={height || 350}
        />
      </div>
    </div>
  );
};

export default BarGraph;
