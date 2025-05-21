import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Annual revenue graph start

const financialYearMonths = [
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
];

const annualMonthlyRawData = [
  {
    domain: "Co-working",
    actualData: [
      240000,
      54000,
      70000,
      88000,
      70000,
      81000,
      53000,
      63000,
      null,
      null,
      null,
      null,
    ],
    projectedData: [
      240000, 55000, 75000, 90000, 75000, 85000, 60000, 70000, 75000, 80000,
      85000, 90000,
    ],
  },
  {
    domain: "Meetings",
    actualData: [
      240000,
      54000,
      70000,
      88000,
      70000,
      81000,
      53000,
      63000,
      null,
      null,
      null,
      null,
    ],
    projectedData: [
      240000, 55000, 75000, 90000, 75000, 85000, 60000, 70000, 75000, 80000,
      85000, 90000,
    ],
  },
  {
    domain: "Workation",
    actualData: [
      240000,
      54000,
      70000,
      88000,
      70000,
      81000,
      53000,
      63000,
      null,
      null,
      null,
      null,
    ],
    projectedData: [
      240000, 55000, 75000, 90000, 75000, 85000, 60000, 70000, 75000, 80000,
      85000, 90000,
    ],
  },
];

// Annual revenue graph end

//---------------Monthly Unique Leads start--------------------

const leadsData = [
  {
    domain: "Co-working",
    leads: [50, 30, 20, 40, 35, 25, 60, 80, 90, 45, 55, 70],
  },
  {
    domain: "Meetings",
    leads: [20, 25, 40, 60, 55, 30, 50, 65, 75, 35, 45, 60],
  },
  {
    domain: "Workation",
    leads: [15, 20, 30, 35, 40, 20, 45, 55, 65, 25, 30, 50],
  },
  {
    domain: "Virtual Office",
    leads: [15, 20, 30, 35, 40, 20, 45, 55, 65, 25, 30, 50],
  },
  {
    domain: "Alt Revenue",
    leads: [15, 20, 30, 35, 40, 20, 45, 55, 65, 25, 30, 50],
  },
];

// ✅ Process Data: Stack Leads from Each Domain for Each Month
const monthlyLeadsData = leadsData.map((domain) => ({
  name: domain.domain, // Each domain gets a stacked bar
  data: domain.leads, // Monthly leads count
}));

const monthlyLeadsOptions = {
  chart: {
    type: "bar",
    animations: {
      enabled: false, // ✅ disables all animations
    },
    stacked: true, // Enable stacking for domains
    fontFamily: "Poppins-Regular",
  },
  xaxis: {
    categories: financialYearMonths,
    title: { text: "Months" },
  },
  yaxis: {
    title: { text: "Lead Count" },
  },
  plotOptions: {
    bar: {
      horizontal: false,
      columnWidth: "30%",
      borderRadius: 3,
      dataLabels: {
        position: "center",
      },
    },
  },
  legend: { position: "top" },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val) => `${val} Leads`,
    },
  },
  colors: [
    "#1E3D73", // Dark Blue (Co-Working)
    "#2196F3", // Bright Blue (Meetings)
    "#98F5E1", // Light Mint Green (Virtual Office)
    "#00BCD4", // Cyan Blue (Workation)
    "#1976D2", // Medium Blue (Alt Revenues)
  ],
};

//----------------Monthly Unique Leads end------------------------

// -----------------------Sourcing Channels Start--------------------
const sourcingChannels = [
  {
    channel: "Social Media",
    leads: [50, 30, 20, 40, 35, 25, 60, 80, 90, 45, 55, 70],
  },
  {
    channel: "Agent",
    leads: [20, 25, 40, 60, 55, 30, 50, 65, 75, 35, 45, 60],
  },
  {
    channel: "Broker",
    leads: [15, 20, 30, 35, 40, 20, 45, 55, 65, 25, 30, 50],
  },
];

// ✅ Process Data: Stack Leads from Each Domain for Each Month
const sourcingChannelsData = sourcingChannels.map((channel) => ({
  name: channel.channel, // Each domain gets a stacked bar
  data: channel.leads, // Monthly leads count
}));

