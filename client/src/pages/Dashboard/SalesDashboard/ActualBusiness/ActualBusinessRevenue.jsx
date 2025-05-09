import React, { useState } from "react";
import BarGraph from "../../../../components/graphs/BarGraph";
import { MenuItem, TextField } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AgTable from "../../../../components/AgTable";
import WidgetSection from "../../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import dayjs from "dayjs";
import { inrFormat } from "../../../../utils/currencyFormat";
import PrimaryButton from "../../../../components/PrimaryButton";
import SecondaryButton from "../../../../components/SecondaryButton";
import CollapsibleTable from "../../../../components/Tables/MuiCollapsibleTable";
import NormalBarGraph from "../../../../components/graphs/NormalBarGraph";

const ActualBusinessRevenue = () => {
  const axios = useAxiosPrivate();
  const { data: revenueData = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["revenueData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/fetch-revenues");
        return response.data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const mockBusinessRevenueData = [
    {
      month: "April",
      domains: [
        {
          name: "Co-Working",
          revenue: 1256800,
          clients: [
            {
              srNo: "1",
              client: "Zomato",
              representative: "Dipiksha Gawas",
              registerDate: "2024-01-15",
              actualRevenue: inrFormat(540000),
            },
            {
              srNo: "2",
              client: "Lancesoft",
              representative: "Samarth Wagrekar",
              registerDate: "2024-02-10",
              actualRevenue: inrFormat(403000),
            },
            {
              srNo: "3",
              client: "Zimetrics",
              representative: "Shrey Vernaker",
              registerDate: "2024-03-05",
              actualRevenue: inrFormat(306000),
            },
          ],
        },
        {
          name: "Workation",
          revenue: 836300,
          clients: [
            {
              srNo: "1",
              client: "Turtlemint",
              representative: "Bob Brown",
              registerDate: "2024-01-20",
              actualRevenue: inrFormat(480040),
            },
            {
              srNo: "2",
              client: "Infuse",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: inrFormat(780076),
            },
            {
              srNo: "3",
              client: "91HR",
              representative: "Charlie White",
              registerDate: "2024-02-25",
              actualRevenue: inrFormat(345600),
            },
          ],
        },
        {
          name: "Meetings",
          revenue: 1578400,
          clients: [
            {
              srNo: "4",
              client: "Capillary",
              representative: "Diana Prince",
              registerDate: "2024-03-18",
              actualRevenue: inrFormat(725000),
            },
            {
              srNo: "5",
              client: "CredAble",
              representative: "Bruce Wayne",
              registerDate: "2024-04-02",
              actualRevenue: inrFormat(890000),
            },
            {
              srNo: "6",
              client: "FarEye",
              representative: "Clark Kent",
              registerDate: "2024-04-10",
              actualRevenue: inrFormat(615000),
            },
          ],
        },
        {
          name: "Virtual Office",
          revenue: 1463800,
          clients: [
            {
              srNo: "7",
              client: "Yellow.ai",
              representative: "Peter Hoffman",
              registerDate: "2024-04-12",
              actualRevenue: inrFormat(760000),
            },
            {
              srNo: "8",
              client: "Ninjacart",
              representative: "Tony Perez",
              registerDate: "2024-04-14",
              actualRevenue: inrFormat(925000),
            },
            {
              srNo: "9",
              client: "Porter",
              representative: "Natasha Malik",
              registerDate: "2024-04-13",
              actualRevenue: inrFormat(830000),
            },
          ],
        },
        {
          name: "Other Channels",
          revenue: 1264700,
          clients: [
            {
              srNo: "10",
              client: "Delhivery",
              representative: "Steve Pascal",
              registerDate: "2024-04-15",
              actualRevenue: inrFormat(980000),
            },
            {
              srNo: "11",
              client: "Moglix",
              representative: "Melissa Barera",
              registerDate: "2024-04-16",
              actualRevenue: inrFormat(645000),
            },
            {
              srNo: "12",
              client: "Razorpay",
              representative: "Stephen Gomez",
              registerDate: "2024-04-17",
              actualRevenue: inrFormat(715000),
            },
          ],
        },
      ],
    },
    {
      month: "May",
      domains: [
        {
          name: "Co-Working",
          revenue: 15654,
          clients: [
            {
              srNo: "1",
              client: "Client I",
              representative: "Grace Orange",
              registerDate: "2024-02-11",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client J",
              representative: "Hank Purple",
              registerDate: "2024-03-09",
              actualRevenue: 5000,
            },
            {
              srNo: "3",
              client: "Client K",
              representative: "Isabel Cyan",
              registerDate: "2024-04-14",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 9795,
          clients: [
            {
              srNo: "1",
              client: "Client L",
              representative: "Jack Gray",
              registerDate: "2024-02-28",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Client M",
              representative: "Kara Silver",
              registerDate: "2024-03-07",
              actualRevenue: 4000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 14000,
          clients: [
            {
              srNo: "1",
              client: "Client N",
              representative: "Leo Gold",
              registerDate: "2024-05-20",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client O",
              representative: "Mia Platinum",
              registerDate: "2024-06-08",
              actualRevenue: 5000,
            },
            {
              srNo: "3",
              client: "Client P",
              representative: "Noah Bronze",
              registerDate: "2024-07-15",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
    {
      month: "June",
      domains: [
        {
          name: "Co-Working",
          revenue: 18264,
          clients: [
            {
              srNo: "1",
              client: "Client Q",
              representative: "Olivia Rose",
              registerDate: "2024-01-30",
              actualRevenue: 7000,
            },
            {
              srNo: "2",
              client: "Client R",
              representative: "Peter Brown",
              registerDate: "2024-02-18",
              actualRevenue: 6000,
            },
            {
              srNo: "3",
              client: "Client S",
              representative: "Quincy Black",
              registerDate: "2024-03-26",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 10000,
          clients: [
            {
              srNo: "1",
              client: "Client T",
              representative: "Rachel Violet",
              registerDate: "2024-04-12",
              actualRevenue: 5000,
            },
            {
              srNo: "2",
              client: "Client U",
              representative: "Sam Indigo",
              registerDate: "2024-05-07",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 13586,
          clients: [
            {
              srNo: "1",
              client: "Client V",
              representative: "Tina Lilac",
              registerDate: "2024-06-05",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client W",
              representative: "Umar Yellow",
              registerDate: "2024-07-08",
              actualRevenue: 4000,
            },
            {
              srNo: "3",
              client: "Client X",
              representative: "Victor Pink",
              registerDate: "2024-08-15",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
    {
      month: "July",
      domains: [
        {
          name: "Co-Working",
          revenue: 20000,
          clients: [
            {
              srNo: "1",
              client: "Client Y",
              representative: "Wendy Red",
              registerDate: "2024-03-10",
              actualRevenue: 8000,
            },
            {
              srNo: "2",
              client: "Client Z",
              representative: "Xavier Green",
              registerDate: "2024-04-14",
              actualRevenue: 7000,
            },
            {
              srNo: "3",
              client: "Client AA",
              representative: "Yara Blue",
              registerDate: "2024-05-16",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Workation",
          revenue: 11000,
          clients: [
            {
              srNo: "1",
              client: "Client AB",
              representative: "Zane Orange",
              registerDate: "2024-06-20",
              actualRevenue: 6000,
            },
            {
              srNo: "2",
              client: "Client AC",
              representative: "Adam Gray",
              registerDate: "2024-07-10",
              actualRevenue: 5000,
            },
          ],
        },
        {
          name: "Co-Living",
          revenue: 16468,
          clients: [
            {
              srNo: "1",
              client: "Client AD",
              representative: "Betty Silver",
              registerDate: "2024-08-25",
              actualRevenue: 7000,
            },
            {
              srNo: "2",
              client: "Client AE",
              representative: "Charlie Platinum",
              registerDate: "2024-09-14",
              actualRevenue: 6000,
            },
            {
              srNo: "3",
              client: "Client AF",
              representative: "David Bronze",
              registerDate: "2024-10-05",
              actualRevenue: 3000,
            },
          ],
        },
      ],
    },
  ];

  const [selectedMonth, setSelectedMonth] = useState(
    mockBusinessRevenueData[0].month
  );

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const getMonthIndex = () =>
    mockBusinessRevenueData.findIndex((data) => data.month === selectedMonth);

  const handlePrevMonth = () => {
    const index = getMonthIndex();
    if (index > 0) {
      setSelectedMonth(mockBusinessRevenueData[index - 1].month);
    }
  };

  const handleNextMonth = () => {
    const index = getMonthIndex();
    if (index < mockBusinessRevenueData.length - 1) {
      setSelectedMonth(mockBusinessRevenueData[index + 1].month);
    }
  };

  const selectedMonthData = mockBusinessRevenueData.find(
    (data) => data.month === selectedMonth
  );

  const graphData = [
    {
      name: "Revenue",
      data: selectedMonthData.domains.map((domain) => domain.revenue),
    },
  ];

  const options = {
    chart: {
      type: "bar",
      toolbar: false,
      stacked: false,
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: selectedMonthData.domains.map((domain) => domain.name),
      title: { text: "Verticals" },
    },
    yaxis: {
      title: { text: "Revenue in Lakhs (INR)" },
      labels: {
        formatter: (value) => `${(value / 100000).toLocaleString("en-IN")}`,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "20%",
        borderRadius: 5,
        dataLabels:{
          position : "top"
        }
      },
    },
    dataLabels: {
      enabled: true, // Make sure datalabels are enabled
      formatter : (val)=> {return inrFormat(val)},
      style: {
        fontSize: "12px",
        colors: ["#000"],
      },
      offsetY: -22, // Apply the offset here directly
    },
    tooltip: {
      enabled : false,
      y: {
        formatter: (value) => `INR ${(value).toLocaleString("en-IN")}`,
      },
    },
    legend: { position: "top" },
    colors: ["#54C4A7", "#EB5C45"],
  };
  

  const tableData = selectedMonthData.domains.map((domain, index) => ({
    id: index,
    vertical: domain.name,
    revenue: `INR ${domain.revenue.toLocaleString("en-IN")}`,
    clients: domain.clients.map((client, i) => ({
      srNo: i + 1,
      client: client.client,
      representative: client.representative,
      registerDate: dayjs(client.registerDate).format("DD-MM-YYYY"),
      actualRevenue: client.actualRevenue,
    })),
  }));

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* Month Selection Dropdown */}

      {/* Bar Graph Component */}
      <WidgetSection
        layout={1}
        title={"Vertical-wise Revenue"}
        titleLabel={`${selectedMonth} 2025`}
        TitleAmount={`INR ${inrFormat(
          selectedMonthData.domains.reduce((sum, d) => sum + d.revenue, 0)
        )}`}
        border
      >
        <NormalBarGraph data={graphData} options={options} height={400} />
      </WidgetSection>

      <div className="flex justify-start">
        <div className="flex items-center gap-4">
          <SecondaryButton handleSubmit={handlePrevMonth} title="Prev" />
          <TextField
            select
            size="small"
            variant="standard"
            label="Month"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="w-[60px]"
            SelectProps={{
              IconComponent: KeyboardArrowDownIcon,
            }}
          >
            {mockBusinessRevenueData.map((data) => (
              <MenuItem key={data.month} value={data.month}>
                {data.month}
              </MenuItem>
            ))}
          </TextField>
          <PrimaryButton handleSubmit={handleNextMonth} title="Next" />
        </div>
      </div>

      {/* Collapsible Table */}
      <WidgetSection
        border
        title={"Vertical-wise Revenue Breakdown"}
        padding
        TitleAmount={`INR ${inrFormat(
          selectedMonthData.domains.reduce((sum, d) => sum + d.revenue, 0)
        )}`}
      >
        <CollapsibleTable
          columns={[
            { headerName: "Vertical", field: "vertical" },
            { headerName: "Revenue (INR)", field: "revenue" },
          ]}
          data={tableData}
          renderExpandedRow={(row) => (
            <AgTable
              data={row.clients}
              columns={[
                { headerName: "Sr No", field: "srNo", flex: 1 },
                { headerName: "Client", field: "client", flex: 1 },
                {
                  headerName: "Representative",
                  field: "representative",
                  flex: 1,
                },
                {
                  headerName: "Register Date",
                  field: "registerDate",
                  flex: 1,
                },
                {
                  headerName: "Actual Revenue (INR)",
                  field: "actualRevenue",
                  flex: 1,
                },
              ]}
              tableHeight={300}
              hideFilter
            />
          )}
        />
      </WidgetSection>
    </div>
  );
};

export default ActualBusinessRevenue;
