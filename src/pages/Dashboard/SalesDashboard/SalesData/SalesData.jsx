import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

dayjs.extend(duration);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// Annual revenue graph start

const financialYearMonths = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
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

// ✅ Get the current month index relative to financial year (April = 0, March = 11)
const currentMonthIndex = new Date().getMonth() - 3;
const normalizedCurrentMonth =
  currentMonthIndex < 0 ? currentMonthIndex + 12 : currentMonthIndex;

// ✅ Carry-Forward Logic for Future Months
const adjustProjectedData = (actualData, projectedData) => {
  let adjustedProjectedData = [...projectedData]; // Copy original projected values
  let carryForward = 0;

  for (let i = 0; i < projectedData.length; i++) {
    if (i <= normalizedCurrentMonth && actualData[i] !== null) {
      // For past/current months with actual data, use that
      adjustedProjectedData[i] = actualData[i];
    } else {
      // For future months, use projected + carry-forward
      adjustedProjectedData[i] += carryForward;
      carryForward = adjustedProjectedData[i];
    }
  }
  return adjustedProjectedData;
};

// ✅ Process Data: Aggregate Actual and Adjusted Projected Revenue Across Domains
const actualRevenue = new Array(financialYearMonths.length).fill(0);
const projectedRevenue = new Array(financialYearMonths.length).fill(0);

annualMonthlyRawData.forEach((domain) => {
  const adjustedProjectedData = adjustProjectedData(
    domain.actualData,
    domain.projectedData
  );

  for (let i = 0; i < financialYearMonths.length; i++) {
    if (i <= normalizedCurrentMonth && domain.actualData[i] !== null) {
      actualRevenue[i] += domain.actualData[i];
    } else {
      projectedRevenue[i] += adjustedProjectedData[i];
    }
  }
});

// Calculate total sums
const totalActualRevenue = actualRevenue.reduce((sum, value) => sum + value, 0);
const totalProjectedRevenue = projectedRevenue.reduce(
  (sum, value) => sum + value,
  0
);

// ✅ Format Data for ApexCharts (Separate Bars for Actual and Projected)
const annualMonthlyData = [
  {
    name: "Actual Revenue",
    data: actualRevenue,
    color: "#80bf01",
  },
  {
    name: "Projected Revenue",
    data: projectedRevenue,
    color: "#1E3D73",
  },
];

const annualMonthlyOptions = {
  chart: {
    type: "bar",
    stacked: false,
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: "top",
      },
    },
  },
  xaxis: {
    categories: financialYearMonths,
    title: { text: "Months" },
  },
  yaxis: {
    labels: {
      formatter: (val) => {
        if (val >= 10000000) return (val / 10000000).toFixed(1) + "Cr";
        if (val >= 100000) return (val / 100000).toFixed(1) + "L";
        return val;
      },
    },
    title: { text: "Revenue" },
  },
  legend: { position: "top" },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat("en-IN").format(val),
    },
  },
};

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
];

// ✅ Process Data: Stack Leads from Each Domain for Each Month
const monthlyLeadsData = leadsData.map((domain) => ({
  name: domain.domain, // Each domain gets a stacked bar
  data: domain.leads, // Monthly leads count
}));

