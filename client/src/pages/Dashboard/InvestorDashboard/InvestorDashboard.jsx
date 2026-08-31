import AgTable from "../../../components/AgTable";
import WidgetSection from "../../../components/WidgetSection";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { inrFormat } from "../../../utils/currencyFormat";
import NormalBarGraph from "../../../components/graphs/NormalBarGraph";
import YearlyGraph from "../../../components/graphs/YearlyGraph";
import dayjs from "dayjs";
import { CircularProgress } from "@mui/material";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../../constants/permissions";
import useUserPermissions from "../../../hooks/useUserPermissions";
import FinanceCard from "../../../components/FinanceCard";
import LeadsLayout from "../SalesDashboard/ViewClients/LeadsLayout";
import CheckAvailability from "../SalesDashboard/CoWorkingSeats/CheckAvailability";
import BarGraph from "../../../components/graphs/BarGraph";
import HeatMap from "../../../components/graphs/HeatMap";
import InvestorOperationalCharts from "./InvestorOperationalCharts";
//import PieChartMui from "../../../components/graphs/PieChartMui";

const fiscalYearLabel = (date) => {
  const value = dayjs(date);
  const startYear = value.month() >= 3 ? value.year() : value.year() - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
};

const fiscalMonthIndex = (date) => {
  const month = dayjs(date).month();
  return month >= 3 ? month - 3 : month + 9;
};

const asArray = (value) => (Array.isArray(value) ? value : []);
const visitorTypes = [
  "Half-Day Pass",
  "Full-Day Pass",
  "Walk In",
  "Meeting",
  "Scheduled",
];

const investorClientType = (collection, client) => {
  if (collection === "coworkingClients") return "Coworking";
  if (collection === "virtualOfficeClients") return "Virtualoffice";

  if (collection === "meetingClients") {
    const purpose = String(client?.purposeOfVisit || "").toLowerCase();
    return purpose.includes("pass") ? "Open Desk" : "External Meetings";
  }

  return null;
};

const InvestorUniqueClientsGraph = () => {
  const axios = useAxiosPrivate();
  const { data: consolidatedClients = {} } = useQuery({
    queryKey: ["investor-unique-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/consolidated-clients");
      return response.data && typeof response.data === "object"
        ? response.data
        : {};
    },
  });

  const clientsByMonth = useMemo(() => {
    const groupedClients = new Map();

    Object.entries(consolidatedClients).forEach(([collection, clients]) => {
      asArray(clients).forEach((client) => {
        const typeOfClient = investorClientType(collection, client);
        if (!typeOfClient) return;

        const rawDate =
          client.startDate ||
          client.termStartDate ||
          client.rentDate ||
          client.dateOfVisit ||
          client.scheduledDate;
        const date = dayjs(rawDate);
        if (!date.isValid()) return;

        const month = date.format("YYYY-MM");
        const monthClients = groupedClients.get(month) || [];
        monthClients.push({
          client:
            client.clientName ||
            [client.firstName, client.lastName].filter(Boolean).join(" ") ||
            "Unknown",
          typeOfClient,
          date: date.format("YYYY-MM-DD"),
        });
        groupedClients.set(month, monthClients);
      });
    });

    return [...groupedClients.entries()].map(([month, clients]) => ({
      month,
      clients,
    }));
  }, [consolidatedClients]);

  return <LeadsLayout data={clientsByMonth} hideAccordion />;
};

//Meetings
const parseMeetingMinutes = (duration = "") => {
  // const hours = Number(duration.match(/(\d+(?:\.\d+)?)h/)?.[1] || 0);
  // const minutes = Number(duration.match(/(\d+(?:\.\d+)?)m/)?.[1] || 0);

  // return hours * 60 + minutes;
    const match = String(duration).match(/(\d+)(m|h)/);
  if (!match) return 0;

  const value = Number(match[1]);
  return match[2] === "h" ? value * 60 : value;
};