const sourcingChannelsOptions = {
  chart: {
    type: "bar",
    animations: {
      enabled: false, // ✅ disables all animations
    },
    toolbar: false,
    stacked: true, // Enable stacking for domains
    fontFamily: "Poppins-Regular",
  },
  // colors: ["#00cdd1"],
  colors: [
    "#1E3D73", // Dark Blue (Co-Working)
    "#2196F3", // Bright Blue (Meetings)
    "#98F5E1", // Light Mint Green (Virtual Office)
    "#00BCD4", // Cyan Blue (Workation)
    "#1976D2", // Medium Blue (Alt Revenues)
  ],
  xaxis: {
    categories: financialYearMonths,
    title: { text: "Months" },
  },
  yaxis: {
    title: { text: "Source Count" },
    tickAmount: 12,
    labels: {
      formatter: (val) => `${val}`, // optional, for clean display
    },
  },
  plotOptions: {
    bar: {
      dataLabels: { position: "top" },
      columnWidth: "35%",
      borderRadius: 3,
    },
  },
  legend: { position: "top", show: false },
  dataLabels: { enabled: true, position: "middle" },
  // tooltip: {
  //   shared: false,
  //   custom: ({ series, seriesIndex, dataPointIndex, w }) => {
  //     if (!w || !w.globals.seriesNames) return "";

  //     // Extract values for the current hovered month
  //     const allLeads = w.globals.series
  //       .map(
  //         (data, index) =>
  //           `${w.globals.seriesNames[index]}: ${data[dataPointIndex]}`
  //       )
  //       .join("<br>");

  //     return `<div style="
  //       background: white;
  //       padding: 10px;
  //       border-radius: 5px;
  //       box-shadow: 0px 0px 5px rgba(0,0,0,0.2);
  //       font-family: Poppins, sans-serif;
  //       font-size: 12px;
  //       color: #333;
  //     ">
  //       ${allLeads}
  //     </div>`;
  //   },
  // },
};

// -----------------------Sourcing Channels End--------------------

// -----------------------Department Pie Data Start--------------------
const totalSeats = 80; // Total available seats

// Raw Client Data
const clientOccupancyData = [
  {
    id: 1,
    client: "Zomato",
    sector: "Food Delivery",
    location: "Delhi",
    totalSeatsTaken: 25,
    startDate: "2023-01-10",
    members: [
      { id: 1, empName: "John", dateOfBirth: "1992-03-10" },
      { id: 2, empName: "Alice", dateOfBirth: "1988-03-22" },
    ],
  },
  {
    id: 2,
    client: "Turtlemint",
    sector: "Technology",
    location: "Bangalore",
    totalSeatsTaken: 15,
    startDate: "2022-06-15",
    members: [
      { id: 3, empName: "Robert", dateOfBirth: "1990-11-15" },
      { id: 4, empName: "Emily", dateOfBirth: "1995-09-05" },
    ],
  },
  {
    id: 3,
    client: "WoNo",
    sector: "Technology",
    location: "Mumbai",
    totalSeatsTaken: 8,
    startDate: "2021-09-20",
    members: [{ id: 5, empName: "Michael", dateOfBirth: "1985-06-30" }],
  },
  {
    id: 4,
    client: "Infuse",
    sector: "Technology",
    location: "Hyderabad",
    totalSeatsTaken: 12,
    startDate: "2022-12-05",
    members: [
      { id: 6, empName: "Sophia", dateOfBirth: "1991-04-18" },
      { id: 7, empName: "Daniel", dateOfBirth: "1994-01-25" },
    ],
  },
  {
    id: 5,
    client: "91 HR",
    sector: "E-commerce",
    location: "Bangalore",
    totalSeatsTaken: 5,
    startDate: "2020-07-30",
    members: [{ id: 8, empName: "Ethan", dateOfBirth: "1989-12-10" }],
  },
  {
    id: 6,
    client: "Zimetrics",
    sector: "E-commerce",
    location: "Chennai",
    totalSeatsTaken: 7,
    startDate: "2019-04-18",
    members: [
      { id: 9, empName: "Charlotte", dateOfBirth: "1996-08-22" },
      { id: 10, empName: "Liam", dateOfBirth: "1987-02-14" },
    ],
  },
  {
    id: 7,
    client: "BDO",
    sector: "Technology",
    location: "Hyderabad",
    totalSeatsTaken: 6,
    startDate: "2023-03-11",
    members: [{ id: 11, empName: "Ava", dateOfBirth: "1993-05-30" }],
  },
  {
    id: 8,
    client: "Squadstack",
    sector: "Technology",
    location: "Mumbai",
    totalSeatsTaken: 2,
    startDate: "2020-10-25",
    members: [{ id: 12, empName: "Noah", dateOfBirth: "1998-01-12" }],
  },
];

