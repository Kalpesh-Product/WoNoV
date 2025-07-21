import { financialYearMonths } from "../SalesData/SalesData";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const LeadsLayout = ({ hideAccordion, data, additionalData }) => {
  const navigate = useNavigate();
  console.log("onga bonga", data);
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

  console.log(transformedData.map((item) => item["Co-Working"]));

  const barChartOptions = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: true, // ✅ Stacked bars for better comparison
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: financialYearMonths.slice(0, 13),
      title: { text: "Financial Year Months" },
    },
    yaxis: {
      title: { text: "Unique Clients" },
      min: 0,
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
      <WidgetSection
        layout={1}
        border
        padding
        title={"Unique Clients"}
        titleLabel="FY 2024-25"
        TitleAmount={additionalData || ""}
      >
        <div className="p-1"></div>
        <BarGraph
          data={uniqueClientsData}
          title=""
          options={barChartOptions}
          height={400}
        />
      </WidgetSection>

      {/* Accordion for Monthly Client Breakdown */}
      {hideAccordion ? (
        ""
      ) : (
        <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
          <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
            <div className="flex justify-between items-center w-full px-4 py-2">
              <span className="text-sm text-muted font-pmedium text-title">
                MONTH
              </span>
              <span className="px-8 text-sm text-muted font-pmedium text-title flex items-center gap-1">
                Total Unique Clients
              </span>
            </div>
          </div>
          {transformedData.map((data, index) => (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                className="border-b-[1px] border-borderGray"
              >
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-medium">
                    {dayjs(data.month, "MMMM-YY").format("MMM-YY")}
                  </span>
                  <span className="px-8 text-subtitle font-medium">
                    {data.clients.length}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                <AgTable
                  search={true}
                  data={data.clients.map((client) => ({
                    ...client,
                    date: dayjs(client.date).format("DD-MM-YYYY"),
                    paymentStatus: "Paid",
                  }))}
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
