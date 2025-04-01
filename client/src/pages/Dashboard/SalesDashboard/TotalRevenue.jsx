import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import { monthlyLeadsData, monthlyLeadsOptions } from "./SalesData/SalesData";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../components/AgTable";

const TotalRevenue = () => {
  const financialData = [
    {
      domain: "Co-Working",
      revenue: "\u20B915000",
      tableData: {
        columns: [
          { field: "month", headerName: "Month", flex: 1 },
          { field: "revenue", headerName: "Revenue", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            month: "April 2024",
            revenue: "\u20B92500",
          },
          {
            id: 2,
            month: "May 2024",
            revenue: "\u20B92500",
          },
          {
            id: 3,
            month: "June 2024",
            revenue: "\u20B92500",
          },
          {
            id: 4,
            month: "July 2024",
            revenue: "\u20B92500",
          },
          {
            id: 5,
            month: "August 2024",
            revenue: "\u20B92500",
          },
          {
            id: 6,
            month: "September 2024",
            revenue: "\u20B92500",
          },
          {
            id: 7,
            month: "October 2024",
            revenue: "\u20B92500",
          },
          {
            id: 8,
            month: "November 2024",
            revenue: "\u20B92500",
          },
          {
            id: 9,
            month: "December 2024",
            revenue: "\u20B92500",
          },
          {
            id: 10,
            month: "January 2025",
            revenue: "\u20B92500",
          },
          {
            id: 11,
            month: "February 2025",
            revenue: "\u20B92500",
          },
          {
            id: 12,
            month: "March 2025",
            revenue: "\u20B92500",
          },
        ],
      },
    },
    {
      domain: "Workations",
      revenue: "\u20B915000",
      tableData: {
        columns: [
          { field: "month", headerName: "Month", flex: 1 },
          { field: "revenue", headerName: "Revenue", flex: 1 },
        ],
        rows: [
          {
            id: 1,
            domain: "HR",
            revenue: `\u20B92500`,
          },
          {
            id: 2,
            domain: "Finance",
            revenue: "\u20B92500",
          },
          {
            id: 3,
            domain: "Sales",
            revenue: "\u20B92500",
          },
          {
            id: 4,
            domain: "Tech",
            revenue: "\u20B92500",
          },
          {
            id: 5,
            domain: "IT",
            revenue: "\u20B92500",
          },
        ],
      },
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <WidgetSection layout={1} title={"Annual Monthly Mix Revenues"} border>
        <BarGraph
          height={400}
          data={monthlyLeadsData}
          options={monthlyLeadsOptions}
        />
      </WidgetSection>

      <div>
        {financialData.map((data, index) => {
          const totalRevenue = data.tableData.rows.reduce((sum, rev) => {
            return sum + parseInt(rev.revenue.replace(/\u20B9/, ""), 10);
          }, 0);

          console.log(totalRevenue);
          return (
            <Accordion key={index} className="py-4">
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel\u20B9{index}-content`}
                id={`panel\u20B9{index}-header`}
                className="border-b-[1px] border-borderGray">
                <div className="flex justify-between items-center w-full px-4">
                  <span className="text-subtitle font-pmedium">
                    {data.domain}
                  </span>
                  <span className="text-subtitle font-pmedium">
                    {data.amount}
                  </span>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                <AgTable
                  search={data.tableData.rows.length > 5 ? true : false}
                  data={data.tableData.rows}
                  columns={data.tableData.columns}
                  tableHeight={300}
                />
                <span>
                  Total revenue of {data.domain} : {totalRevenue}
                </span>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </div>
    </div>
  );
};

export default TotalRevenue;
