import React, { useMemo, useState } from "react";
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
import YearlyGraph from "../../components/graphs/YearlyGraph";
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
          const response = await axios.get(`/api/category/get-category`);
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
      route: "/app/assets/mix-bag",
      icon: <MdFormatListBulleted />,
      permission: PERMISSIONS.ASSETS_VIEW_GRAPHS,
    },
    {
      title: "Reports",
      route: "/app/assets/reports",
      icon: <CgProfile />,
      permission: null, // no restriction
    },
    // {
    //   title: "Settings",
    //   route: "/app/assets/settings",
    //   icon: <MdMiscellaneousServices />,
    //   permission: null, // no restriction
    // },
  ];
  const allowedCards = cardsConfig.filter(
    (card) => !card.permission || userPermissions.includes(card.permission),
  );
  //---------- Nav Cards ---------//

  const isTopManagement = departments.some(
    (dept) => dept.name === "Top Management",
  );
  const deptNames = departments.map((dept) => dept.name);

  let assetsDept = Array.isArray(departmentAssets) ? departmentAssets : [];

  if (!isTopManagement) {
    assetsDept = assetsDept.filter((dept) =>
      deptNames.includes(dept.departmentName),
    );
  }

  const totalCategories = !isCategoriesLoading
    ? departmentCategories.length
    : 0;
  const totalAssets = (isDepartmentLoading || !Array.isArray(assetsDept))
    ? []
    : assetsDept
      .filter((dept) => dept?.assets && Array.isArray(dept.assets))
      .flatMap((dept) => dept.assets);

  const totalOwnedAssets = totalAssets.filter((asset) => {
    return asset.ownershipType === "Owned";
  }).length;
  const totalAssignedAssets = totalAssets.filter(
    (asset) => asset.isAssigned,
  ).length;
  const totalUnassignedAssets = totalAssets.length - totalAssignedAssets;

  const totalAssetsUnderMaintenance = totalAssets.filter(
    (asset) => asset.isUnderMaintenance,
  ).length;

  const totalAssetsPrice = totalAssets.reduce(
    (acc, asset) => acc + (asset?.price || 0),
    0,
  );

  // Assigned and Unassigned Assets Pie Chart
  const assetAvailabilityData = [
    {
      label: "Assigned Assets",
      value: totalAssets.length > 0 ? ((totalAssignedAssets / totalAssets.length) * 100).toFixed(1) : 0,
      count: totalAssignedAssets,
    },
    {
      label: "Unassigned Assets",
      value: totalAssets.length > 0 ? ((totalUnassignedAssets / totalAssets.length) * 100).toFixed(1) : 0,
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
    (asset) => asset.assetType === "Physical",
  ).length;
  const digitalAssets = totalAssets.filter(
    (asset) => asset.assetType === "Digital",
  ).length;

  const physicalDigitalPieData = [
    {
      label: "Physical Assets",
      value: totalAssets.length > 0 ? ((physicalAssets / totalAssets.length) * 100).toFixed(1) : 0,
      count: physicalAssets,
    },
    {
      label: "Digital Assets",
      value: totalAssets.length > 0 ? ((digitalAssets / totalAssets.length) * 100).toFixed(1) : 0,
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
      !widget.permission || userPermissions.includes(widget.permission),
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
    series: !isCategoriesLoading && Array.isArray(departmentCategories)
      ? departmentCategories.map((cat) => cat.subCategories?.length || 0)
      : [], // Example metric
    tooltipValue: !isCategoriesLoading && Array.isArray(departmentCategories)
      ? departmentCategories.map((cat) => cat.subCategories?.length || 0)
      : [], // Can customize
    colors: !isCategoriesLoading && Array.isArray(departmentCategories)
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
    0,
  );

  const departmentPieData = departmentWiseAssets.map((dept) => ({
    label: `${dept.label} Department`,
    value: totalDepartmentAssets > 0 ? ((dept.value / totalDepartmentAssets) * 100).toFixed(1) : 0,
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

  const getFiscalYearFromDate = (dateInput) => {
    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = date.getMonth();
    const fyStartYear = month >= 3 ? year : year - 1;

    return `FY ${fyStartYear}-${String(fyStartYear + 1).slice(-2)}`;
  };

  const getCurrentFiscalYear = () => {
    const now = new Date();
    const startYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;

    return `FY ${startYear}-${String(startYear + 1).slice(-2)}`;
  };

  const getFinancialYearMonths = (fiscalYear) => {
    const [startYearText] = fiscalYear.replace("FY ", "").split("-");
    const startYear = Number(startYearText);

    if (!startYear) return [];

    const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

    return months.map((month, index) => {
      const year = index < 9 ? startYear : startYear + 1;
      return `${month}-${String(year).slice(-2)}`;
    });
  };

  const currentFiscalYear = getCurrentFiscalYear();
  const currentStartYear = Number(currentFiscalYear.match(/\d{4}/)?.[0] || new Date().getFullYear());
  const previousFiscalYear = `FY ${currentStartYear - 1}-${String(currentStartYear).slice(-2)}`;
  const fiscalYears = [previousFiscalYear, currentFiscalYear];

  const [selectedAssetValueFY, setSelectedAssetValueFY] = useState(currentFiscalYear);

  const monthlyAssetStatsByFY = useMemo(() => {
    const initialStats = fiscalYears.reduce((acc, fy) => {
      const months = getFinancialYearMonths(fy);

      acc[fy] = {
        months,
        totalAssetValues: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        usedAssetValues: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        assetsUnderMaintenance: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        assetsDamaged: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
      };

      return acc;
    }, {});

    assetsDept?.forEach((dept) => {
      dept.assets?.forEach((asset) => {
        const fiscalYear = getFiscalYearFromDate(asset.purchaseDate);

        if (!fiscalYear || !initialStats[fiscalYear]) return;

        const month = new Date(asset.purchaseDate).toLocaleString("en-US", {
          month: "short",
          year: "2-digit",
        });

        const monthKey = month.replace(" ", "-");

        if (!initialStats[fiscalYear].totalAssetValues[monthKey] && initialStats[fiscalYear].totalAssetValues[monthKey] !== 0) {
          return;
        }

        const price = asset.price || 0;

        initialStats[fiscalYear].totalAssetValues[monthKey] += price;

        if (asset.isAssigned) {
          initialStats[fiscalYear].usedAssetValues[monthKey] += price;
        }

        if (asset.isUnderMaintenance) {
          initialStats[fiscalYear].assetsUnderMaintenance[monthKey] += 1;
        }

        if (asset.isDamaged) {
          initialStats[fiscalYear].assetsDamaged[monthKey] += 1;
        }
      });
    });

    return initialStats;
  }, [assetsDept, currentFiscalYear, previousFiscalYear]);

  const assetUtilizationSeries = fiscalYears.map((fiscalYear) => {
    const months = monthlyAssetStatsByFY[fiscalYear]?.months || [];

    return {
      group: fiscalYear,
      name: fiscalYear,
      data: months.map((month) => {
        const total = monthlyAssetStatsByFY[fiscalYear]?.totalAssetValues[month] || 0;
        const used = monthlyAssetStatsByFY[fiscalYear]?.usedAssetValues[month] || 0;

        return total ? Number(((used / total) * 100).toFixed(2)) : 0;
      }),
    };
  });

  // ApexCharts configuration
  const assetUtilizationOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: false,
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
      custom: ({ dataPointIndex }) => {
        const months = monthlyAssetStatsByFY[selectedAssetValueFY]?.months || [];
        const month = months[dataPointIndex];

        if (!month) return "";

        const total = monthlyAssetStatsByFY[selectedAssetValueFY]?.totalAssetValues[month] || 0;
        const used = monthlyAssetStatsByFY[selectedAssetValueFY]?.usedAssetValues[month] || 0;
        const underMaintenance = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetsUnderMaintenance[month] || 0;
        const damaged = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetsDamaged[month] || 0;

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
    colors: ["#3B82F6"],
  };

  const assetsValueGraph = {
    titleAmount: `ASSET VALUE UTILIZATION (${selectedAssetValueFY})`,
    title: "Assets Value",
    data: assetUtilizationSeries,
    options: assetUtilizationOptions,
    onYearChange: setSelectedAssetValueFY,
  };

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <YearlyGraph
          titleAmount={assetsValueGraph.titleAmount}
          title={assetsValueGraph.title}
          data={assetsValueGraph.data}
          options={assetsValueGraph.options}
          onYearChange={assetsValueGraph.onYearChange}
        />,
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
          <div className="flex justify-center">
            <DonutChart {...assetCategoriesData} width={440} />
          </div>
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