const InvestorMeetingAnalytics = ({ visibleGraphs }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const now = dayjs();
  const currentMonthLabel = now.format("MMM-YY");

  const fiscalStartYear = now.month() >= 3 ? now.year() : now.year() - 1;

  const fiscalLabel = `FY ${fiscalStartYear}-${String(
    fiscalStartYear + 1,
  ).slice(-2)}`;

  const months = Array.from({ length: 12 }, (_, index) =>
   dayjs(`${fiscalStartYear}-04-01`)
      .add(index, "month")
      .format("MMM-YY"),
  );

  const { data: meetings = [] } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-meetings")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () =>
      (await axios.get("/api/meetings/get-rooms")).data,
     refetchInterval: 30000,
    refetchOnWindowFocus: true,
  });

  const { data: visitors = [] } = useQuery({
     queryKey: ["investor-visitors"],
    queryFn: async () => {
      const response = await axios.get("/api/visitors/fetch-visitors");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const analytics = useMemo(() => {
     const activeRooms = rooms.filter((room) => room.isActive === true);
    //const activeRooms = rooms.filter((room) => room.isActive !== false);

    const activeRoomNames = new Set(
      activeRooms.map((room) => room.name),
    );

    const workingDays = (date) => {
      let count = 0;

      for (let day = 1; day <= date.daysInMonth(); day += 1) {
        const weekday = date.date(day).day();

        if (weekday >= 1 && weekday <= 6) {
          count += 1;
        }
      }

      return count;
    };

    const bookedByMonth = Object.fromEntries(
      months.map((month) => [month, 0]),
    );

    meetings.forEach((meeting) => {
      if (
        activeRoomNames.size &&
        !activeRoomNames.has(meeting.roomName)
      ) {
        return;
      }

      const date = dayjs(meeting.date || meeting.startTime);
      const label = date.format("MMM-YY");

      if (date.isValid() && label in bookedByMonth) {
        bookedByMonth[label] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const bookedHours = Object.values(bookedByMonth).reduce(
      (sum, value) => sum + value,
      0,
    );

    const utilization = [
      {
        group: fiscalLabel,
        data: months.map((month) => {
          const date = dayjs(month, "MMM-YY");
          const capacity =
            activeRooms.length * 9 * workingDays(date);

          return {
            x: month,
            y: capacity
              ? (bookedByMonth[month] / capacity) * 100
              : 0,
          };
        }),
      },
    ];

    const guestMonths = [];
    const monthlyGuestMap = {};
    for (let i = 0; i < 12; i += 1) {
      const month = now.subtract(11 - i, "month");
      const label = month.format("MMM-YY");
      guestMonths.push(label);
      monthlyGuestMap[label] = 0;
    }

    const guestCounts = Object.fromEntries(months.map((month) => [month, 0]));
    const visitorTypeCounts = Object.fromEntries(
      visitorTypes.map((type) => [
        type,
        Object.fromEntries(months.map((month) => [month, 0])),
      ]),
    );

    visitors.forEach((visitor) => {
      const date = dayjs(visitor.dateOfVisit || visitor.checkIn || visitor.createdAt);
      const label = date.format("MMM-YY");
      const visitorType = visitor.visitorType;

      if (date.isValid() && label in guestCounts) {
        guestCounts[label] += 1;
        if (visitorType && visitorTypeCounts[visitorType]) {
          visitorTypeCounts[visitorType][label] += 1;
        }
      }

      if (date.isValid() && monthlyGuestMap[label] !== undefined) {
        monthlyGuestMap[label] += 1;
      }
    });

    // const roomNames = activeRooms
    //   .map((room) => room.name)
    //   .sort();

    const roomNames = rooms.map((room) => room.name).sort();


    const roomHours = Object.fromEntries(
      roomNames.map((name) => [name, 0]),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.date || meeting.startTime);

      if (
        date.isSame(now, "month") &&
        meeting.roomName in roomHours
      ) {
        roomHours[meeting.roomName] +=
          parseMeetingMinutes(meeting.duration) / 60;
      }
    });

    const monthlyCapacity = 9 * workingDays(now);

    const occupancy = [
      {
        name: "Average Occupancy",
        data: roomNames.map((name) => ({
          x: name,
          y: monthlyCapacity
            ? (roomHours[name] / monthlyCapacity) * 100
            : 0,
        })),
      },
    ];

    const dayNames = [
      "Sun",
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
    ];

    const timeSlots = Array.from({ length: 12 }, (_, index) => {
      const start = dayjs()
        .hour(index + 8)
        .minute(0);

      return `${start.format("hA")}-${start
        .add(1, "hour")
        .format("hA")}`;
    });

    // const weekStart = now.startOf("week");

   const matrix = timeSlots.map(() => Array(7).fill(0));

    const monday = now
      .subtract((now.day() + 6) % 7, "day")
      .startOf("day");
    const meetingWeekDays = Array.from({ length: 6 }, (_, index) =>
      monday.add(index, "day").format("YYYY-MM-DD"),
    );

    meetings.forEach((meeting) => {
      const date = dayjs(meeting.startTime);
      const slot = date.hour() - 8;
      const dayIndex = meetingWeekDays.indexOf(date.format("YYYY-MM-DD"));

      if (
        date.isValid() &&
        dayIndex !== -1 &&
        slot >= 0 &&
        slot < 12
      ) {
        matrix[slot][dayIndex] += 1;
      }
    });

    const heatmap = timeSlots.map((name, index) => ({
      name,
      data: dayNames.map((day, dayIndex) => ({
        x: day,
        y: matrix[index][dayIndex],
      })),
    }));

    const externalGuestsData = [
      {
        name: "Visitors",
        data: guestMonths.map((month) => monthlyGuestMap[month]),
      },
    ];

    const externalGuestsOptions = {
      chart: {
        type: "bar",
        fontFamily: "Poppins-Regular",
        toolbar: {
          show: false,
        },
      },
      xaxis: {
        categories: guestMonths,
        title: {
          text: "",
        },
        labels: {
          style: {
            fontSize: "8px",
            fontFamily: "Poppins-Regular",
            colors: "#333",
          },
        },
      },
      yaxis: {
        max: 100,
        title: {
          text: "Guest Count",
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "65%",
          borderRadius: 5,
          dataLabels: {
            position: "top",
          },
        },
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: "12px",
          colors: ["#000"],
        },
        offsetY: -22,
      },
      colors: ["#08b6bc"],
    };

    // const bucketLabels = [
    //   "15",
    //   "30",
    //   "60",
    //   "90",
    //   "120",
    //   "Others",
    // ];

    // const bucketCounts = Array(6).fill(0);

    // meetings.forEach((meeting) => {
    //   const minutes = parseMeetingMinutes(meeting.duration);

    //   const index = [15, 30, 60, 90, 120].findIndex(
    //     (limit) => minutes <= limit,
    //   );

    //   bucketCounts[index < 0 ? 5 : index] += 1;
    // });

    return {
      bookedHours,
      utilization,
      guestCounts,
      visitorTypeCounts,
      externalGuestsData,
      externalGuestsOptions,
      totalVisitors: Object.values(guestCounts).reduce(
        (total, count) => total + count,
        0,
      ),
      roomNames,
      roomHours,
      occupancy,
      heatmap,
      // duration: bucketLabels.map((label, index) => ({
      //   label,
      //   value: bucketCounts[index],
      // })),
    };
  }, [fiscalLabel, meetings, months, now, rooms, visitors]);

  const goTo = (route) => () =>
    navigate(`/app/dashboard/investor-dashboard/${route}`);

  const utilizationOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    xaxis: {
      categories: months,
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 4,
      forceNiceScale: false,
      title: {
        text: "Utilization (%)",
      },
      labels: {
        formatter: (value) => Math.round(value),
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (value) => `${value.toFixed(1)}%`,
    },
    plotOptions: {
      bar: {
        borderRadius: 5,
        columnWidth: "40%",
      },
    },
  };

  const barOptions = (categories, yTitle, formatter, showDataLabels = true) => {
    const isOccupancy = yTitle.includes("Occupancy");

    return {
      chart: {
        type: "bar",
        toolbar: { show: false },
        fontFamily: "Poppins-Regular",
      },
      xaxis: {
        categories,
        labels: {
          rotate: isOccupancy ? -45 : 0,
          trim: true,
          hideOverlappingLabels: true,
          style: {
            fontSize: isOccupancy ? "10px" : "12px",
          },
        },
      },
      yaxis: {
        max: isOccupancy ? 100 : undefined,
        min: 0,
        tickAmount: isOccupancy ? 5 : undefined,
        forceNiceScale: false,
        title: {
          text: yTitle,
        },
        labels: {
          formatter: (value) =>
            isOccupancy ? `${Math.round(value)}%` : Math.round(value),
        },
      },
      colors: ["#2DC1C6"],
      dataLabels: {
        enabled: showDataLabels,
        formatter,
        offsetY: -18,
        style: {
          colors: ["#111"],
        },
      },
      plotOptions: {
        bar: {
          borderRadius: 5,
          columnWidth: "55%",
          dataLabels: {
            position: "top",
          },
        },
      },
    };
  };

  const heatmapOptions = {
    chart: {
      type: "heatmap",
      toolbar: { show: false },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      heatmap: {
        colorScale: {
          ranges: [
            {
              from: 0,
              to: 0,
              color: "#d1d5db",
              name: "No Bookings",
            },
            {
              from: 1,
              to: 5,
              color: "#B2FFB2",
              name: "Low (1-5)",
            },
            {
              from: 6,
              to: 10,
              color: "#4CAF50",
              name: "Moderate (6-10)",
            },
            {
              from: 11,
              to: 15,
              color: "#2E7D32",
              name: "High (11-15)",
            },
            {
              from: 16,
              to: 999,
              color: "#1B5E20",
              name: "Very High (16-20)",
            },
          ],
        },
      },
    },
  };
  const visitorOptions = {
    ...barOptions(
      months,
      "No. of Visitors",
      (value) => value.toFixed(0),
      false,
    ),
    colors: ["#2196F3", "#16B8C4", "#3498DB", "#174EA6", "#5C6BC0"],
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "center",
    },
    tooltip: {
      y: {
        formatter: (value) => `${Number(value || 0).toFixed(0)}`,
      },
    },
  };

  // const pieOptions = {
  //   labels: analytics.duration.map((item) => item.label),
  //   legend: {
  //     position: "bottom",
  //   },
  //   colors: [
  //     "#1E3D73",
  //     "#34528A",
  //     "#4A68A1",
  //     "#608DB8",
  //     "#76A2CF",
  //     "#8CB8E6",
  //   ],
  //   dataLabels: {
  //     enabled: true,
  //     formatter: (value) => `${value.toFixed(1)}%`,
  //   },
  // };

  const show = (key) => visibleGraphs.includes(key);

  return (
    <div className="flex flex-col gap-4">
      {show("utilization") && (
        <div
          onClick={goTo("meeting-room-utilization")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title="AVERAGE MEETING ROOM UTILIZATION"
            titleAmount={`TOTAL BOOKED HOURS : ${analytics.bookedHours.toFixed(
              0,
            )}`}
            data={analytics.utilization}
            options={utilizationOptions}
            currentYear={fiscalLabel}
          />
        </div>
      )}

      {(show("guests") || show("occupancy")) && (
        <WidgetSection
          layout={Number(show("guests")) + Number(show("occupancy"))}
           padding
        >
          {show("guests") && (
            <WidgetSection
              border
              padding
              title="EXTERNAL GUESTS VISITED"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("external-guests-visited")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.externalGuestsData}
                  options={analytics.externalGuestsOptions}
                />
              </div>
            </WidgetSection>
          )}

          {show("occupancy") && (
            <WidgetSection
              border
              title="AVERAGE OCCUPANCY OF ROOMS IN %"
              titleLabel={currentMonthLabel}
            >
              <div
                onClick={goTo("average-room-occupancy")}
                className="cursor-pointer"
              >
                <BarGraph
                  data={analytics.occupancy}
                  options={barOptions(
                    analytics.roomNames,
                    "Occupancy (%)",
                    (value) => `${value.toFixed(0)}%`,
                  )}
                />
              </div>
            </WidgetSection>
          )}
        </WidgetSection>
      )}

      {show("busy") && (
        <WidgetSection border title="BUSY TIME DURING THE WEEK">
          <div
            onClick={goTo("busy-time-during-week")}
            className="cursor-pointer"
          >
            <HeatMap
              data={analytics.heatmap}
              options={heatmapOptions}
              height={395}
            />
          </div>
        </WidgetSection>
      )}
      {show("visitors") && (
        <div
          onClick={goTo("monthly-total-visitors")}
          className="cursor-pointer"
        >
          <YearlyGraph
            title={`MONTHLY TOTAL VISITORS ${fiscalLabel}`}
            headerRightContent={
              <span className="text-mobileTitle lg:text-widgetTitle text-primary font-pmedium">
                TOTAL COUNT: {analytics.totalVisitors}
              </span>
            }
            data={[
              ...visitorTypes.map((type) => ({
                name: type,
                group: fiscalLabel,
                data: months.map((month) => analytics.visitorTypeCounts[type][month]),
              })),
            ]}
            options={visitorOptions}
            currentYear={fiscalLabel}
          />
        </div>
      )}
    </div>
  );
};


const InvestorIncomeExpenseGraph = ({ showSummaryCards }) => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const currentFiscalYear = fiscalYearLabel(dayjs());
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(currentFiscalYear);

  const { data: revenueExpenseData = [] } = useQuery({
    queryKey: ["revenueExpenseData"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
  });

  const { data: budgetData = [] } = useQuery({
    queryKey: ["budgetData", "investor-income-expense"],
    queryFn: async () => {
      const response = await axios.get("/api/budget/company-budget", {
        params: { view: "dashboard" },
      });
      return Array.isArray(response.data?.allBudgets) ? response.data.allBudgets : [];
    },
  });

 const { series, totals, selectedIncome, selectedExpense } = useMemo(() => {
    const incomeByYear = new Map();
    const expenseByYear = new Map();
    const addAmount = (map, date, amount) => {
      if (!date || !dayjs(date).isValid()) return;
      const year = fiscalYearLabel(date);
      const values = map.get(year) || Array(12).fill(0);
      values[fiscalMonthIndex(date)] += Number(amount) || 0;
      map.set(year, values);
    };

    revenueExpenseData.forEach((entry) => {
      const income = entry?.income || {};
      [
        ...asArray(income.meetingRevenue),
        ...asArray(income.alternateRevenues),
        ...asArray(income.virtualOfficeRevenues),
        ...asArray(income.workationRevenues),
        ...asArray(income.coworkingRevenues),
      ].forEach((item) =>
        addAmount(
          incomeByYear,
          item.date || item.rentDate || item.invoiceCreationDate,
          item.taxableAmount || item.revenue || item.taxable,
        ),
      );
    });

    budgetData.forEach((item) =>
      addAmount(expenseByYear, item?.dueDate, item?.actualAmount),
    );

    const years = new Set([
      ...incomeByYear.keys(),
      ...expenseByYear.keys(),
      currentFiscalYear,
    ]);
    const graphSeries = [...years].flatMap((group) => [
      { name: "Income", group, data: incomeByYear.get(group) || Array(12).fill(0) },
      { name: "Expense", group, data: expenseByYear.get(group) || Array(12).fill(0) },
    ]);
    const income = incomeByYear.get(selectedFiscalYear) || [];
    const expense = expenseByYear.get(selectedFiscalYear) || [];

    return {
      series: graphSeries,
      totals: {
        income: income.reduce((sum, value) => sum + value, 0),
        expense: expense.reduce((sum, value) => sum + value, 0),
      },
    selectedIncome: income,
      selectedExpense: expense,
    };
  }, [budgetData, currentFiscalYear, revenueExpenseData, selectedFiscalYear]);
   const totalSqft = useMemo(
    () =>
      revenueExpenseData
        .filter((item) => item?.units)
        .flatMap((item) => asArray(item.units))
        .reduce((sum, item) => sum + (Number(item?.sqft) || 0), 0),
    [revenueExpenseData],
  );

  const previousMonthIndex = fiscalMonthIndex(dayjs().subtract(1, "month"));
  const selectedYearStart = Number(selectedFiscalYear.match(/\d{4}/)?.[0]);
  const selectedMonthDate = Number.isFinite(selectedYearStart)
    ? dayjs(`${selectedYearStart}-04-01`).add(previousMonthIndex, "month")
    : null;
  const summaryMonthLabel = selectedMonthDate?.format("MMM-YY") || "-";
  const summaryMonthIncome = selectedIncome[previousMonthIndex] || 0;
  const summaryMonthExpense = selectedExpense[previousMonthIndex] || 0;
  const perSqft = (value) => (totalSqft ? value / totalSqft : 0);

  const buildCardData = (cardTitle, values, highlightNegativePositive = false) => ({
    cardTitle,
    timePeriod: selectedFiscalYear,
    highlightNegativePositive,
    descriptionData: [
      {
        title: summaryMonthLabel,
        value: `INR ${inrFormat(values.month)}`,
        route: "/app/dashboard/investor-dashboard/monthly-profit-loss",
      },
      {
        title: "Annual Average",
        value: `INR ${inrFormat(values.total / 12)}`,
        route: "/app/dashboard/investor-dashboard/annual-average-profit-loss",
      },
      {
        title: "Overall",
        value: `INR ${inrFormat(values.total)}`,
        route: "/app/dashboard/investor-dashboard/overall-profit-loss",
      },
      {
        title: "Per Sq. Ft.",
        value: `INR ${inrFormat(perSqft(values.total))}`,
        route: "/app/dashboard/investor-dashboard/sqft-wise-data",
      },
    ],
  });

  const options = {
    chart: {
      id: "investor-income-vs-expense",
      animations: { enabled: false },
      events: {
        dataPointSelection: () =>
          navigate("/app/dashboard/investor-dashboard/monthly-profit-loss"),
      },
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    plotOptions: { bar: { horizontal: false, columnWidth: "70%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    legend: { show: true, position: "top" },
    yaxis: {
      min: 0,
      title: { text: "Amount In Lakhs (INR)" },
      labels: { formatter: (value) => `${Math.round(value / 100000)}` },
    },
    tooltip: { y: { formatter: (value) => `INR ${inrFormat(value)}` } },
  };

  return (
   <div className="flex flex-col gap-8">
      <YearlyGraph
        data={series}
        options={options}
        chartId="bargraph-investor-income-expense"
        title="BIZNest FINANCE INCOME V/S EXPENSE"
        TitleAmountGreen={`INR ${inrFormat(totals.income)}`}
        TitleAmountRed={`INR ${inrFormat(totals.expense)}`}
        currentYear={selectedFiscalYear}
        onYearChange={setSelectedFiscalYear}
        refreshOnDataChange
      />
      {showSummaryCards && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FinanceCard
            {...buildCardData("Income", {
              month: summaryMonthIncome,
              total: totals.income,
            })}
          />
          <FinanceCard
            {...buildCardData("Expense", {
              month: summaryMonthExpense,
              total: totals.expense,
            })}
          />
          <FinanceCard
            {...buildCardData(
              "Profit & Loss",
              {
                month: summaryMonthIncome - summaryMonthExpense,
                total: totals.income - totals.expense,
              },
              true,
            )}
          />
        </div>
      )}
    </div>      
  );
};

const yearCategories = {
  "FY 2024-2025": [
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
  "FY 2025-2026": [
    "Apr-25",
    "May-25",
    "Jun-25",
    "Jul-25",
    "Aug-25",
    "Sep-25",
    "Oct-25",
    "Nov-25",
    "Dec-25",
    "Jan-26",
    "Feb-26",
    "Mar-26",
  ],
};

const InvestorDashboard = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const { hasPermission } = useUserPermissions();
  const showDetails = location.pathname.endsWith("/historical-P&L");
  const showIncomeExpensePage = location.pathname.endsWith("/income-expense");
  const showUniqueClientsPage = location.pathname.endsWith("/unique-clients");
  const showInventoryPage = location.pathname.endsWith("/inventory");
   const meetingGraphRoutes = {
    utilization: "/meeting-room-utilization",
    guests: "/external-guests-visited",
    occupancy: "/average-room-occupancy",
    busy: "/busy-time-during-week",
    visitors: "/monthly-total-visitors",
   // duration: "/meeting-duration-breakdown",
  };
   const operationalGraphRoutes = {
    sector: "/app/dashboard/investor-dashboard/sector-wise-occupancy",
    client: "/app/dashboard/investor-dashboard/client-wise-occupancy",
    gender: "/app/dashboard/investor-dashboard/client-member-gender-wise-data",
    india: "/app/dashboard/investor-dashboard/india-wise-members",
    desks: "/app/dashboard/investor-dashboard/total-desks-company-wise",
    visitorCategory: "/app/dashboard/investor-dashboard/overall-visitor-category",
    visitorClientType: "/app/dashboard/investor-dashboard/overall-visitor-client-type",
    visitorGender: "/app/dashboard/investor-dashboard/overall-visitor-gender-data",
  };
  const showDashboardHome = location.pathname.endsWith("/investor-dashboard");
  const canViewHistoricalPnlGraph = hasPermission(
    PERMISSIONS.INVESTOR_HISTORICAL_PNL_GRAPH.value,
  );
  const canViewIncomeExpenseGraph = hasPermission(
    PERMISSIONS.INVESTOR_INCOME_EXPENSE_GRAPH.value,
  );
   const canViewFinanceSummaryCards = hasPermission(
    PERMISSIONS.INVESTOR_FINANCE_SUMMARY_CARDS.value,
  );
 const canViewUniqueClientsGraph = hasPermission(
    PERMISSIONS.INVESTOR_UNIQUE_CLIENTS_GRAPH.value,
  );
  const canViewInventoryOverview = hasPermission(
    PERMISSIONS.INVESTOR_INVENTORY_OVERVIEW.value,
  );
  const meetingGraphPermissions = {
    utilization: PERMISSIONS.INVESTOR_MEETING_ROOM_UTILIZATION.value,
    guests: PERMISSIONS.INVESTOR_EXTERNAL_GUESTS_VISITED.value,
    occupancy: PERMISSIONS.INVESTOR_AVERAGE_ROOM_OCCUPANCY.value,
    busy: PERMISSIONS.INVESTOR_BUSY_TIME_WEEK.value,
   // duration: PERMISSIONS.INVESTOR_MEETING_DURATION_BREAKDOWN.value,
       visitors: PERMISSIONS.INVESTOR_MONTHLY_TOTAL_VISITORS.value,
  };
  const visibleMeetingGraphs = Object.keys(meetingGraphRoutes).filter(
    (key) =>
      hasPermission(meetingGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(meetingGraphRoutes[key])),
  );
 const operationalGraphPermissions = {
    sector: PERMISSIONS.INVESTOR_SECTOR_WISE_OCCUPANCY.value,
    client: PERMISSIONS.INVESTOR_CLIENT_WISE_OCCUPANCY.value,
    gender: PERMISSIONS.INVESTOR_CLIENT_MEMBER_GENDER_WISE_DATA.value,
    india: PERMISSIONS.INVESTOR_INDIA_WISE_MEMBERS.value,
    desks: PERMISSIONS.INVESTOR_TOTAL_DESKS_COMPANY_WISE.value,
    visitorCategory: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CATEGORY.value,
    visitorClientType: PERMISSIONS.INVESTOR_OVERALL_VISITOR_CLIENT_TYPE.value,
    visitorGender: PERMISSIONS.INVESTOR_OVERALL_VISITOR_GENDER_DATA.value,
  };
  const visibleOperationalGraphs = Object.keys(operationalGraphRoutes).filter(
    (key) =>
      hasPermission(operationalGraphPermissions[key]) &&
      (showDashboardHome || location.pathname.endsWith(operationalGraphRoutes[key])),
  );
  const { data: revenueExpenseData = [], isLoading } = useQuery({
    queryKey: ["historicalIncomeExpense"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/income-expense");
      return Array.isArray(response.data?.response) ? response.data.response : [];
    },
     enabled: showDetails || canViewHistoricalPnlGraph,
  });

  //-----------------------------------------------------Graph------------------------------------------------------//
  // Base data for first 3 years
  const baseIncomeData = [25174680, 31929380, 31929380];
  const baseExpenseData = [24168780, 33899540, 33899540];

  // Replace last year with Redux values (default to 0 if not available)
  const historicalData = useMemo(() => {
    const expenseItems = revenueExpenseData
      .filter((item) => item.expense)
      .flatMap((item) => item.expense || []);

    const incomeItems = revenueExpenseData.flatMap((item) => {
      const income = item.income || {};
      return [
        ...(Array.isArray(income.meetingRevenue) ? income.meetingRevenue : []),
        ...(Array.isArray(income.alternateRevenues)
          ? income.alternateRevenues
          : []),
        ...(Array.isArray(income.virtualOfficeRevenues)
          ? income.virtualOfficeRevenues
          : []),
        ...(Array.isArray(income.workationRevenues)
          ? income.workationRevenues
          : []),
        ...(Array.isArray(income.coworkingRevenues)
          ? income.coworkingRevenues
          : []),
      ];
    });

    const summary = Object.entries(yearCategories).map(([fiscalYear, months]) => {
      const income = incomeItems.reduce((sum, item) => {
        const rawDate = item.date || item.rentDate || item.invoiceCreationDate;
        if (!rawDate || !dayjs(rawDate).isValid()) return sum;
        if (!months.includes(dayjs(rawDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.taxableAmount) || Number(item.revenue) || Number(item.taxable) || 0);
      }, 0);

      const expense = expenseItems.reduce((sum, item) => {
        if (!item?.dueDate || !dayjs(item.dueDate).isValid()) return sum;
        if (!months.includes(dayjs(item.dueDate).format("MMM-YY"))) return sum;

        return sum + (Number(item.actualAmount) || 0);
      }, 0);

      return {
        fiscalYear,
        income,
        expense,
        profitLoss: income - expense,
      };
    });

    return summary;
  }, [revenueExpenseData]);

  const incomeExpenseData = [
    {
      name: "Income",
      data: [...baseIncomeData, ...historicalData.map((item) => item.income)],
    },
    {
      name: "Expense",
      data: [...baseExpenseData, ...historicalData.map((item) => item.expense)],
    },
  ];

  const incomeExpenseOptions = {
    chart: {
      id: "income-vs-expense-bar",
      toolbar: { show: false },
      fontFamily: "Poppins-Regular",
    },
    colors: ["#54C4A7", "#EB5C45"],
    legend: {
      show: true,
      position: "top",
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "40%",
        borderRadius: 6,
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
      categories:
        ["FY 2021-22", "FY 2022-23", "FY 2023-24", ...historicalData.map((item) => item.fiscalYear)],
    },
    yaxis: {
      title: {
        text: "Amount In Crores (INR)",
      },
      labels: {
        formatter: (val) => `${Math.round(val / 10000000)}`,
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

  const historicalTableData = [
    ...baseIncomeData,
    ...historicalData.map(item => item.income),
  ].map((incomeValue, index) => {
    const isBaseYear = index < 3;

    const name = isBaseYear
      ? `FY ${2021 + index}-${2022 + index}`
      : historicalData[index - 3].fiscalYear;

    const income = isBaseYear
      ? baseIncomeData[index]
      : historicalData[index - 3].income;

    const expense = isBaseYear
      ? baseExpenseData[index]
      : historicalData[index - 3].expense;

    const profitLoss = income - expense;

    return {
      srNo: index + 1,           // ← this is the clean fix
      name,
      totalIncome: inrFormat(income),
      totalExpense: inrFormat(expense),
      totalProfitLoss: inrFormat(profitLoss),
    };
  });

  return (
    <div className="flex flex-col gap-8">
      {showDashboardHome && canViewHistoricalPnlGraph && (
        <WidgetSection layout={1}>
          <WidgetSection border title={"Historical P&L"}>
            {isLoading ? (
              <div className="h-72 flex items-center justify-center">
                <CircularProgress />
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    "/app/dashboard/investor-dashboard/historical-P&L",
                  )
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(
                      "/app/dashboard/investor-dashboard/historical-P&L",
                    );
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label="View historical profit and loss details"
              >
                <NormalBarGraph
                  data={incomeExpenseData}
                  options={incomeExpenseOptions}
                />
              </div>
            )}
          </WidgetSection>
        </WidgetSection>
      )}

      {(showDashboardHome || showIncomeExpensePage) && canViewIncomeExpenseGraph && (
        <WidgetSection layout={1}>
          <InvestorIncomeExpenseGraph
            showSummaryCards={canViewFinanceSummaryCards}
          />
        </WidgetSection>
      )}
         {(showDashboardHome || showUniqueClientsPage) &&
        canViewUniqueClientsGraph && <InvestorUniqueClientsGraph />}

      {(showDashboardHome || showInventoryPage) && canViewInventoryOverview && (
        <CheckAvailability />
      )}
      {visibleMeetingGraphs.length > 0 && (
        <WidgetSection layout={1}>
          <InvestorMeetingAnalytics visibleGraphs={visibleMeetingGraphs} />
        </WidgetSection>
      )}
       {visibleOperationalGraphs.length > 0 && (
        <InvestorOperationalCharts
          visibleCharts={visibleOperationalGraphs}
          routes={operationalGraphRoutes}
        />
      )}


      {showDetails && (
        <WidgetSection layout={1}>
          <WidgetSection title={"Historical P&L Details"} border>
            <AgTable
              columns={[
                { field: "srNo", headerName: "Sr No", sort: "desc" },
                { field: "name", headerName: "Financial Year", flex: 1 },
                { field: "totalIncome", headerName: "Total Income (INR)" },
                { field: "totalExpense", headerName: "Total Expense (INR)" },
                {
                  field: "totalProfitLoss",
                  headerName: "Total Profit / Loss (INR)",
                },
              ]}
              hideFilter
              data={historicalTableData}
              exportData
            />
          </WidgetSection>
        </WidgetSection>
      )}
    </div>
  );
};

export default InvestorDashboard;


// const InvestorDashboard = () => {
//   return (
//     <section className="rounded-lg bg-white p-6 shadow-sm">
//       <h1 className="text-2xl font-semibold text-gray-800">
//         Investor Dashboard
//       </h1>
//     </section>
//   );
// };

// export default InvestorDashboard;
