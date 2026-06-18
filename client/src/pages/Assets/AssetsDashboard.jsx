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
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../redux/slices/assetsSlice";

const AssetsDashboard = () => {
  const { auth } = useAuth();
  const departments = auth.user.departments;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const currentDepartmentId = auth.user?.departments?.[0]?._id;
  const currentDepartmentName = auth.user?.departments?.[0]?.name;
  const roleTitles = auth?.user?.role?.map((item) => item?.roleTitle) || [];
  const isGlobalAssetsUser = roleTitles.some((roleTitle) =>
    ["Master Admin", "Super Admin"].includes(roleTitle),
  );

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
      queryKey: ["categories", isGlobalAssetsUser ? "all" : currentDepartmentId],
      queryFn: async () => {
        try {
          const response = await axios.get(
            isGlobalAssetsUser
              ? `/api/category/get-category`
              : `/api/category/get-category?departmentId=${currentDepartmentId}`,
          );
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });
  const { data: assetSubCategories, isLoading: isSubCategoriesLoading } =
    useQuery({
      queryKey: [
        "assetSubCategories",
        isGlobalAssetsUser ? "all" : currentDepartmentId,
      ],
      queryFn: async () => {
        try {
          const response = await axios.get(
            isGlobalAssetsUser
              ? "/api/assets/get-subcategory"
              : `/api/assets/get-subcategory?departmentId=${currentDepartmentId}`,
          );
          return response.data;
        } catch (error) {
          console.error(error.message);
        }
      },
    });
  const { data: assignedAssetsInUse = [], isLoading: isAssignedAssetsLoading } =
    useQuery({
      queryKey: [
        "assignedAssetsInUse",
        isGlobalAssetsUser ? "all" : currentDepartmentId,
      ],
      queryFn: async () => {
        try {
          const queryParams = new URLSearchParams({ status: "Approved" });

          if (!isGlobalAssetsUser && currentDepartmentId) {
            queryParams.set("department", currentDepartmentId);
          }

          const response = await axios.get(
            `/api/assets/get-asset-requests?${queryParams.toString()}`,
          );

          return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
          console.error(error.message);
          return [];
        }
      },
      enabled: isGlobalAssetsUser || Boolean(currentDepartmentId),
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
      permission: PERMISSIONS.ASSETS_MIX_BAG.value,
    },
    {
      title: "Reports",
      route: "/app/assets/reports",
      icon: <CgProfile />,
      permission: PERMISSIONS.ASSETS_REPORTS.value,
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
    const encodedDepartmentName = encodeURIComponent(
    (currentDepartmentName || "").trim(),
  );
  //---------- Nav Cards ---------//

  const handleOwnedAssetsClick = () => {
    if (isGlobalAssetsUser) {
      // navigate("/app/assets/view-assets", {
        navigate("/app/assets/view-assets/list-of-assets/assets-owned", {
        state: { assetOwnershipType: "Owned" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
      // `/app/assets/view-assets/${currentDepartmentName}/list-of-assets`,
          `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-owned`,
      {
        state: { assetOwnershipType: "Owned" },
      },
    );
  };

  const handleRentalAssetsClick = () => {
    if (isGlobalAssetsUser) {
      navigate("/app/assets/view-assets/list-of-assets/assets-rental", {
        state: { assetOwnershipType: "Rental" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
     `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-rental`,
      { state: { assetOwnershipType: "Rental" } },
    );
  };


  const handleAssetTabClick = (assetTargetTab) => {
    if (isGlobalAssetsUser) {
      navigate("/app/assets/view-assets", {
        state: { assetTargetTab },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
      `/app/assets/view-assets/${currentDepartmentName}/${assetTargetTab}`,
      {
        state: { assetTargetTab },
      },
    );
  };

  const handleTotalAssetsClick = () => {
    if (isGlobalAssetsUser) {
      navigate("/app/assets/view-assets/list-of-assets/total-assets");
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(`/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/total-assets`);
  };

  const handleUnderMaintenanceClick = () => {
    if (isGlobalAssetsUser) {
          navigate(
        "/app/assets/view-assets/list-of-assets/assets-under-maintenance",
        {
          state: { assetStatusFilter: "underMaintenance" },
        },
      );
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
       `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-under-maintenance`,
      {
        state: { assetStatusFilter: "underMaintenance" },
      },
    );
  };

  const handleDamagedAssetsClick = () => {
    if (isGlobalAssetsUser) {
       navigate("/app/assets/view-assets/list-of-assets/assets-damaged", {
        state: { assetStatusFilter: "damaged" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
        `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-damaged`,
      {
        state: { assetStatusFilter: "damaged" },
      },
    );
  };

  const handleExtraAssetsClick = () => {
    if (isGlobalAssetsUser) {
        navigate("/app/assets/view-assets/list-of-assets/assets-extra", {
        state: { assetStatusFilter: "extra" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
        `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-extra`,
      {
        state: { assetStatusFilter: "extra" },
      },
    );
  };

  const handleAssetsInUseClick = () => {
    if (isGlobalAssetsUser) {
      navigate("/app/assets/manage-assets", {
        state: { assetViewFilter: "inUse" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
      `/app/assets/manage-assets/${currentDepartmentName}/assigned-assets`,
      {
        state: { assetViewFilter: "inUse" },
      },
    );
  };

  const handleUnassignedAssetsClick = () => {
    if (isGlobalAssetsUser) {
      navigate("/app/assets/manage-assets", {
        state: { assetViewFilter: "available" },
      });
      return;
    }

    dispatch(setSelectedDepartment(currentDepartmentId));
    dispatch(setSelectedDepartmentName(currentDepartmentName));
    navigate(
      // `/app/assets/manage-assets/${currentDepartmentName}/assign-assets`,
         `/app/assets/manage-assets/${currentDepartmentName}/unassigned-assets`,
      {
        state: { assetViewFilter: "available" },
      },
    );
  };

  const deptNames = departments.map((dept) => dept.name);

  let assetsDept = Array.isArray(departmentAssets) ? departmentAssets : [];

  if (!isGlobalAssetsUser) {
    assetsDept = assetsDept.filter((dept) =>
      deptNames.includes(dept.departmentName),
    );
  }

  const totalCategories = !isCategoriesLoading && Array.isArray(departmentCategories)
    ? departmentCategories.length
    : 0;
  const totalSubCategories =
    !isSubCategoriesLoading && Array.isArray(assetSubCategories)
      ? assetSubCategories.length
      : 0;  
  const totalAssets = (isDepartmentLoading || !Array.isArray(assetsDept))
    ? []
    : assetsDept
      .filter((dept) => dept?.assets && Array.isArray(dept.assets))
      .flatMap((dept) => dept.assets);

  const activeAssets = totalAssets.filter((asset) => {
    const normalizedStatus = String(asset?.status ?? "").trim().toLowerCase();
    if (normalizedStatus) return normalizedStatus === "active";
    return asset?.isActive === true;
  });

  const availableAssets = activeAssets.filter((asset) => {
    const assignmentState = String(asset?.assignmentState ?? "")
      .trim()
      .toLowerCase();

    if (assignmentState) return assignmentState === "available";
    return !asset?.isAssigned;
  });

  const totalOwnedAssets = totalAssets.filter((asset) => {
    return asset.ownershipType === "Owned";
  }).length;
   const totalRentalAssets = totalAssets.filter((asset) => {
    return asset.ownershipType === "Rental";
  }).length;
  const totalAssignedAssets = isAssignedAssetsLoading
    ? 0
    : assignedAssetsInUse.length;
  const totalUnassignedAssets = availableAssets.length;
  const totalAssetAvailabilityBase = totalAssignedAssets + totalUnassignedAssets;

  const totalAssetsUnderMaintenance = totalAssets.filter(
    (asset) => asset.isUnderMaintenance,
  ).length;
  const totalDamagedAssets = totalAssets.filter((asset) => asset.isDamaged).length;
  const totalExtraAssets = totalAssets.filter((asset) => asset.isExtra).length;
  const totalAssetsPrice = totalAssets.reduce(
    (acc, asset) => acc + (asset?.price || 0),
    0,
  );
  const approvedAssignedAssetIds = useMemo(() => {
    return new Set(
      (Array.isArray(assignedAssetsInUse) ? assignedAssetsInUse : [])
        .map((request) => request?.asset?._id || request?.asset)
        .filter(Boolean)
        .map((id) => String(id)),
    );
  }, [assignedAssetsInUse]);

  // Assigned and Unassigned Assets Pie Chart
  const assetAvailabilityData = [
    {
      label: "Assigned Assets",
      value: totalAssetAvailabilityBase > 0 ? ((totalAssignedAssets / totalAssetAvailabilityBase) * 100).toFixed(1) : 0,
      count: totalAssignedAssets,
    },
    {
      label: "Unassigned Assets",
      value: totalAssetAvailabilityBase > 0 ? ((totalUnassignedAssets / totalAssetAvailabilityBase) * 100).toFixed(1) : 0,
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
      permission: PERMISSIONS.ASSETS_PHYSICAL_DIGITAL.value,
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
        return cat?.categoryName || "N/A";
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
    { id: "srNo", label: "Sr No" ,width:150},
    { id: "assetId", label: "Asset Id" ,flex:1},
    { id: "department", label: "Department" ,flex:1},
    { id: "category", label: "Category",flex:1 },
    { id: "subCategory", label: "Sub-Category" ,flex:1},
    { id: "brand", label: "Brand",flex:1},
    {
      id: "price",
      label: "Price (INR)",
      flex:1
    },
    { id: "purchaseDate", label: "Purchase Date" ,flex:1},
    { id: "warranty", label: "Warranty (Months)",align: "center",width:200},
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
          category: item?.subCategory?.category?.categoryName || "N/A",
          brand: item?.brand,
          warranty: item?.warranty,
          purchaseDate: humanDate(item?.purchaseDate),
          price: `INR ${item?.price}`,
        };

        return data;
      });

  //Assets Value Graph

  const parseAssetPurchaseDate = (dateInput) => {
    if (!dateInput) return null;

    if (dateInput instanceof Date) {
      return Number.isNaN(dateInput.getTime()) ? null : dateInput;
    }

    const rawValue = String(dateInput).trim();
    if (!rawValue) return null;

    if (/^\d{1,2}[/-]\d{1,2}[/-]\d{4}$/.test(rawValue)) {
      const normalizedValue = rawValue.replace(/\//g, "-");
      const [day, month, year] = normalizedValue.split("-").map(Number);

      if (!day || !month || !year) return null;

      const parsedDate = new Date(year, month - 1, day);
      return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
    }

    const directDate = new Date(rawValue);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate;
    }

    const normalizedValue = rawValue.replace(/\//g, "-");
    const [day, month, year] = normalizedValue.split("-").map(Number);

    if (!day || !month || !year) return null;

    const parsedDate = new Date(year, month - 1, day);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  };

  const getAssetGraphDate = (asset) =>
    parseAssetPurchaseDate(asset?.createdAt) ||
    parseAssetPurchaseDate(asset?.purchaseDate);

  const getFiscalYearFromDate = (dateInput) => {
    const date = parseAssetPurchaseDate(dateInput);

    if (!date) return null;

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
  const fiscalYears = useMemo(() => {
    const fySet = new Set([currentFiscalYear]);

    totalAssets.forEach((asset) => {
      const fiscalYear = getFiscalYearFromDate(getAssetGraphDate(asset));
      if (fiscalYear) {
        fySet.add(fiscalYear);
      }
    });

    return Array.from(fySet).sort((firstFy, secondFy) => {
      const firstStartYear = Number(firstFy.match(/\d{4}/)?.[0] || 0);
      const secondStartYear = Number(secondFy.match(/\d{4}/)?.[0] || 0);
      return firstStartYear - secondStartYear;
    });
  }, [currentFiscalYear, totalAssets]);

  const [selectedAssetValueFY, setSelectedAssetValueFY] = useState(currentFiscalYear);
  const [visibleAssetTooltipMetrics, setVisibleAssetTooltipMetrics] = useState({
    totalAssetValue: true,
    assetCount: true,
    assetInUse: true,
    underMaintenance: true,
    damaged: true,
  });

  const monthlyAssetStatsByFY = useMemo(() => {
    const initialStats = fiscalYears.reduce((acc, fy) => {
      const months = getFinancialYearMonths(fy);

      acc[fy] = {
        months,
        assetCounts: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        assetsInUse: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        totalAssetValues: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        usedAssetValues: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        assetsUnderMaintenance: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
        assetsDamaged: months.reduce((monthAcc, month) => ({ ...monthAcc, [month]: 0 }), {}),
      };

      return acc;
    }, {});

    totalAssets.forEach((asset) => {
      const parsedPurchaseDate = getAssetGraphDate(asset);
      const fiscalYear = getFiscalYearFromDate(parsedPurchaseDate);

      if (!fiscalYear || !initialStats[fiscalYear]) return;

      const month = parsedPurchaseDate.toLocaleString("en-US", {
        month: "short",
        year: "2-digit",
      });

      const monthKey = month.replace(" ", "-");

      if (!initialStats[fiscalYear].totalAssetValues[monthKey] && initialStats[fiscalYear].totalAssetValues[monthKey] !== 0) {
        return;
      }

      const price = Number(asset?.price) || 0;
      initialStats[fiscalYear].assetCounts[monthKey] += 1;
      initialStats[fiscalYear].totalAssetValues[monthKey] += price;

      if (approvedAssignedAssetIds.has(String(asset?._id))) {
        initialStats[fiscalYear].assetsInUse[monthKey] += 1;
        initialStats[fiscalYear].usedAssetValues[monthKey] += price;
      }

      if (asset.isUnderMaintenance) {
        initialStats[fiscalYear].assetsUnderMaintenance[monthKey] += 1;
      }

      if (asset.isDamaged) {
        initialStats[fiscalYear].assetsDamaged[monthKey] += 1;
      }
    });

    return initialStats;
  }, [approvedAssignedAssetIds, fiscalYears, totalAssets]);

  const assetUtilizationSeries = fiscalYears.map((fiscalYear) => {
    const months = monthlyAssetStatsByFY[fiscalYear]?.months || [];

    return {
      group: fiscalYear,
      name: fiscalYear,
      data: months.map((month) => {
        const total = monthlyAssetStatsByFY[fiscalYear]?.totalAssetValues[month] || 0;
        return total ? Number((total / 100000).toFixed(2)) : 0;
      }),
    };
  });
  const assetValueSeriesMax = Math.max(
    5,
    ...assetUtilizationSeries.flatMap((series) => series.data || []),
  );
  const assetValueYAxisMax = Math.ceil(assetValueSeriesMax);
  const getSelectedFyAssetValueByMonth = (month) => {
    if (!month) return 0;

    return Number(
      monthlyAssetStatsByFY[selectedAssetValueFY]?.totalAssetValues?.[month] || 0,
    );
  };
  // ApexCharts configuration
  const assetUtilizationOptions = {
    chart: {
      type: "bar",
      fontFamily: "Poppins-Regular",
      toolbar: false,
    },
     legend: {
      show: false,
    },
    yaxis: {
      min: 0,
      max: assetValueYAxisMax,
      tickAmount: 5,
      title: {
        text: "Amount In Lakhs (INR)",
      },
      labels: {
        formatter: (value) => `${Math.round(value)}`,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val, { dataPointIndex }) => {
        const months = monthlyAssetStatsByFY[selectedAssetValueFY]?.months || [];
        const month = months[dataPointIndex];
        const total = getSelectedFyAssetValueByMonth(month);

        return total ? inrFormat(total) : "";
      },
      offsetY: -20,
      style: {
        fontSize: "11px",
        colors: ["#000"],
      },
    },
    tooltip: {
      enabled: true,
      shared: false,
      custom: ({ dataPointIndex }) => {
        const months = monthlyAssetStatsByFY[selectedAssetValueFY]?.months || [];
        const month = months[dataPointIndex];

        if (!month) return "";

        const assetCount = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetCounts[month] || 0;
        const assetInUseCount = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetsInUse[month] || 0;
        const total = getSelectedFyAssetValueByMonth(month);
        const underMaintenance = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetsUnderMaintenance[month] || 0;
        const damaged = monthlyAssetStatsByFY[selectedAssetValueFY]?.assetsDamaged[month] || 0;
        const tooltipRows = [
          {
            key: "totalAssetValue",
            label: `Total Assets Value : <strong>INR ${inrFormat(total)}</strong>`,
            color: "#26C6DA",
          },
          {
            key: "assetCount",
            label: `No of Asset : <strong>${assetCount}</strong>`,
            color: "#42A5F5",
          },
          {
            key: "assetInUse",
            label: `Asset In Use : <strong>${assetInUseCount}</strong>`,
            color: "#1E88E5",
          },
          {
            key: "underMaintenance",
            label: `Under Maintenance : <strong>${underMaintenance}</strong>`,
            color: "#1565C0",
          },
          {
            key: "damaged",
            label: `Damaged : <strong>${damaged}</strong>`,
            color: "#7986CB",
          },
        ].filter((row) => visibleAssetTooltipMetrics[row.key]);

        return `
        <div style="min-width: 235px; background: #fff; border: 1px solid #d7dbe3; border-radius: 4px; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.12); overflow: hidden;">
          <div class="apexcharts-tooltip-title" style="margin: 0; padding: 8px 10px; background: #eef1f5; border-bottom: 1px solid #d7dbe3; font-weight: 500;">
            ${month}
          </div>
          <div style="padding: 8px 10px; display: grid; gap: 6px;">
            ${tooltipRows
              .map(
                (row) => `
                  <div class="apexcharts-tooltip-series-group apexcharts-active" style="display: flex; align-items: center; margin: 0;">
                    <span class="apexcharts-tooltip-marker" style="background-color: ${row.color}; width: 10px; height: 10px; min-width: 10px; min-height: 10px; margin-right: 8px; border-radius: 9999px;"></span>
                    <span style="font-size: 12px; color: #1f2937; line-height: 1.4;">${row.label}</span>
                  </div>
                `,
              )
              .join("")}
          </div>
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
    grid: {
      padding: {
        top: 34,
        bottom: 28,
      },
    },
    colors: ["#3B82F6"],
  };

  const assetsValueGraph = {
    title: `ASSET VALUE UTILIZATION - ${selectedAssetValueFY}`,
    titleAmount: `TOTAL ASSET VALUE : INR ${inrFormat(totalAssetsPrice)}`,
    data: assetUtilizationSeries,
    options: assetUtilizationOptions,
    onYearChange: setSelectedAssetValueFY,
    permission: PERMISSIONS.ASSETS_ASSET_VALUE_UTILIZATION.value,
  };
  const assetLegendItems = [
    { key: "totalAssetValue", label: "Total Assets Value", color: "#26C6DA" },
    { key: "assetCount", label: "No of Asset", color: "#42A5F5" },
    { key: "assetInUse", label: "Asset In Use", color: "#1E88E5" },
    { key: "underMaintenance", label: "Under Maintenance", color: "#1565C0" },
    { key: "damaged", label: "Damaged", color: "#7986CB" },
  ];

  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        userPermissions.includes(assetsValueGraph.permission) && (
          <div className="relative">
            <div className="absolute left-1/2 top-[92px] z-10 flex w-full max-w-[760px] -translate-x-1/2 flex-wrap items-center justify-center gap-x-5 gap-y-3 px-6 text-xs text-slate-600">
              {assetLegendItems.map((item) => {
                const isVisible = visibleAssetTooltipMetrics[item.key];

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setVisibleAssetTooltipMetrics((prev) => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`flex items-center gap-2.5 whitespace-nowrap transition-opacity ${
                      isVisible ? "opacity-100" : "opacity-40"
                    }`}
                  >
                    <span
                      className="inline-block h-[11px] w-[11px]"
                      style={{ backgroundColor: item.color }}
                    />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <YearlyGraph
              title={assetsValueGraph.title}
              titleAmount={assetsValueGraph.titleAmount}
              data={assetsValueGraph.data}
              options={assetsValueGraph.options}
              onYearChange={assetsValueGraph.onYearChange}
            />
          </div>
        )
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
      // layout: userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_OWNED.value) &&
      //   userPermissions.includes(PERMISSIONS.ASSETS_ASSET_CATEGORIES.value) &&
      //   userPermissions.includes(PERMISSIONS.ASSETS_ASSET_VALUE.value) ? 3 : 1,
        layout: 4,
      widgets: [
           userPermissions.includes(PERMISSIONS.ASSETS_TOTAL_ASSETS.value) && (
          <DataCard
            title={"Total"}
            data={totalAssets.length}
            description={"Total Assets"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/view-assets/list-of-assets/total-assets"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/total-assets`
            }
            onClick={handleTotalAssetsClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_OWNED.value) && (
          <DataCard
            title={"Total"}
            data={totalOwnedAssets}
            description={"Assets Owned"}
            // route={"/app/assets/view-assets"}
             route={
              isGlobalAssetsUser
                ? "/app/assets/view-assets/list-of-assets/assets-owned"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-owned`
            }
            onClick={handleOwnedAssetsClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_RENTAL.value) && (
          <DataCard
            title={"Total"}
            data={totalRentalAssets}
            description={"Assets Rental"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/view-assets/list-of-assets/assets-rental"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-rental`
            }
            onClick={handleRentalAssetsClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSET_VALUE.value) && (
          <DataCard
            title={"Total"}
            data={`INR ${inrFormat(totalAssetsPrice)}`}
            description={"Assets Value"}
            route={"/app/assets/view-assets"}
          />
        ),
      ],
    },
    {
       layout: 4,
      widgets: [
        userPermissions.includes(PERMISSIONS.ASSETS_ASSET_CATEGORIES.value) && (
          <DataCard
            title={"Total"}
            data={totalCategories}
            description={"Assets Categories"}
            route={"/app/assets/view-assets"}
            onClick={() => handleAssetTabClick("assets-categories")}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSET_SUB_CATEGORIES.value) && (
          <DataCard
            title={"Total"}
            data={totalSubCategories}
            description={"Assets Sub-Categories"}
            route={"/app/assets/view-assets"}
            onClick={() => handleAssetTabClick("assets-sub-categories")}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_IN_USE.value) && (
          <DataCard
            title={"Total"}
            data={totalAssignedAssets}
            description={"Assets In Use"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/manage-assets"
                : `/app/assets/manage-assets/${currentDepartmentName}/assigned-assets`
            }
            onClick={handleAssetsInUseClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_UNASSIGNED_ASSETS.value) && (
          <DataCard
            title={"Total"}
            data={totalUnassignedAssets}
            description={"Unassigned Assets"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/manage-assets"
               : `/app/assets/manage-assets/${currentDepartmentName}/unassigned-assets`
            }
            onClick={handleUnassignedAssetsClick}
          />
        ),
              ],
    },
    {
      layout: 3,
      widgets: [
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_UNDER_MAINTENANCE.value) && (
          <DataCard
            title={"Total"}
            data={totalAssetsUnderMaintenance}
            description={"Assets Under Maintenance"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/view-assets/list-of-assets/assets-under-maintenance"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-under-maintenance`
                // : `/app/assets/view-assets/${currentDepartmentName}/list-of-assets`
            }
            onClick={handleUnderMaintenanceClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_DAMAGED.value) && (
          <DataCard
            title={"Total"}
            data={totalDamagedAssets}
            description={"Assets Damaged"}
            route={
              isGlobalAssetsUser
               ? "/app/assets/view-assets/list-of-assets/assets-damaged"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-damaged`  
            }
            onClick={handleDamagedAssetsClick}
          />
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSETS_EXTRA.value) && (
          <DataCard
            title={"Total"}
            data={totalExtraAssets}
            description={"Assets Extra"}
            route={
              isGlobalAssetsUser
                ? "/app/assets/view-assets/list-of-assets/assets-extra"
                : `/app/assets/view-assets/${encodedDepartmentName}/list-of-assets/assets-extra`
            }
            onClick={handleExtraAssetsClick}
          />
        ),
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
            centerAlign
          />
        </WidgetSection>
      )),
    },
    {
      layout: userPermissions.includes(PERMISSIONS.ASSETS_DEPARTMENT_WISE_ASSET_USAGE.value) &&
        userPermissions.includes(PERMISSIONS.ASSETS_ASSET_CATEGORIES.value) ? 2 : 1,
      widgets: [
        userPermissions.includes(PERMISSIONS.ASSETS_DEPARTMENT_WISE_ASSET_USAGE.value) && (
          <WidgetSection layout={1} title={"Department Wise Asset Usage"} border>
            <PieChartMui
              data={departmentPieData}
              options={departmentPieOptions}
              width={550}
              centerAlign
            />
          </WidgetSection>
        ),
        userPermissions.includes(PERMISSIONS.ASSETS_ASSET_CATEGORIES.value) && (
          <WidgetSection layout={1} title={"Asset Categories"} border>
            <div className="flex justify-center">
              <DonutChart {...assetCategoriesData} width={440} />
            </div>
          </WidgetSection>
        ),
      ],
    },
    {
      layout: userPermissions.includes(PERMISSIONS.ASSETS_RECENTLY_ADDED_ASSETS.value) ? 1 : 0,
      widgets: [
        userPermissions.includes(PERMISSIONS.ASSETS_RECENTLY_ADDED_ASSETS.value) && (
          <WidgetSection layout={1} padding>
            <MuiTable
              Title="Recently Added Assets"
              columns={assetColumns}
              rows={recentAssets}
              rowKey="id"
              rowsToDisplay={8}
              className="h-full"
            />
          </WidgetSection>
        ),
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
