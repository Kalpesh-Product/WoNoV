import React, { useState, useEffect } from "react";
import BarGraph from "../../../components/graphs/BarGraph";
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";

const ParentRevenue = ({ salesData: initialSalesData, falseAccordion }) => {
  const [salesData, setSalesData] = useState(initialSalesData); // Store received sales data
  const [currentMonth, setCurrentMonth] = useState("April"); // Selectable current month

  useEffect(() => {
    if (!initialSalesData.length) return;

    let carryForward = 0;
    const selectedMonthIndex = initialSalesData.findIndex(
      (item) => item.month === currentMonth
    );

    const updatedSalesData = initialSalesData.map((item, index) => {
      if (index < selectedMonthIndex) {
        return { ...item, adjustedProjected: 0 }; // No changes for past months
      }

      if (index === selectedMonthIndex) {
        carryForward = Math.max(item.projected - item.actual, 0); // Calculate carry forward for first selected month
        return { ...item, adjustedProjected: carryForward };
      }

      // Apply carry forward to future months
      const newProjected = Math.max(
        item.projected + carryForward - item.actual,
        0
      );
      carryForward = item.projected + carryForward - item.actual; // Update carry forward deficit

      return { ...item, adjustedProjected: newProjected };
    });

    setSalesData(updatedSalesData);
  }, [initialSalesData, currentMonth]);

  // Ensure data is available before processing
  if (!salesData.length) {
    return <div>Loading sales data...</div>;
  }

  // Extract Months for X-Axis
  const months = salesData.map((item) => item.month);

  // Prepare Graph Data
  const graphData = [
    { name: "Actual Sales", data: salesData.map((item) => item.actual || 0) },
    {
      name: "Remaining Projected Sales",
      data: salesData.map((item) => item.adjustedProjected || 0),
    },
  ];

  // Prepare Table Columns (Can be dynamically modified)
  const tableColumns = [
    { header: "Client Name", field: "client" },
    { header: "Revenue", field: "revenue" },
    { header: "Region", field: "region" },
    { header: "Industry", field: "industry" },
  ];

  // ApexCharts options
  const options = {
    chart: { type: "bar", stacked: true, fontFamily: "Poppins-Regular" },
    xaxis: { categories: months },
    yaxis: { title: { text: "Amount (in Rupees)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "50%", borderRadius: 2 },
    },
    legend: { position: "top", show: false },
    colors: ["#80bf01", "#1E3D73"],
  };

  return (
    <div>
      {/* Select Current Month */}
      <div className="mb-4 flex gap-4">
        <FormControl size="small">
          <InputLabel>Current Month</InputLabel>
          <Select
            value={currentMonth}
            onChange={(event) => setCurrentMonth(event.target.value)}
            label="Current Month"
          >
            {months.map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <span> ⬅️DEVELOPMENT PURPOSE</span>
      </div>

      {/* Bar Graph Component */}
      <BarGraph
        data={graphData}
        options={options}
        height={400}
        year={true}
        customLegend={true}
        firstParam={{
          title: "Actual Sales",
          data: "₹" + graphData[0].data.reduce((a, b) => a + b, 0),
        }}
        secondParam={{
          title: "Projected Sales",
          data: "₹" + graphData[1].data.reduce((a, b) => a + b, 0),
        }}
      />

      {/* Accordion Section for Monthly Revenue */}
      {falseAccordion ? (
        ""
      ) : (
        <div>
          {salesData.map((data, index) => {
            const totalRevenue = data.revenueBreakup.reduce(
              (sum, rev) => sum + (rev.revenue || 0),
              0
            );

            return (
              <Accordion key={index} className="py-4">
                <AccordionSummary
                  expandIcon={<IoIosArrowDown />}
                  aria-controls={`panel-${index}-content`}
                  id={`panel-${index}-header`}
                  className="border-b-[1px] border-borderGray"
                >
                  <div className="flex justify-between items-center w-full px-4">
                    <span className="text-subtitle font-medium">
                      {data.month}
                    </span>
                    <span className="text-subtitle font-medium">
                      ₹{data.actual.toLocaleString()}
                    </span>
                  </div>
                </AccordionSummary>
                <AccordionDetails>
                  <AgTable
                    data={data.revenueBreakup}
                    columns={tableColumns}
                    tableHeight={300}
                  />
                  <span className="block mt-2 font-medium">
                    Total Revenue for {data.month}: ₹
                    {totalRevenue.toLocaleString()}
                  </span>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ParentRevenue;