const monthlyLeadsOptions = {
  chart: {
    type: "bar",
    stacked: true, // Enable stacking for domains
  },
  xaxis: {
    categories: financialYearMonths,
    title: { text: "Months" },
  },
  yaxis: {
    title: { text: "Lead Count" },
  },
  legend: { position: "top" },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val) => `${val} Leads`,
    },
  },
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
    stacked: true, // Enable stacking for domains
  },
  xaxis: {
    categories: financialYearMonths,
    title: { text: "Months" },
  },
  yaxis: {
    title: { text: "Lead Count" },
  },
  legend: { position: "top" },
  dataLabels: { enabled: false },
  tooltip: {
    y: {
      formatter: (val) => `${val} Leads`,
    },
  },
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
    client: "Swiggy",
    sector: "Food Delivery",
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
    client: "Uber",
    sector: "Ride Sharing",
    location: "Mumbai",
    totalSeatsTaken: 8,
    startDate: "2021-09-20",
    members: [{ id: 5, empName: "Michael", dateOfBirth: "1985-06-30" }],
  },
  {
    id: 4,
    client: "Ola",
    sector: "Ride Sharing",
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
    client: "Flipkart",
    sector: "E-commerce",
    location: "Bangalore",
    totalSeatsTaken: 5,
    startDate: "2020-07-30",
    members: [{ id: 8, empName: "Ethan", dateOfBirth: "1989-12-10" }],
  },
  {
    id: 6,
    client: "Amazon",
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
    client: "Microsoft",
    sector: "Technology",
    location: "Hyderabad",
    totalSeatsTaken: 6,
    startDate: "2023-03-11",
    members: [{ id: 11, empName: "Ava", dateOfBirth: "1993-05-30" }],
  },
  {
    id: 8,
    client: "Google",
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

const sectorPieChartOptions = {
  chart: {
    type: "pie",
  },
  labels: sectorPieChartData.map((item) => item.label),
  tooltip: {
    y: {
      formatter: (val) => `${val.toFixed(2)}%`, // Show as percentage
    },
  },
  legend: {
    position: "right",
  },
};

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
const locationMap = {};

clientOccupancyData.forEach((client) => {
  if (!locationMap[client.location]) {
    locationMap[client.location] = 0;
  }
  locationMap[client.location] += 1; // Count companies per location
});

// ✅ Convert to Pie Chart Format
const locationPieChartData = Object.keys(locationMap).map((location) => ({
  label: location,
  value: locationMap[location],
}));

const locationPieChartOptions = {
  chart: {
    type: "pie",
  },
  labels: locationPieChartData.map((item) => item.label),
  tooltip: {
    y: {
      formatter: (val) => `${val} Companies`, // Show as count
    },
  },
  legend: {
    position: "right",
  },
};

// -----------------------Sector categories Pie Data End--------------------
// -----------------------Recently Added Assets Start--------------------

const calculateCompletedTime = (startDate) => {
  const start = dayjs(startDate);
  const today = dayjs();
  const diff = dayjs.duration(today.diff(start));

  const years = diff.years();
  const months = diff.months();
  const days = diff.days();

  let result = [];
  if (years > 0) result.push(`${years} year${years > 1 ? "s" : ""}`);
  if (months > 0) result.push(`${months} month${months > 1 ? "s" : ""}`);
  if (days > 0 || result.length === 0)
    result.push(`${days} day${days > 1 ? "s" : ""}`);

  return result.join(", ");
};

// ✅ Format Data for Table
const companyTableColumns = [
  { id: "id", label: "ID" },
  { id: "company", label: "Company" },
  { id: "startDate", label: "Start Date" },
  { id: "completedTime", label: "Completed Time" },
];

// ✅ Processed Table Data (Including Completed Time)
const formattedCompanyTableData = clientOccupancyData.map((company) => ({
  id: company.id,
  company: company.client,
  startDate: company.startDate,
  completedTime: calculateCompletedTime(company.startDate),
}));

console.log(formattedCompanyTableData);

// -----------------------Recently Added Assets End--------------------
// -----------------------Client Members birthday Start--------------------
const today = dayjs();
const next30days = today.add(30, "days");

const upcomingBirthdays = [];

clientOccupancyData.forEach((company) => {
  company.members.forEach((member) => {
    let birthday = dayjs(member.dateOfBirth).year(today.year());

    if (birthday.isBefore(today, "day")) {
      birthday = birthday.add(1, "year");
    }

    const daysLeft = birthday.diff(today, "day");

    if (birthday.isSameOrAfter(today) && birthday.isSameOrBefore(next30days)) {
      upcomingBirthdays.push({
        id: member.id,
        name: member.empName,
        birthday: member.dateOfBirth,
        daysLeft: daysLeft,
      });
    }
  });
});

upcomingBirthdays.sort((a, b) => dayjs(a.dateOfBirth).diff(dayjs(b.dateOfBirth)));

const upcomingBirthdaysColumns = [
    { id: "id", label: "ID" },
    { id: "name", label: "Employee Name" },
    { id: "birthday", label: "Date of Birth" },
    { id: "daysLeft", label: "Days Left" },
  ];
  

// -----------------------Client Members birthday End--------------------

export {
  annualMonthlyData,
  annualMonthlyOptions,
  totalActualRevenue,
  totalProjectedRevenue,
  monthlyLeadsData,
  monthlyLeadsOptions,
  sourcingChannelsData,
  sourcingChannelsOptions,
  clientOccupancyPieData,
  clientOccupancyPieOptions,
  sectorPieChartData,
  sectorPieChartOptions,
  clientGenderData,
  clientGenderPieChartOptions,
  locationPieChartData,
  locationPieChartOptions,
  companyTableColumns,
  formattedCompanyTableData,
  upcomingBirthdays,
  upcomingBirthdaysColumns
};
