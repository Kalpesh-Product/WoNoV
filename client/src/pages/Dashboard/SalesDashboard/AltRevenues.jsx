import BarGraph from "../../../components/graphs/BarGraph";
import WidgetSection from "../../../components/WidgetSection";
import AgTable from "../../../components/AgTable";
import CollapsibleTable from "../../../components/Tables/MuiCollapsibleTable";
import dayjs from "dayjs";
import { inrFormat } from "../../../utils/currencyFormat";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import MonthWiseAgTable from "../../../components/Tables/MonthWiseAgTable";
import { CircularProgress } from "@mui/material";
import WidgetTable from "../../../components/Tables/WidgetTable";
import StatusChip from "../../../components/StatusChip";
import YearlyGraph from "../../../components/graphs/YearlyGraph";

const AltRevenues = () => {
  const axios = useAxiosPrivate();
  const { data: alternateRevenue = [], isLoading: isLoadingAlternateRevenue } =
    useQuery({
      queryKey: ["alternateRevenue"],
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/sales/get-alternate-revenue`);
          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          throw new Error(error.response.data.message);
        }
      },
    });

  const monthlyRevenueData = [
    {
      month: "Apr-24",
      projected: 3000000,
      clients: [
        {
          revenueSource: "Stand Up Comedy",
          revenue: 1000000,
          recievedDate: "01/01/2025",
        },
        {
          revenueSource: "Stand Up Comedy",
          revenue: 800000,
          recievedDate: "01/01/2025",
        },
        {
          revenueSource: "Stand Up Comedy",
          revenue: 1000000,
          recievedDate: "01/01/2025",
        },
      ],
    },
    {
      month: "May-24",
      projected: 2800000,
      clients: [
        {
          revenueSource: "Corporate Workshop",
          revenue: 1200000,
          recievedDate: "03/01/2025",
        },
        {
          revenueSource: "Product Launch Event",
          revenue: 900000,
          recievedDate: "03/01/2025",
        },
        {
          revenueSource: "Startup Pitch Night",
          revenue: 700000,
          recievedDate: "03/01/2025",
        },
      ],
    },
    {
      month: "Jun-24",
      projected: 2900000,
      clients: [
        {
          revenueSource: "Music Concert",
          revenue: 1300000,
          recievedDate: "05/01/2025",
        },
        {
          revenueSource: "Art Exhibition",
          revenue: 1000000,
          recievedDate: "05/01/2025",
        },
        {
          revenueSource: "Networking Meetup",
          revenue: 600000,
          recievedDate: "05/01/2025",
        },
      ],
    },
    {
      month: "Jul-24",
      projected: 3100000,
      clients: [
        {
          revenueSource: "Tech Conference",
          revenue: 1400000,
          recievedDate: "07/01/2025",
        },
        {
          revenueSource: "Food Festival",
          revenue: 1000000,
          recievedDate: "07/01/2025",
        },
        {
          revenueSource: "Photography Workshop",
          revenue: 700000,
          recievedDate: "07/01/2025",
        },
      ],
    },
    {
      month: "Aug-24",
      projected: 3200000,
      clients: [
        {
          revenueSource: "Film Screening",
          revenue: 1200000,
          recievedDate: "08/01/2025",
        },
        {
          revenueSource: "Health & Wellness Expo",
          revenue: 1000000,
          recievedDate: "08/01/2025",
        },
        {
          revenueSource: "AI Panel Discussion",
          revenue: 1000000,
          recievedDate: "08/01/2025",
        },
      ],
    },
    {
      month: "Sep-24",
      projected: 3000000,
      clients: [
        {
          revenueSource: "Open Mic Night",
          revenue: 1000000,
          recievedDate: "09/01/2025",
        },
        {
          revenueSource: "Investor Roundtable",
          revenue: 1100000,
          recievedDate: "09/01/2025",
        },
        {
          revenueSource: "SaaS Product Demo Day",
          revenue: 900000,
          recievedDate: "09/01/2025",
        },
      ],
    },
    {
      month: "Oct-24",
      projected: 3300000,
      clients: [
        {
          revenueSource: "Design Thinking Workshop",
          revenue: 1200000,
          recievedDate: "10/01/2025",
        },
        {
          revenueSource: "Food Entrepreneur Fair",
          revenue: 1100000,
          recievedDate: "10/01/2025",
        },
        {
          revenueSource: "Blockchain Bootcamp",
          revenue: 1000000,
          recievedDate: "10/01/2025",
        },
      ],
    },
    {
      month: "Nov-24",
      projected: 3400000,
      clients: [
        {
          revenueSource: "Tech Startup Expo",
          revenue: 1300000,
          recievedDate: "11/01/2025",
        },
        {
          revenueSource: "Creative Writing Retreat",
          revenue: 1100000,
          recievedDate: "11/01/2025",
        },
        {
          revenueSource: "Interior Design Showcase",
          revenue: 1000000,
          recievedDate: "11/01/2025",
        },
      ],
    },
    {
      month: "Dec-24",
      projected: 3500000,
      clients: [
        {
          revenueSource: "New Year Gala",
          revenue: 1500000,
          recievedDate: "12/01/2025",
        },
        {
          revenueSource: "Winter Art Carnival",
          revenue: 1000000,
          recievedDate: "12/01/2025",
        },
        {
          revenueSource: "Sustainable Living Summit",
          revenue: 1000000,
          recievedDate: "12/01/2025",
        },
      ],
    },
    {
      month: "Jan-25",
      projected: 3600000,
      clients: [
        {
          revenueSource: "Entrepreneurship Bootcamp",
          revenue: 1400000,
          recievedDate: "01/01/2026",
        },
        {
          revenueSource: "Women in Tech Forum",
          revenue: 1100000,
          recievedDate: "01/01/2026",
        },
        {
          revenueSource: "Digital Marketing Masterclass",
          revenue: 1100000,
          recievedDate: "01/01/2026",
        },
      ],
    },
    {
      month: "Feb-25",
      projected: 3700000,
      clients: [
        {
          revenueSource: "Startup Awards Night",
          revenue: 1400000,
          recievedDate: "02/01/2026",
        },
        {
          revenueSource: "Investor Pitch Showcase",
          revenue: 1200000,
          recievedDate: "02/01/2026",
        },
        {
          revenueSource: "Fintech Founders Forum",
          revenue: 1100000,
          recievedDate: "02/01/2026",
        },
      ],
    },
    {
      month: "Mar-25",
      projected: 3800000,
      clients: [
        {
          revenueSource: "Annual Innovation Conference",
          revenue: 1500000,
          recievedDate: "03/01/2026",
        },
        {
          revenueSource: "Music & Media Summit",
          revenue: 1200000,
          recievedDate: "03/01/2026",
        },
        {
          revenueSource: "Creative Business Fest",
          revenue: 1100000,
          recievedDate: "03/01/2026",
        },
      ],
    },
  ];
  const series = [
    {
      name: "Actual Revenue",
      group: "FY 2024-25",
      data: alternateRevenue.map((item) =>
        item.revenue?.reduce((sum, c) => sum + c.taxableAmount, 0)
      ),
    },
  ];

  const options = {
    chart: {
      stacked: false,
      toolbar: false,
      fontFamily: "Poppins-Regular",
    },
    legend: {
      show: true,
      position: "top",
    },
    dataLabels: {
      enabled: true,
      formatter: function (val) {
        return `${inrFormat(val)}`;
      },
      style: {
        fontSize: "10px",
        fontWeight: "bold",
        colors: ["#000"],
      },
      offsetY: -22,
    },
    xaxis: {
      categories: monthlyRevenueData.map((item) => item.month),
    },
    yaxis: {
      title: { text: "Amount In Lakhs (INR)" },
      labels: {
        formatter: (val) => `${(val / 100000).toLocaleString()}`,
      },
    },
    tooltip: {
      enabled: false,
      y: {
        formatter: (val) => `${val.toLocaleString()} INR`,
      },
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 5,
        dataLabels: {
          position: "top",
        },
      },
    },
    colors: ["#1976D2"],
  };

  const totalActual = alternateRevenue.reduce(
    (sum, month) =>
      sum +
      month.revenue.reduce(
        (monthSum, client) => monthSum + client.taxableAmount,
        0
      ),
    0
  );

  const totalProjected = alternateRevenue.reduce(
    (sum, month) => sum + (month.projected ?? 0),
    0
  );

  const tableData = alternateRevenue.map((monthData, index) => {
    return {
      // revenue: `INR ${totalRevenue.toLocaleString()}`,
      clients: monthData.revenue.map((client, i) => ({
        ...client,
      })),
    };
  });

  const columns = [{}];

  const flattenedRevenueData = tableData.flatMap((month) => month.clients);
  console.log("flattenedRevenueData:", flattenedRevenueData);
  return (
    <div className="flex flex-col gap-4">
      {isLoadingAlternateRevenue ? (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      ) : (
        <YearlyGraph
          title={"ANNUAL MONTHLY ALTERNATE REVENUES"}
          titleAmount={`INR ${inrFormat(totalActual)}`}
          data={series}
          options={options}
          dateKey={"dateKey"}
        />
      )}

      {!isLoadingAlternateRevenue ? (
        <WidgetTable
          tableTitle={"Monthly Revenue with Source Details"}
          data={flattenedRevenueData}
          dateColumn={"invoiceCreationDate"}
          totalKey="taxableAmount"
          columns={[
            { headerName: "Sr No", field: "srNo", width: 100 },
            { headerName: "Particulars", field: "particulars", width: 350 },
            {
              headerName: "Taxable Amount (INR)",
              field: "taxableAmount",
              cellRenderer: (params) => inrFormat(params.value),
            },
            {
              headerName: "Invoice Creation Date",
              field: "invoiceCreationDate",
            },

            { headerName: "Invoice Paid Date", field: "invoicePaidDate" },
            {
              headerName: "GST (INR)",
              field: "gst",
              cellRenderer: (params) => inrFormat(params.value || 0),
            },

            {
              headerName: "Status",
              field: "status",
              pinned: "right",
              cellRenderer: (params) => <StatusChip status={params.value} />,
            },
          ]}
        />
      ) : (
        <div className="flex h-72 justify-center items-center">
          <CircularProgress />
        </div>
      )}
    </div>
  );
};

export default AltRevenues;
