import { Button } from "@mui/material";
import PrimaryButton from "../../../components/PrimaryButton";

// Asset Value data start
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

const totalAssetValues = {
  Apr: 6,
  May: 7,
  Jun: 6.5,
  Jul: 7.2,
  Aug: 6.8,
  Sep: 7.5,
  Oct: 8,
  Nov: 7.8,
  Dec: 8.2,
  Jan: 5,
  Feb: 4.5,
  Mar: 5.5,
}; // Values in crores

const usedAssetValues = {
  Apr: 5.4,
  May: 6.3,
  Jun: 3.8,
  Jul: 6.7,
  Aug: 6.2,
  Sep: 7,
  Oct: 7.4,
  Nov: 7.2,
  Dec: 7.9,
  Jan: 4.5,
  Feb: 4.2,
  Mar: 5,
}; // Values in crores

const assetsUnderMaintenance = {
  Apr: 50,
  May: 30,
  Jun: 40,
  Jul: 10,
  Aug: 10,
  Sep: 10,
  Oct: 8,
  Nov: 10,
  Dec: 10,
  Jan: 10,
  Feb: 10,
  Mar: 10,
};

const assetsDamaged = {
  Apr: 10,
  May: 20,
  Jun: 10,
  Jul: 10,
  Aug: 10,
  Sep: 10,
  Oct: 10,
  Nov: 10,
  Dec: 10,
  Jan: 10,
  Feb: 10,
  Mar: 5,
};

const assetUtilizationData = financialYearMonths.map((month) => {
  return ((usedAssetValues[month] / totalAssetValues[month]) * 100).toFixed(2);
});

const assetUtilizationSeries = [
  { name: "Asset Utilization", data: assetUtilizationData },
];

const assetUtilizationOptions = {
  chart: { type: "bar", fontFamily: "Poppins-Regular" },
  xaxis: { categories: financialYearMonths },
  yaxis: {
    max: 100,
    title: { text: "Utilization (%)" },
    labels: {
      formatter: function (value) {
        return Math.round(value) + "%"; // Removes decimals
      },
    },
  },
  dataLabels: {
    enabled: true,
    formatter: function (val) {
      return Math.round(val) + "%"; // Display percentage without decimals
    },
    style: {
      fontSize: "11px",
      colors: ["#ffff"], // White for visibility
    },
  },
  tooltip: {
    enabled: true,
    shared: false, // Ensures that no blue dot appears
    custom: function ({ seriesIndex, dataPointIndex, w }) {
      const month = financialYearMonths[dataPointIndex];
      const totalValue = totalAssetValues[month].toFixed(2);
      const usedValue = usedAssetValues[month].toFixed(2);
      const underMaintenance = assetsUnderMaintenance[month];
      const damaged = assetsDamaged[month];

      return `
                <div style="padding: 10px; background: white; border-radius: 5px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);">
                    <div style="padding-bottom : 5px; border-bottom: 1px solid gray; margin-bottom:10px">
                        <strong>${month}</strong><br>
                    </div> 
                    Total Assets Value: ₹${totalValue} Cr<br>
                    Asset Value Used: ₹${usedValue} Cr<br>
                    Under Maintenance: ₹${underMaintenance} k<br>
                    Assets Damaged: ₹${damaged} k
                </div>
            `;
    },
  },
  plotOptions: {
    bar: {
      dataLabels: {
        position: "top",
      },
      borderRadius: 5,
      columnWidth: "40%",
    },
  },
};
// Asset Value data end

//---------------Asset Availabilty Pie start--------------------

const totalAssets = 50; // Total assets count
const assignedAssets = 36; // Assigned assets count
const unassignedAssets = totalAssets - assignedAssets; // Calculate unassigned assets

// Process Data for Pie Chart
const assetAvailabilityDataV = [
  {
    label: "Checked Out",
    value: ((assignedAssets / totalAssets) * 100).toFixed(1),
    count: assignedAssets,
  },
  {
    label: "Checked In",
    value: ((unassignedAssets / totalAssets) * 100).toFixed(1),
    count: unassignedAssets,
  },
];

