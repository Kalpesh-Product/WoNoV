import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import BarGraph from "../../../components/graphs/BarGraph";
import FinanceCard from "../../../components/FinanceCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import { Chip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DataCard from "../../../components/DataCard";

const FinanceDashboard = () => {
  const navigate = useNavigate();
  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [
        1550000, // Jan - stable start
        1620000, // Feb
        1750000, // Mar
        1900000, // Apr
        2100000, // May
        2250000, // Jun
        2450000, // Jul - mid year peak
        2400000, // Aug
        2300000, // Sep
        2650000, // Oct - festive boost
        2850000, // Nov - big sales
        3100000, // Dec - year end peak
      ],
    },
    {
      name: "Expense",
      data: [
        950000,  // Jan
        1000000, // Feb
        1080000, // Mar
        1200000, // Apr
        1350000, // May
        1450000, // Jun
        1550000, // Jul
        1500000, // Aug
        1480000, // Sep
        1600000, // Oct
        1750000, // Nov
        1850000, // Dec
      ],
    },
  ];
  

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"], // Green for income, Red for expense
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 6, // Adds rounded corners to the top of bars
        dataLabels: {
          position: "top",
        },
      },
    },
    legend: {
      show: true,
      position: "top",
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
        "Apr-24",
        "May-24",
        "Jun-24",
        "Jul-24",
        "Aug-24",
        "Sep-24",
        "Oct-24",
        "Nov-24",
        "Dec-24",
        "Jan-25",
        "Feb-25",
        "Mar-25",
      ],
    },
    yaxis: {
      title: {
        text: "Amount (INR)",
      },
      tickAmount: 4
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
  //-----------------------------------------------------DataCards------------------------------------------------------//
  const incomeCardData = {
    cardTitle: "Income",
    timePeriod: "Apr 24 – Mar 25",
    descriptionData: [
      {
        title: "March 2025",
        value: "INR 25,00,000",
        route: "monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: "INR 27,00,000",
        route: "annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: "INR 3,24,00,000",
        route: "overall-profit-loss",
      },
      { title: "Per Sq. Ft.", value: "810", route: "sqft-wise-data" },
    ],
  };

  const expenseCardData = {
    cardTitle: "Expense",
    timePeriod: "Apr 24 – Mar 25",
    descriptionData: [
      { title: "March 2025", value: "INR 18,00,000" },
      { title: "Annual Average", value: "INR 22,00,000" },
      { title: "Overall", value: "INR 2,64,00,000" },
      { title: "Per Sq. Ft.", value: "660" },
    ],
  };

  const netSavingsCardData = {
    cardTitle: "Net Savings",
    timePeriod: "Apr 24 – Mar 25",
    descriptionData: [
      { title: "March 2025", value: "INR 7,00,000" },
      { title: "Annual Average", value: "INR 5,00,000" },
      { title: "Overall", value: "INR 60,00,000" },
      { title: "Per Sq. Ft.", value: "150" },
    ],
  };

  //-----------------------------------------------------DataCards------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  const clientPayouts = [
    { clientName: "Axis", amount: 20000, status: "paid" },
    { clientName: "HDFC", amount: 35000, status: "paid" },
    { clientName: "ICICI", amount: 25000, status: "unpaid" },
    { clientName: "Kotak", amount: 40000, status: "paid" },
    { clientName: "SBI", amount: 10000, status: "unpaid" },
  ];

  // Group and sum by status
  const paidClients = clientPayouts.filter((c) => c.status === "paid");
  const unpaidClients = clientPayouts.filter((c) => c.status === "unpaid");

  const pieMonthlyPayoutData = [
    {
      label: "Paid",
      value: paidClients.reduce((sum, client) => sum + client.amount, 0),
      clients: paidClients,
    },
    {
      label: "Unpaid",
      value: unpaidClients.reduce((sum, client) => sum + client.amount, 0),
      clients: unpaidClients,
    },
  ];

  const pieMonthlyPayoutOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    colors: ["#4CAF50", "#F44336"],
    labels: pieMonthlyPayoutData.map((item) => item.label),
    legend: {
      show: true,
    },
    dataLabels: {
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "14px",
      },
    },
    tooltip: {
      custom: function ({ seriesIndex }) {
        const category = pieMonthlyPayoutData[seriesIndex];

        if (!category || !category.clients) return "";

        const rows = category.clients
          .map(
            (client) =>
              `<div style="display: flex; justify-content: space-between;">
                <span>${client.clientName}</span>
                <span>INR ${client.amount.toLocaleString()}</span>
              </div>`
          )
          .join("");

        return `
          <div style="padding: 8px; font-size: 13px;">
            <strong>${category.label} Clients:</strong>
            <div style="margin-top: 4px;">${rows}</div>
          </div>
        `;
      },
    },
  };

  //-----------------------------------------------------Pie Monthly Payout------------------------------------------------------//
  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  const clientCollections = [
    { clientName: "Axis", amount: 15000, status: "collected" },
    { clientName: "HDFC", amount: 30000, status: "collected" },
    { clientName: "ICICI", amount: 10000, status: "pending" },
    { clientName: "Kotak", amount: 25000, status: "collected" },
    { clientName: "SBI", amount: 8000, status: "pending" },
  ];

  const collectedClients = clientCollections.filter(
    (c) => c.status === "collected"
  );
  const pendingClients = clientCollections.filter(
    (c) => c.status === "pending"
  );

  const pieMonthlyCollectionData = [
    {
      label: "Collected",
      value: collectedClients.reduce((sum, c) => sum + c.amount, 0),
      clients: collectedClients,
    },
    {
      label: "Pending",
      value: pendingClients.reduce((sum, c) => sum + c.amount, 0),
      clients: pendingClients,
    },
  ];

  const pieMonthlyCollectionOptions = {
    chart: {
      fontFamily: "Poppins-Regular",
    },
    colors: ["#2196F3", "#FF9800"], // Blue for collected, orange for pending
    labels: pieMonthlyCollectionData.map((item) => item.label),
    legend: {
      show: true,
    },
    dataLabels: {
      formatter: (val) => `${val.toFixed(1)}%`,
      style: {
        fontSize: "14px",
      },
    },
    tooltip: {
      custom: function ({ seriesIndex }) {
        const category = pieMonthlyCollectionData[seriesIndex];

        if (!category || !category.clients) return "";

        const rows = category.clients
          .map(
            (client) =>
              `<div style="display: flex; justify-content: space-between;">
              <span>${client.clientName}</span>
              <span>INR ${client.amount.toLocaleString()}</span>
            </div>`
          )
          .join("");

        return `
        <div style="padding: 8px; font-size: 13px;">
          <strong>${category.label} Clients:</strong>
          <div style="margin-top: 4px;">${rows}</div>
        </div>
      `;
      },
    },
  };

  //-----------------------------------------------------Pie Monthly Collections------------------------------------------------------//
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//
  const statutoryPayments = [
    { label: "PF", amount: 30000 },
    { label: "ESIC", amount: 20000 },
    { label: "TDS", amount: 15000 },
    { label: "PT", amount: 10000 },
  ];

  const donutStatutorylabels = statutoryPayments.map((item) => item.label);
  const donutStatutorySeries = statutoryPayments.map((item) => item.amount);
  const donutStatutoryTooltipValue = statutoryPayments.map(
    (item) => `INR ${item.amount.toLocaleString()}`
  );
  const donutStatutoryColors = ["#4CAF50", "#2196F3", "#FFC107", "#FF5722"]; // Custom color palette
  //-----------------------------------------------------Donut Statutory Payments------------------------------------------------------//
  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  const rentalPayments = [
    { month: "April", amount: 40000, status: "paid" },
    { month: "May", amount: 40000, status: "paid" },
    { month: "June", amount: 40000, status: "paid" },
    { month: "July", amount: 40000, status: "paid" },
    { month: "August", amount: 40000, status: "paid" },
    { month: "September", amount: 40000, status: "paid" },
    { month: "October", amount: 40000, status: "paid" },
    { month: "November", amount: 40000, status: "paid" },
    { month: "December", amount: 40000, status: "unpaid" },
    { month: "January", amount: 40000, status: "unpaid" },
    { month: "February", amount: 40000, status: "unpaid" },
    { month: "March", amount: 40000, status: "unpaid" },
  ];

  const totalPaid = rentalPayments
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalUnpaid = rentalPayments
    .filter((item) => item.status === "unpaid")
    .reduce((sum, item) => sum + item.amount, 0);

  // Donut chart props
  const donutRentalLabels = ["Paid", "Unpaid"];
  const donutRentalSeries = [totalPaid, totalUnpaid];
  const donutRentalTooltipValue = [
    `Paid - INR ${totalPaid.toLocaleString()}`,
    `Unpaid - INR ${totalUnpaid.toLocaleString()}`,
  ];
  const donutRentalColors = ["#4CAF50", "#F44336"];

  //-----------------------------------------------------Donut Rental Payments------------------------------------------------------//
  //-----------------------------------------------------Table Priority Tasks------------------------------------------------------//

  const priorityTasks = [
    { taskName: "GST Filing Report", type: "Daily", endTime: "12:00 PM" },
    {
      taskName: "Collection Report",
      type: "Daily",
      endTime: "03:00 PM",
    },
    { taskName: "Tally Update", type: "Monthly", endTime: "10:00 AM" },
    { taskName: "TDS Query Update", type: "Daily", endTime: "02:30 PM" },
    { taskName: "Audit Report Update", type: "Daily", endTime: "08:00 AM" },
  ];

  const priorityTasksColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "taskName", label: "Task Name", align: "left" },
    {
      id: "type",
      label: "Type",
      renderCell: (data) => {
        return (
          <>
            <Chip sx={{ color: "#1E3D73" }} label={data.type} />
          </>
        );
      },
      align: "left",
    },
    { id: "endTime", label: "End Time", align: "left" },
  ];

  const executiveTimings = [
    {
      paymentName: "ChatGPT Pro",
      department: "Tech",
      amount: "5,000",
    },
    {
      paymentName: "AWS Subscription",
      department: "Tech",
      amount: "12,000",
    },
    {
      paymentName: "Zoom Enterprise",
      department: "Operations",
      amount: "3,500",
    },
    {
      paymentName: "Notion Team Plan",
      department: "Management",
      amount: "2,400",
    },
    {
      paymentName: "Figma Professional",
      department: "Design",
      amount: "4,200",
    },
    {
      paymentName: "Slack Premium",
      department: "Communication",
      amount: "3,000",
    },
    {
      paymentName: "Google Workspace",
      department: "IT",
      amount: "6,800",
    },
  ];

  const executiveTimingsColumns = [
    { id: "id", label: "Sr No", align: "left" },
    { id: "paymentName", label: "Payment Name", align: "left" },
    { id: "department", label: "Department", align: "left" },
    { id: "amount", label: "Amount (INR)", align: "left" },
  ];
  //-----------------------------------------------------Table Rental Payments------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border titleLabel={"FY 2024-25"} title={"Income v/s Expenses"}>
          <BarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 3,
      widgets: [
        <FinanceCard {...incomeCardData} />,
        <FinanceCard {...expenseCardData} />,
        <FinanceCard
          {...netSavingsCardData}
          highlightNegativePositive={true}
        />,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          icon={<MdFormatListBulleted />}
          title="Cashflow"
          route={"cashflow"}
        />,
        <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
        <Card icon={<SiCashapp />} title="Billing" route={"billing"} />,
        <Card icon={<SiGoogleadsense />} title="Mix-Bag" route={"mix-bag"} />,
        <Card
          icon={<SiGoogleadsense />}
          title="Data"
          route={"/app/dashboard/finance-dashboard/data"}
        />,
        <Card
          icon={<MdOutlineMiscellaneousServices />}
          title="Settings"
          route={"/app/dashboard/finance-dashboard/settings"}
        />,
      ],
    },


    {
      layout: 2,
      widgets: [
        <WidgetSection title={"Current Month Payouts"} border>
          <PieChartMui
            data={pieMonthlyPayoutData}
            options={pieMonthlyPayoutOptions}
            width={550}
            height={350}
          />
        </WidgetSection>,
        <WidgetSection title={"Current Months Customer Collections"} border>
          <PieChartMui
            data={pieMonthlyCollectionData}
            options={pieMonthlyCollectionOptions}
            width={550}
            height={350}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection title={"Statutory Payments Due"} border>
          <DonutChart
            centerLabel="Payments Due"
            labels={donutStatutorylabels}
            colors={donutStatutoryColors}
            series={donutStatutorySeries}
            tooltipValue={donutStatutoryTooltipValue}
            isMonetary={true}
          />
        </WidgetSection>,
        <WidgetSection title={"Rental Payments Due"} border>
          <DonutChart
            centerLabel="Rental Status"
            labels={donutRentalLabels}
            colors={donutRentalColors}
            series={donutRentalSeries}
            tooltipValue={donutRentalTooltipValue}
            isMonetary={true}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <MuiTable
          key={priorityTasks.length}
          scroll
          rowsToDisplay={4}
          Title={"Top 10 High Priority Due Tasks"}
          rows={[
            ...priorityTasks.map((task, index) => ({
              id: index + 1,
              taskName: task.taskName,
              type: task.type,
              endTime: task.endTime,
            })),
          ]}
          columns={priorityTasksColumns}
        />,
        <MuiTable
          key={executiveTimings.length}
          Title={"This Weeks Payouts"}
          rows={[
            ...executiveTimings.map((timing, index) => ({
              id: index + 1,
              paymentName: timing.paymentName,
              department: timing.department,
              amount: timing.amount,
            })),
          ]}
          columns={executiveTimingsColumns}
          scroll
          rowsToDisplay={4}
        />,
      ],
    },
  ];

  return (
    <div>
      {techWidgets.map((section, index) => (
        <WidgetSection key={index} layout={section?.layout}>
          {section?.widgets}
        </WidgetSection>
      ))}

      {/* <div
        onClick={() => {
          navigate(`monthly-P&L`);
        }}>
        Monthly P&L
      </div>
      <div
        onClick={() => {
          navigate(`annual-average-P&L`);
        }}>
        Annual Average P&L
      </div>
      <div
        onClick={() => {
          navigate(`overall-P&L`);
        }}>
        Overall P&L
      </div>
      <div
        onClick={() => {
          navigate(`monthly-per-sq-ft-P&L`);
        }}>
        Monthly Per Sq. Ft. P&L
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`cashflow`);
        }}>
        Cashflow
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`/app/dashboard/finance-dashboard/data`);
        }}>
        Data
      </div>
      <hr />
      <div
        onClick={() => {
          navigate(`/app/dashboard/finance-dashboard/settings`);
        }}>
        Settings
      </div> */}
    </div>
  );
};

export default FinanceDashboard;
