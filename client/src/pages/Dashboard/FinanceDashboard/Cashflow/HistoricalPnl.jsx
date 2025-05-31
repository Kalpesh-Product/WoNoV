import React, { useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../../utils/currencyFormat";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";
import CollapsibleTable from "../../../../components/Tables/MuiCollapsibleTable";
import { MdOutlineRemoveRedEye } from "react-icons/md";

const HistoricalPnl = () => {
  const axios = useAxiosPrivate();
  const { data: revenueData = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/fetch-revenues");
        console.log("Revenue Data", response.data);
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const mockBusinessRevenueData = [
    {
      month: "FY 2024-25",
      domains: [
        {
          name: "2024-25",
          totalProfitLoss: 60000000,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 20740741,
              expense: 14502762,
              profitLoss: 6237979,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 22037037,
              expense: 15538674,
              profitLoss: 6498363,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 24629630,
              expense: 16574586,
              profitLoss: 8055044,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 25925926,
              expense: 18646409,
              profitLoss: 7279517,
              domain: "Meetng Rooms",
            },
            {
              srNo: 5,
              month: "August",
              income: 27222222,
              expense: 19682320,
              profitLoss: 7539902,
              domain: "Other Income",
            },
            {
              srNo: 6,
              month: "September",
              income: 28518519,
              expense: 20718232,
              profitLoss: 7800287,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 29814815,
              expense: 21754144,
              profitLoss: 8060671,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 31111110,
              expense: 22582873,
              profitLoss: 8528238,
              domain: "Workations",
            },
          ],
        },
        {
          name: "2023-24",
          totalProfitLoss: 5807560,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 2365149,
              expense: 1667674,
              profitLoss: 1350000,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 2105954,
              expense: 1875000,
              profitLoss: 1250000,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 2008757,
              expense: 1875000,
              profitLoss: 1300000,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 2591944,
              expense: 1875000,
              profitLoss: 1500000,
              domain: "Café",
            },
            {
              srNo: 5,
              month: "August",
              income: 2559545,
              expense: 1875000,
              profitLoss: 1750000,
              domain: "Meeting Rooms",
            },
            {
              srNo: 6,
              month: "September",
              income: 2170753,
              expense: 1875000,
              profitLoss: 1450000,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 2300350,
              expense: 1875000,
              profitLoss: 1600000,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 2397548,
              expense: 1875000,
              profitLoss: 1800000,
              domain: "Workations",
            },
          ],
        },
        {
          name: "2022-23",
          totalProfitLoss: 4591320,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 2014925,
              expense: 1306212,
              profitLoss: 708713,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 1876361,
              expense: 1222636,
              profitLoss: 653725,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 1920155,
              expense: 1264458,
              profitLoss: 655697,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 2096502,
              expense: 1397673,
              profitLoss: 698829,
              domain: "Café",
            },
            {
              srNo: 5,
              month: "August",
              income: 2001110,
              expense: 1264458,
              profitLoss: 736652,
              domain: "Meeting Rooms",
            },
            {
              srNo: 6,
              month: "September",
              income: 1876361,
              expense: 1222636,
              profitLoss: 653725,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 1963949,
              expense: 1306212,
              profitLoss: 657737,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 1876361,
              expense: 1041714,
              profitLoss: 834647,
              domain: "Workations",
            },
          ],
        },
        {
          name: "2021-22",
          totalProfitLoss: 3649780,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 1800000,
              expense: 1200000,
              profitLoss: 600000,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 1700000,
              expense: 1000000,
              profitLoss: 700000,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 1900000,
              expense: 1100000,
              profitLoss: 800000,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 2000000,
              expense: 1200000,
              profitLoss: 800000,
              domain: "Café",
            },
            {
              srNo: 5,
              month: "August",
              income: 1600000,
              expense: 1000000,
              profitLoss: 600000,
              domain: "Meetng Rooms",
            },
            {
              srNo: 6,
              month: "September",
              income: 1500000,
              expense: 1300000,
              profitLoss: 200000,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 1400000,
              expense: 1100000,
              profitLoss: 300000,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 1300000,
              expense: 900000,
              profitLoss: 400000,
              domain: "Workations",
            },
          ],
        },
        {
          name: "2020-21",
          totalProfitLoss: 6156300,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 1058824,
              expense: 1012195,
              profitLoss: 46629,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 1125000,
              expense: 1082675,
              profitLoss: 42325,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 1257353,
              expense: 1150902,
              profitLoss: 106451,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 1323529,
              expense: 1298780,
              profitLoss: 24749,
              domain: "Café",
            },
            {
              srNo: 5,
              month: "August",
              income: 1389706,
              expense: 1376707,
              profitLoss: 12999,
              domain: "Meetng Rooms",
            },
            {
              srNo: 6,
              month: "September",
              income: 1455882,
              expense: 1444634,
              profitLoss: 11248,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 1522059,
              expense: 1512561,
              profitLoss: 9498,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 1626546,
              expense: 1588235,
              profitLoss: 38311,
              domain: "Workations",
            },
          ],
        },
        {
          name: "2019-20",
          totalProfitLoss: 6209340,
          clients: [
            {
              srNo: 1,
              month: "April",
              income: 2002002,
              expense: 1189397,
              profitLoss: 812605,
              domain: "Coworking",
            },
            {
              srNo: 2,
              month: "May",
              income: 2127127,
              expense: 1274354,
              profitLoss: 852773,
              domain: "Virtual Office",
            },
            {
              srNo: 3,
              month: "June",
              income: 2377377,
              expense: 1359311,
              profitLoss: 1018066,
              domain: "Workations",
            },
            {
              srNo: 4,
              month: "July",
              income: 2502503,
              expense: 1529225,
              profitLoss: 973278,
              domain: "Café",
            },
            {
              srNo: 5,
              month: "August",
              income: 2627628,
              expense: 1614182,
              profitLoss: 1013446,
              domain: "Meetng Rooms",
            },
            {
              srNo: 6,
              month: "September",
              income: 275275,
              expense: 169914,
              profitLoss: 105361,
              domain: "Coworking",
            },
            {
              srNo: 7,
              month: "October",
              income: 287788,
              expense: 178410,
              profitLoss: 109378,
              domain: "Virtual Office",
            },
            {
              srNo: 8,
              month: "November",
              income: 300300,
              expense: 185206,
              profitLoss: 115094,
              domain: "Workations",
            },
          ],
        },
      ],
    },
  ];

  const [selectedMonth, setSelectedMonth] = useState(
    mockBusinessRevenueData[0].month
  ); // Default to first month

  // Function to update selected month
  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  // Filter data based on selected month
  const selectedMonthData = mockBusinessRevenueData.find(
    (data) => data.month === selectedMonth
  );

  if (selectedMonthData) {
    selectedMonthData.domains = selectedMonthData.domains.map((domain) => {
      const updatedClients = domain.clients.map((client, index) => {
        const income = Number(client.income);
        const expense = Number(client.expense);
        const profitLoss = income - expense;

        return {
          ...client,
          srNo: index + 1,
          income: income,
          expense: expense,
          profitLoss: profitLoss,
          rawProfitLoss: profitLoss, // used for internal calc
        };
      });

      const recalculatedTotal = updatedClients.reduce((sum, client) => {
        return sum + Number(client.rawProfitLoss);
      }, 0);
      const recalculatedTotalIncome = updatedClients.reduce((sum, client) => {
        return sum + Number(client.income);
      }, 0);
      const recalculatedTotalExpense = updatedClients.reduce((sum, client) => {
        return sum + Number(client.expense);
      }, 0);

      return {
        ...domain,
        clients: updatedClients,
        totalProfitLoss: recalculatedTotal,
        totalIncome: recalculatedTotalIncome,
        totalExpense: recalculatedTotalExpense,
      };
    });
  }

  // Prepare Bar Graph Data
  const graphData = [
    {
      name: "Revenue",
      data: selectedMonthData.domains.map((domain) => domain.totalProfitLoss),
    },
  ];

  // Graph Options
  const options = {
    chart: { type: "bar", stacked: false, fontFamily: "Poppins-Regular" },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
    },
    yaxis: { title: { text: "Revenue (in Rupees)" } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "30%", borderRadius: 5 },
    },
    legend: { position: "top" },
    colors: ["#54C4A7", "#EB5C45"],
  };
  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [25174680, 31929380, 31929380, 42222284], // in ₹
    },
    {
      name: "Expense",
      data: [24168780, 33899540, 33899540, 58672272], // in ₹
    },
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for income, Red for expense
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6, // Adds rounded corners to the top of bars
        dataLabels: {
          position: "top",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: [
        "2021 - 22",
        "2022 - 23",
        "2023 - 24",
        "2024 - 25",
        // "Oct-24",
        // "Nov-24",
        // "Dec-24",
        // "Jan-25",
        // "Feb-25",
        // "Mar-25",
      ],
    },
    yaxis: {
      title: {
        text: "Amount (INR)",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val) => `INR ${val.toLocaleString()}`,
      },
    },
  };
  //-----------------------------------------------------Graph------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Historical P&L 2019-25"}>
          <NormalBarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}
          />
        </WidgetSection>,
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout} padding>
          {section?.widgets}
        </WidgetSection>
      ))}

      <WidgetSection title={"Historical P&L Details"} border>
        <CollapsibleTable
          columns={[
            { field: "name", headerName: "Financial Year" },
            { field: "totalIncome", headerName: "Total Income (INR)" },
            { field: "totalExpense", headerName: "Total Expense (INR)" },
            {
              field: "totalProfitLoss",
              headerName: "Total Profit / Loss (INR)",
            },
          ]}
          data={selectedMonthData.domains.map((domain, index) => ({
            id: index,
            name: domain.name,
            totalIncome: inrFormat(domain.totalIncome),
            totalExpense: inrFormat(domain.totalExpense),
            totalProfitLoss: inrFormat(domain.totalProfitLoss),
            clients: domain.clients.map((client, idx) => ({
              ...client,
              income: inrFormat(client.income),
              expense: inrFormat(client.expense),
              profitLoss: inrFormat(client.profitLoss),
              srNo: idx + 1, // Adding Sr No field for each client
            })),
          }))}
          // data={[]}
          renderExpandedRow={(row) => {
            if (!row?.clients || !Array.isArray(row.clients)) {
              return <div>No client details available</div>; // Fallback message if no data
            }

            return (
              <AgTable
                data={row.clients} // Directly use the clients from the mapped data
                hideFilter
                columns={[
                  {
                    headerName: "Sr No",
                    field: "srNo",
                    flex: 1,
                    headerClass: "bold-header",
                  },
                  {
                    headerName: "Verticals",
                    field: "domain",
                    flex: 1,
                    headerClass: "bold-header",
                  },
                  {
                    headerName: "Income (INR)",
                    field: "income",
                    flex: 1,
                    headerClass: "bold-header",
                  },
                  {
                    headerName: "Expense (INR)",
                    field: "expense",
                    flex: 1,
                    headerClass: "bold-header",
                  },
                  {
                    headerName: "Profit / Loss (INR)",
                    field: "profitLoss",
                    flex: 1,
                    headerClass: "bold-header",
                  },
                  {
                    headerName: "Action",
                    field: "action",
                    // cellRenderer: (params) => (
                    //   <div className="p-2 mb-2 flex gap-2">
                    //     <span
                    //       className="text-subtitle cursor-pointer"
                    //       onClick={() => handleViewDetails(params.data)}
                    //     >
                    //       <MdOutlineRemoveRedEye />
                    //     </span>
                    //   </div>
                    // ),
                  },
                ]}
                tableHeight={300}
              />
            );
          }}
        />
      </WidgetSection>
    </div>
  );
};

export default HistoricalPnl;
