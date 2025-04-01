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

const totalAssets = 5000; // Total assets count
const assignedAssets = 3600; // Assigned assets count
const unassignedAssets = totalAssets - assignedAssets; // Calculate unassigned assets

// Process Data for Pie Chart
const assetAvailabilityData = [
  {
    label: "Assigned Assets",
    value: ((assignedAssets / totalAssets) * 100).toFixed(1),
    count: assignedAssets,
  },
  {
    label: "UnAssigned Assets",
    value: ((unassignedAssets / totalAssets) * 100).toFixed(1),
    count: unassignedAssets,
  },
];

// ApexCharts Options
const assetAvailabilityOptions = {
  chart: {
    fontFamily: "Poppins-Regular",
  },
  labels: assetAvailabilityData.map((item) => item.label), // Labels: Assigned & UnAssigned
  legend: { show: true }, // Hide default ApexCharts legend
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(1)}%`, // Show percentage
  },
  tooltip: {
    y: {
      formatter: (val, { seriesIndex }) => {
        const count = assetAvailabilityData[seriesIndex].count; // Get the count of assets
        return `${count} assets (${val}%)`;
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
  { label: "IT", value: 1200 },
  { label: "Finance", value: 900 },
  { label: "HR", value: 700 },
  { label: "Operations", value: 1100 },
  { label: "Marketing", value: 1100 },
];

const totalDepartmentAssets = departmentWiseAssets.reduce(
  (sum, dept) => sum + dept.value,
  0
);

const departmentPieData = departmentWiseAssets.map((dept) => ({
  label: `${dept.label} Department`,
  value: ((dept.value / totalDepartmentAssets) * 100).toFixed(1),
  count: dept.value,
}));

const departmentPieOptions = {
  chart: {
    fontFamily: "Poppins-Regular",
  },
  labels: departmentPieData.map((item) => item.label),
  legend: { show: true },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(0)}%`,
  },
  tooltip: {
    y: {
      formatter: (val, { seriesIndex }) => {
        const count = departmentPieData[seriesIndex].count;
        return `${count} assets (${val}%)`;
      },
    },
  },
  colors: ["#003f5c", "#2f4b7c", "#665191", "#a05195", "#d45087"], // Different colors for departments
};

// -----------------------Department Pie Data End--------------------

// -----------------------Asset categories Donut Data Start--------------------
const assetCategoriesData = {
  labels: ["Chairs", "Printers", "Bottles", "Markers"],
  series: [30, 25, 20, 25], // Example percentage distribution
  colors: ["#FF5733", "#FFC300", "#36A2EB", "#4CAF50"], // Example colors for each category
  centerLabel: "Assets",
  title: "Asset Categories Distribution",
};

// -----------------------Asset categories Donut Data End--------------------
// -----------------------Recently Added Assets Start--------------------
const recentAssetsColumns = [
  { id: "id", label: "ID" },
  { id: "department", label: "Department" },
  { id: "assetNumber", label: "Asset Number" },
  { id: "category", label: "Category" },
  { id: "brand", label: "Brand" },
  { id: "price", label: "Price", align: "right" },
  { id: "quantity", label: "Quantity", align: "right" },
  { id: "purchaseDate", label: "Purchase Date" },
  { id: "warranty", label: "Warranty (Months)" },
  {
    id: "actions",
    label: "Actions",
    align: "center",
    renderCell: () => <PrimaryButton title={"Details"} />,
  },
];

const recentAssetsData = [
  {
    id: 1,
    department: "HR",
    assetNumber: "L0001",
    category: "Laptop",
    brand: "Lenovo",
    price: "₹55,000",
    quantity: 2,
    purchaseDate: "02/01/2025",
    warranty: 12,
  },
  {
    id: 2,
    department: "IT",
    assetNumber: "P0002",
    category: "Printer",
    brand: "HP",
    price: "₹15,000",
    quantity: 1,
    purchaseDate: "15/02/2025",
    warranty: 24,
  },
  {
    id: 3,
    department: "Finance",
    assetNumber: "C0003",
    category: "Chair",
    brand: "Godrej",
    price: "₹5,000",
    quantity: 4,
    purchaseDate: "10/03/2025",
    warranty: 36,
  },
  {
    id: 4,
    department: "Marketing",
    assetNumber: "B0004",
    category: "Bottle",
    brand: "Milton",
    price: "₹700",
    quantity: 10,
    purchaseDate: "20/04/2025",
    warranty: 12,
  },
  {
    id: 5,
    department: "HR",
    assetNumber: "M0005",
    category: "Marker",
    brand: "Camlin",
    price: "₹50",
    quantity: 25,
    purchaseDate: "05/05/2025",
    warranty: 6,
  },
  {
    id: 6,
    department: "Admin",
    assetNumber: "D0006",
    category: "Desk",
    brand: "IKEA",
    price: "₹12,000",
    quantity: 3,
    purchaseDate: "12/06/2025",
    warranty: 24,
  },
  {
    id: 7,
    department: "Operations",
    assetNumber: "S0007",
    category: "Scanner",
    brand: "Canon",
    price: "₹18,000",
    quantity: 1,
    purchaseDate: "25/07/2025",
    warranty: 18,
  },
];
// -----------------------Recently Added Assets End--------------------

export {
  assetUtilizationOptions,
  assetUtilizationSeries,
  assetAvailabilityData,
  assetAvailabilityOptions,
  physicalDigitalOptions,
  physicalDigitalPieData,
  departmentPieData,
  departmentPieOptions,
  assetCategoriesData,
  recentAssetsColumns,
  recentAssetsData,
};