// ApexCharts Options
const assetAvailabilityOptionsV = {
  chart: {
    fontFamily: "Poppins-Regular",
  },
  labels: assetAvailabilityDataV.map((item) => item.label), // Labels: Assigned & UnAssigned
  legend: { show: true }, // Hide default ApexCharts legend
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`, // Show percentage
  },
  tooltip: {
    y: {
      formatter: (val, { seriesIndex }) => {
        const count = assetAvailabilityDataV[seriesIndex].count; // Get the count of assets
        return `${count} visitors (${val}%)`;
      },
    },
  },
  colors: ["#28a745", "#dc3545"], // Green for Assigned, Red for UnAssigned
};

//----------------Asset Availabilty Pie end------------------------

// -----------------------Physical vs Digital Assets Pie Data Start--------------------
const physicalAssets = 3000;
const digitalAssets = 2000;

const physicalDigitalPieData = [
  {
    label: "Physical Assets",
    value: ((physicalAssets / totalAssets) * 100).toFixed(1),
    count: physicalAssets,
  },
  {
    label: "Digital Assets",
    value: ((digitalAssets / totalAssets) * 100).toFixed(1),
    count: digitalAssets,
  },
];

// 🔹 ApexCharts Options for Physical vs. Digital Assets
const physicalDigitalOptions = {
  chart: {
    fontFamily: "Poppins-Regular",
  },
  labels: physicalDigitalPieData.map((item) => item.label),
  legend: { show: true },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`,
  },
  tooltip: {
    y: {
      formatter: (val, { seriesIndex }) => {
        const count = physicalDigitalPieData[seriesIndex].count;
        return `${count} assets (${val}%)`;
      },
    },
  },
  colors: ["#007bff", "#f39c12"], // Blue: Physical, Orange: Digital
};

// -----------------------Physical vs Digital Assets Pie Data End--------------------

// -----------------------Department Pie Data Start--------------------
const departmentWiseAssets = [
  { label: "IT", value: 120 },
  { label: "Tech", value: 90 },
  { label: "HR", value: 70 },
  { label: "Sales", value: 110 },
  { label: "Admin", value: 110 },
];

const totalDepartmentAssets = departmentWiseAssets.reduce(
  (sum, dept) => sum + dept.value,
  0
);

const departmentPieDataVX = departmentWiseAssets.map((dept) => ({
  label: `${dept.label} Department`,
  value: ((dept.value / totalDepartmentAssets) * 100).toFixed(1),
  count: dept.value,
}));

const departmentPieOptionsVX = {
  chart: {
    fontFamily: "Poppins-Regular",
  },
  labels: departmentPieDataVX.map((item) => item.label),
  legend: { show: true },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(0)}%`,
  },
  tooltip: {
    y: {
      formatter: (val, { seriesIndex }) => {
        const count = departmentPieDataVX[seriesIndex].count;
        return `${count} visitors (${val}%)`;
      },
    },
  },
  colors: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087"], // Different colors for departments
};

// -----------------------Department Pie Data End--------------------

// -----------------------Asset categories Donut Data Start--------------------
const assetCategoriesDataV = {
  labels: ["Walk In", "Booked", "Scheduled"],
  series: [30, 10, 60], // Example percentage distribution
  colors: ["#FF5733", "#FFC300", "#36A2EB"], // Example colors for each category
  centerLabel: "Visitors",
  title: "Visitor Categories Distribution",
};

// -----------------------Asset categories Donut Data End--------------------
// -----------------------Recently Added Assets Start--------------------
const recentAssetsColumnsVX = [
  { id: "id", label: "Sr No" },
  { id: "department", label: "Name" },
  { id: "assetNumber", label: "Address" },
  { id: "category", label: "Email" },
  { id: "brand", label: "Phone No" },
  { id: "price", label: "Purpose", align: "right" },
  { id: "quantity", label: "To Meet", align: "right" },
  { id: "purchaseDate", label: "Check In" },
  { id: "warranty", label: "Checkout" },
  //   {
  //     id: "actions",
  //     label: "Actions",
  //     align: "center",
  //     renderCell: () => <PrimaryButton title={"View"} />,
  //   },
];

const recentAssetsDataVX = [
  {
    id: 1,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 2,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 3,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 4,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 5,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 6,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
  {
    id: 7,
    department: "John Doe",
    assetNumber: "Mapusa",
    category: "johndoe@gmail.com",
    brand: "9876543201",
    price: "Investor meeting",
    quantity: "Abrar Shaikh",
    purchaseDate: "09:00 AM",
    warranty: "06:00 PM",
  },
];
// -----------------------Recently Added Assets End--------------------

export {
  assetUtilizationOptions,
  assetUtilizationSeries,
  assetAvailabilityDataV,
  assetAvailabilityOptionsV,
  physicalDigitalOptions,
  physicalDigitalPieData,
  departmentPieDataVX,
  departmentPieOptionsVX,
  assetCategoriesDataV,
  recentAssetsColumnsVX,
  recentAssetsDataVX,
};
