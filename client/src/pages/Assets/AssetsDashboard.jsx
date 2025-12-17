import React from "react";
import { RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted, MdMiscellaneousServices } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../components/Card";
import DonutChart from "../../components/graphs/DonutChart";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import MuiTable from "../../components/Tables/MuiTable";
import BarGraph from "../../components/graphs/BarGraph";
import PieChartMui from "../../components/graphs/PieChartMui";
import {
  assetAvailabilityData,
  assetAvailabilityOptions,
  assetCategoriesData,
  assetUtilizationOptions,
  assetUtilizationSeries,
  departmentPieData,
  departmentPieOptions,
  physicalDigitalOptions,
  physicalDigitalPieData,
  recentAssetsColumns,
  recentAssetsData,
} from "./AssetsData/Data";
import usePageDepartment from "../../hooks/usePageDepartment";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import NormalBarGraph from "../../components/graphs/NormalBarGraph";
import useAuth from "../../hooks/useAuth";
import { inrFormat } from "../../utils/currencyFormat";
import humanDate from "../../utils/humanDateForamt";
import { PERMISSIONS } from "../../constants/permissions";

const AssetsDashboard = () => {
  const { auth } = useAuth();
  const departments = auth.user.departments;

  const axios = useAxiosPrivate();
  //-----------------------MAIN API CALL------------------------------------//
  const { data: departmentAssets, isLoading: isDepartmentLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      try {
        const response = await axios.get(`/api/assets/get-assets`);

        return response.data;
      } catch (error) {
        console.error(error.message);
      }
    },
  });

  const { data: departmentCategories, isLoading: isCategoriesLoading } =
    useQuery({
      queryKey: ["categories"],
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/assets/get-category`);
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });

  //-----------------------MAIN API CALL------------------------------------//
  //---------- Nav Cards ---------//
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const cardsConfig = [
    {
      title: "View Assets",
      route: "/app/assets/view-assets",
      icon: <RiPagesLine />,
      permission: PERMISSIONS.ASSETS_VIEW_ASSETS.value,
    },
    {
      title: "Manage Assets",
      route: "/app/assets/manage-assets",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.ASSETS_MANAGE_ASSETS.value,
    },
    {
      title: "Mix Bag",
      route: "#",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.ASSETS_VIEW_GRAPHS,
    },
    {
      title: "Reports",
      route: "/app/assets/reports",
      icon: <CgProfile />,
      permission: null, // no restriction
    },
    {
      title: "Settings",
      route: "/app/assets/settings",
      icon: <MdMiscellaneousServices />,
      permission: null, // no restriction
    },
  ];
  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission)
  );
  //---------- Nav Cards ---------//

  const isTopManagement = departments.some(
    (dept) => dept.name === "Top Management"
  );
  const deptNames = departments.map((dept) => dept.name);

  let assetsDept = !isDepartmentLoading ? departmentAssets : [];

  if (!isTopManagement) {
    assetsDept = !isDepartmentLoading
      ? departmentAssets.filter((dept) =>
          deptNames.includes(dept.departmentName)
        )
      : [];
  }

  const totalCategories = !isCategoriesLoading
    ? departmentCategories.length
    : 0;
  const totalAssets = isDepartmentLoading
    ? []
    : assetsDept
        ?.filter((dept) => dept.assets.length > 0)
        .flatMap((dept) => dept.assets);

  const totalOwnedAssets = totalAssets.filter((asset) => {
    return asset.ownershipType === "Owned";
  }).length;
  const totalAssignedAssets = totalAssets.filter(
    (asset) => asset.isAssigned
  ).length;
  const totalUnassignedAssets = totalAssets.length - totalAssignedAssets;

  const totalAssetsUnderMaintenance = totalAssets.filter(
    (asset) => asset.isUnderMaintenance
  ).length;

  const totalAssetsPrice = totalAssets.reduce(
    (acc, asset) => acc + asset?.price,
    0
  );

  // Assigned and Unassigned Assets Pie Chart
  const assetAvailabilityData = [
    {
      label: "Assigned Assets",
      value: ((totalAssignedAssets / totalAssets.length) * 100).toFixed(1),
      count: totalAssignedAssets,
    },
    {
      label: "Unassigned Assets",
      value: ((totalUnassignedAssets / totalAssets.length) * 100).toFixed(1),
      count: totalUnassignedAssets,
    },
  ];

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

  // -----------------------Physical vs Digital Assets Pie Data Start--------------------

  const physicalAssets = totalAssets.filter(
    (asset) => asset.assetType === "Physical"
  ).length;
  const digitalAssets = totalAssets.filter(
    (asset) => asset.assetType === "Digital"
  ).length;

  const physicalDigitalPieData = [
    {
      label: "Physical Assets",
      value: ((physicalAssets / totalAssets.length) * 100).toFixed(1),
      count: physicalAssets,
    },
    {
      label: "Digital Assets",
      value: ((digitalAssets / totalAssets.length) * 100).toFixed(1),
      count: digitalAssets,
    },
  ];

  // ApexCharts Options for Physical vs. Digital Assets
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

  const pieChartConfigs = [
    {
      key: "assignedUnassigned",
      title: "Assigned v/s Unassigned Assets",
      layout: 1,
      border: true,
      data: assetAvailabilityData,
      options: assetAvailabilityOptions,
      permission: PERMISSIONS.ASSETS_ASSIGNED_UNASSIGNED.value,
    },
    {
      key: "physicalDigital",
      title: "Physical v/s Digital Assets",
      layout: 1,
      border: true,
      data: physicalDigitalPieData,
      options: physicalDigitalOptions,
      width: 475,
    },
  ];

  const allowedPieCharts = pieChartConfigs.filter(
    (widget) =>
      !widget.permission || userPermissions.includes(widget.permission)
  );

  //---------- Pie Charts ---------//

  //Asset Categories Donut Chart
  const getRandomColor = () =>
    "#" +
    Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0");

  const assetCategoriesData = {
    labels: !isCategoriesLoading
      ? departmentCategories.map((cat) => {
          return cat.categoryName;
        })
      : [],
    series: !isCategoriesLoading
      ? departmentCategories.map((cat) => cat.subCategories.length)
      : [], // Example metric
    tooltipValue: !isCategoriesLoading
      ? departmentCategories.map((cat) => cat.subCategories.length)
      : [], // Can customize
    colors: !isCategoriesLoading
      ? departmentCategories.map(() => getRandomColor())
      : [],
    centerLabel: "Assets",
    title: "Asset Categories Distribution",
  };

  // -----------------------Department Pie Data --------------------

  const departmentWiseAssets = assetsDept.map((dept) => ({
    label: `${dept.departmentName}`,
    value: dept.assets.length,
  }));

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

  const assetColumns = [
    { id: "srNo", label: "Sr No" },
    { id: "assetId", label: "Asset Id" },
    { id: "department", label: "Department" },
    { id: "category", label: "Category" },
    { id: "subCategory", label: "Sub-Category" },
    { id: "brand", label: "Brand" },
    {
      id: "price",
      label: "Price (INR)",
    },
    { id: "purchaseDate", label: "Purchase Date" },
    { id: "warranty", label: "Warranty (Months)" },
  ];

  const recentAssets = isDepartmentLoading
    ? []
    : totalAssets
        .filter((asset) => {
          const currDate = new Date();
          const assetDate = new Date(asset.createdAt);

          return (
            assetDate.getMonth() === currDate.getMonth() &&
            assetDate.getFullYear() === currDate.getFullYear()
          );
        })
        .map((item, index) => {
          const data = {
            ...item,
            srNo: index + 1,
            assetId: item.assetId,
            department: item?.department?.name,
            subCategory: item?.subCategory?.subCategoryName,
            category: item?.subCategory?.category.categoryName,
            brand: item?.brand,
            warranty: item?.warranty,
            purchaseDate: humanDate(item?.purchaseDate),
            price: `INR ${item?.price}`,
          };

          return data;
        });

  //Assets Value Graph

  // Define current financial year months
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
    "Jul-25",
  ];

  // Initialize tracking objects
  let totalAssetValues = {};
  let usedAssetValues = {};
  let assetsUnderMaintenance = {};
  let assetsDamaged = {};

  // Initialize months with 0
  financialYearMonths.forEach((month) => {
    totalAssetValues[month] = 0;
    usedAssetValues[month] = 0;
    assetsUnderMaintenance[month] = 0;
    assetsDamaged[month] = 0;
  });

  // Helper to convert purchase date to FY month
  const getMonthKey = (purchaseDate) => {
    const date = new Date(purchaseDate);
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear().toString().slice(-2);
    return `${month}-${year}`;
  };

  // Aggregate data from all departments
  assetsDept.forEach((dept) => {
    dept.assets.forEach((asset) => {
      const monthKey = getMonthKey(asset.purchaseDate);

      if (financialYearMonths.includes(monthKey)) {
        const price = asset.price || 0;

        totalAssetValues[monthKey] += price;

        if (asset.isAssigned) {
          usedAssetValues[monthKey] += price;
        }

        if (asset.isUnderMaintenance) {
          assetsUnderMaintenance[monthKey] += 1;
        }

        if (asset.isDamaged) {
          assetsDamaged[monthKey] += 1;
        }
      }
    });
  });

  // Calculate utilization
  const assetUtilizationData = financialYearMonths.map((month) => {
    const total = totalAssetValues[month];
    const used = usedAssetValues[month];

    return total ? ((used / total) * 100).toFixed(2) : 0;
  });

  const assetUtilizationSeries = [
    {
      name: "Asset Utilization",
      data: assetUtilizationData,
    },
  ];

  // ApexCharts configuration
  const assetUtilizationOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
    xaxis: {
      categories: financialYearMonths,
    },
    yaxis: {
      max: 100,
      title: {
        text: "Utilization (%)",
      },
      labels: {
        formatter: (value) => `${Math.round(value)}%`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      style: {
        fontSize: "11px",
        colors: ["#ffff"],
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      custom: ({ seriesIndex, dataPointIndex, w }) => {
        const month = financialYearMonths[dataPointIndex];
        const total = totalAssetValues[month].toFixed(2);
        const used = usedAssetValues[month].toFixed(2);
        const underMaintenance = assetsUnderMaintenance[month];
        const damaged = assetsDamaged[month];

        return `
        <div style="padding: 10px; background: white; border-radius: 5px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2);">
          <div style="padding-bottom: 5px; border-bottom: 1px solid gray; margin-bottom:10px">
            <strong>${month}</strong><br>
          </div> 
          Total Assets Value: INR ${inrFormat(total)}<br>
          Asset Value Used: INR ${inrFormat(used)}<br>
          Under Maintenance: ${underMaintenance} <br>
          Assets Damaged: ${damaged} 
        </div>
      `;
      },
      fixed: {
        enabled: true,
        position: "bottomRight",
        offsetX: 0,
        offsetY: -10,
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
    colors: ["#3B82F6"], // fixed color instead of random
  };

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          layout={1}
          border
          title={"Assets Value"}
          titleLabel={"FY 2024-25"}
        >
          <NormalBarGraph
            height={400}
            data={assetUtilizationSeries}
            options={assetUtilizationOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: allowedCards.length, // ✅ dynamic layout
      widgets: allowedCards.map((card) => (
        <Card
          key={card.title}
          route={card.route}
          title={card.title}
          icon={card.icon}
        />
      )),
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title={"Total"}
          data={totalOwnedAssets}
          description={"Assets Owned"}
        />,
        <DataCard
          title={"Total"}
          data={totalCategories}
          description={"Assets Categories"}
        />,
        <DataCard
          title={"Total"}
          data={`INR ${inrFormat(totalAssetsPrice)}`}
          description={"Assets Value"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          title={"Total"}
          data={totalAssignedAssets}
          description={"Assets In Use"}
        />,
        <DataCard
          title={"Total"}
          data={totalUnassignedAssets}
          description={"Unassigned Assets"}
        />,
        <DataCard
          title={"Total"}
          data={totalAssetsUnderMaintenance}
          description={"Assets Under Maintenance"}
        />,
      ],
    },
    {
      layout: allowedPieCharts.length,
      widgets: allowedPieCharts.map((item) => (
        <WidgetSection
          key={item.key}
          layout={item.layout}
          title={item.title}
          border={item.border}
        >
          <PieChartMui
            data={item.data}
            options={item.options}
            width={item.width}
          />
        </WidgetSection>
      )),
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection layout={1} title={"Department Wise Asset Usage"} border>
          <PieChartMui
            data={departmentPieData}
            options={departmentPieOptions}
            width={550}
          />
        </WidgetSection>,
        <WidgetSection layout={1} title={"Asset Categories"} border>
          <DonutChart {...assetCategoriesData} width={440} />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection layout={1} padding>
          <MuiTable
            Title="Recently Added Assets"
            columns={assetColumns}
            rows={recentAssets}
            rowKey="id"
            rowsToDisplay={8}
            className="h-full"
          />
        </WidgetSection>,
      ],
    },
  ];
  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        {meetingsWidgets.map((widget, index) => (
          <div>
            <WidgetSection key={index} layout={widget.layout} padding>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsDashboard;
