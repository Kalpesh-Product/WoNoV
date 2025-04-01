import React from "react";
import { financialYearMonths } from "../SalesData/SalesData";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";

const LeadsLayout = ({ hideAccordion, data }) => {
    const navigate = useNavigate()
  // ✅ Dynamically Count Clients Per Domain
  const transformedData = data.map((monthData) => {
    const domainCounts = {
      "Co-Working": 0,
      "Co-Living": 0,
      Workations: 0,
      "Virtual Office": 0,
    };

    monthData.clients.forEach((client) => {
      if (domainCounts[client.typeOfClient] !== undefined) {
        domainCounts[client.typeOfClient] += 1;
      }
    });

    return {
      ...monthData,
      ...domainCounts, // ✅ Now contains correct domain-wise unique client counts
    };
  });

  // ✅ Transform Data for ApexCharts
  const uniqueClientsData = [
    {
      name: "Co-Working",
      data: transformedData.map((item) => item["Co-Working"]),
    },
    {
      name: "Co-Living",
      data: transformedData.map((item) => item["Co-Living"]),
    },
    {
      name: "Workations",
      data: transformedData.map((item) => item["Workations"]),
    },
    {
      name: "Virtual Office",
      data: transformedData.map((item) => item["Virtual Office"]),
    },
  ];

  const barChartOptions = {
    chart: {
      type: "bar",
      stacked: true, // ✅ Stacked bars for better comparison
      fontFamily: "Poppins-Regular",
      events: {
        dataPointSelection : ()=>{
            navigate("/app/dashboard/sales-dashboard/unique-clients")
        }
      }
    },
    xaxis: {
      categories: financialYearMonths,
      title: { text: "Financial Year Months" },
    },
    yaxis: {
      title: { text: "Unique Clients" },
      min: 0,
      max: 10,
    },
    plotOptions: {
      bar: { columnWidth: "40%", borderRadius: 3 },
    },
    legend: { position: "top" },
    tooltip: {
      shared: false,
      y: { formatter: (val) => `${val} Clients` },
    },
    colors: ["#1E3D73", "#80BF01", "#FFC300", "#00C8D7"],
  };

  // Define Table Columns
  const tableColumns = [
    { field: "client", headerName: "Client", flex: 1 },
    { field: "typeOfClient", headerName: "Type of Client", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
    { field: "paymentStatus", headerName: "Payment Status", flex: 1 },
  ];

  return (
    <div className="flex flex-col gap-4 p-4">
      <WidgetSection layout={1} border padding title={"Unique Clients"}>
        <BarGraph
          data={uniqueClientsData}
          title=""
          options={barChartOptions}
          height={400}
          year={true}
        />
      </WidgetSection>

      {/* Accordion for Monthly Client Breakdown */}
      {hideAccordion ? (
        ""
      ) : (
        <div>
          {transformedData.map((data, index) => (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-medium">
                    {data.month}
                  </span>
                  <span className="text-subtitle font-medium">
                    Total Unique Clients: {data.clients.length}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  search={true}
                  data={data.clients}
                  columns={tableColumns}
                  tableHeight={250}
                />
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      )}
    </div>
  );
};

export default LeadsLayout;