// ✅ Process Data: Group clients with <10 seats into "Others"
let processedClients = [];
let othersCount = 0;

clientOccupancyData.forEach((client) => {
  if (client.totalSeatsTaken >= 10) {
    processedClients.push(client);
  } else {
    othersCount += client.totalSeatsTaken;
  }
});

// ✅ Add "Others" category if applicable
if (othersCount > 0) {
  processedClients.push({
    id: 9,
    client: "Others",
    totalSeatsTaken: othersCount,
  });
}

// ✅ Format Data for ApexCharts
const clientOccupancyPieData = processedClients.map((client) => ({
  label: client.client,
  value: ((client.totalSeatsTaken / totalSeats) * 100).toFixed(2), // Convert to percentage
  sector: client.sector, // Keep sector field
}));

const clientOccupancyPieOptions = {
  chart: {
    type: "pie",
    fontFamily: "Poppins-Regular",
  },
  labels: clientOccupancyPieData.map((item) => item.label),
  tooltip: {
    y: {
      formatter: (val) => `${val.toFixed(2)}%`, // Show as percentage
    },
  },
  legend: {
    position: "right",
  },
  colors: ["#34c659", "#2fafc6", "#757575", "#5756d6"],
};

// -----------------------Department Pie Data End--------------------

// -----------------------Sector categories Pie Data Start--------------------

// ✅ Group Clients by Sector
const sectorMap = {};

clientOccupancyData.forEach((client) => {
  if (!sectorMap[client.sector]) {
    sectorMap[client.sector] = 0;
  }
  sectorMap[client.sector] += client.totalSeatsTaken;
});

// ✅ Convert to Pie Chart Format
const sectorPieChartData = Object.keys(sectorMap).map((sector) => ({
  label: sector,
  value: ((sectorMap[sector] / totalSeats) * 100).toFixed(2), // Convert to percentage
}));

// -----------------------Sector categories Pie Data End--------------------

// -----------------------Sector categories Pie Data Start--------------------

// ✅ Group Clients by Sector
const clientGenderData = [
  { label: "Male", value: 60 }, // 60% Male
  { label: "Female", value: 40 }, // 40% Female
];

const clientGenderPieChartOptions = {
  chart: {
    type: "pie",
    fontFamily: "Poppins-Regular",
  },
  labels: clientGenderData.map((item) => item.label),
  tooltip: {
    y: {
      formatter: (val) => `${val.toFixed(2)}%`,
    },
  },
  legend: {
    position: "right",
  },
};

// -----------------------Sector categories Pie Data End--------------------
// -----------------------Sector categories Pie Data Start--------------------

// ✅ Group Clients by Sector
// ✅ Group Companies by Location

// -----------------------Sector categories Pie Data End--------------------
// -----------------------Recently Added Assets Start--------------------

const calculateCompletedTime = (startDate) => {
  const start = dayjs(startDate);
  const today = dayjs();
  const totalMonths = today.diff(start, "month", true);

  if (totalMonths < 1) {
    const totalDays = today.diff(start, "day");
    return `${totalDays} Days`;
  } else if (totalMonths < 12) {
    return `${Math.floor(totalMonths)} Months`;
  } else {
    const years = totalMonths / 12;
    return `${years.toFixed(1)} Years`;
  }
};



// ✅ Format Data for Table

// -----------------------Recently Added Assets End--------------------
// -----------------------Client Members birthday Start--------------------
const upcomingBirthdaysColumns = [
  { id: "id", label: "Sr No" },
  { id: "name", label: "Employee Name" },
  { id: "birthday", label: "Date of Birth" },
  { id: "daysLeft", label: "Days Left" },
  { id: "company", label: "Company" },
];

// -----------------------Client Members birthday End--------------------

export {
  annualMonthlyRawData,
  monthlyLeadsData,
  monthlyLeadsOptions,
  sourcingChannelsData,
  sourcingChannelsOptions,
  clientOccupancyPieData,
  clientOccupancyPieOptions,
  sectorPieChartData,
  clientGenderData,
  clientGenderPieChartOptions,
  upcomingBirthdaysColumns,
  calculateCompletedTime,
  financialYearMonths,
};
