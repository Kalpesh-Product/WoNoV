import React from "react";
import Card from "../../../components/Card";
import {
  MdFormatListBulleted,
  MdOutlineMiscellaneousServices,
} from "react-icons/md";
import { SiCashapp, SiGoogleadsense } from "react-icons/si";
import WidgetSection from "../../../components/WidgetSection";
import LayerBarGraph from "../../../components/graphs/LayerBarGraph";
import BarGraph from "../../../components/graphs/BarGraph";
import FinanceCard from "../../../components/FinanceCard";
import PieChartMui from "../../../components/graphs/PieChartMui";
import DonutChart from "../../../components/graphs/DonutChart";
import MuiTable from "../../../components/Tables/MuiTable";
import { Chip } from "@mui/material";

const FinanceDashboard = () => {
  //-----------------------------------------------------Graph------------------------------------------------------//
  const incomeExpenseData = [
    {
      name: "Income",
      data: [
        12000, 15000, 10000, 18000, 20000, 16000, 17000, 19000, 14000, 21000,
        22000, 25000,
      ],
    },
    {
      name: "Expense",
      data: [
        8000, 10000, 7000, 12000, 13000, 11000, 12000, 12500, 25000, 15000,
        16000, 17000,
      ],
    },
  ];
  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#4CAF50", "#F44336"], // Green for income, Red for expense
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
      title: {
        text: "2024-2025", // overridden by BarGraph component
      },
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
        formatter: (val) => `₹${val.toLocaleString()}`,
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
      { title: "March 2025", value: "INR -7,00,000" },
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
                <span>₹${client.amount.toLocaleString()}</span>
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
              <span>₹${client.amount.toLocaleString()}</span>
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
    (item) => `₹${item.amount.toLocaleString()}`
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
    `Paid - ₹${totalPaid.toLocaleString()}`,
    `Unpaid - ₹${totalUnpaid.toLocaleString()}`,
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
    { id: "id", label: "ID", align: "left" },
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
  ];
  const executiveTimingsColumns = [
    { id: "id", label: "ID", align: "left" },
    { id: "paymentName", label: "Payment Name", align: "left" },
    { id: "department", label: "Department", align: "left" },
    { id: "amount", label: "Amount", align: "left" },
  ];
  //-----------------------------------------------------Table Rental Payments------------------------------------------------------//

  const techWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection border title={"Budget v/s Achievements"}>
          <BarGraph
            data={incomeExpenseData}
            options={incomeExpenseOptions}
            year={true}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card icon={<MdFormatListBulleted />} title="Cashflow" />,
        <Card icon={<SiCashapp />} title="Finance" route={"finance"} />,
        <Card icon={<SiCashapp />} title="Billing" route={"billing"} />,
        <Card icon={<SiGoogleadsense />} title="Mix-Bag" />,
        <Card icon={<SiGoogleadsense />} title="Data" />,
        <Card icon={<MdOutlineMiscellaneousServices />} title="Settings" />,
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
        <WidgetSection title={"Current Month Payouts"} border>
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
          />
        </WidgetSection>,
        <WidgetSection title={"Rental Payments Due"} border>
          <DonutChart
            centerLabel="Rental Status"
            labels={donutRentalLabels}
            colors={donutRentalColors}
            series={donutRentalSeries}
            tooltipValue={donutRentalTooltipValue}
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

      <div
        onClick={() => {
          navigate(`monthly-pnl`);
        }}>
        Monthly P&L
      </div>
      <div
        onClick={() => {
          navigate(`annual-average-pnl`);
        }}>
        Annual Average P&L
      </div>
      <div
        onClick={() => {
          navigate(`overall-pnl`);
        }}>
        Overall P&L
      </div>
      <div
        onClick={() => {
          navigate(`monthly-per-sq-ft-pnl`);
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
      </div>
    </div>
  );
};

export default FinanceDashboard;
