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

  const { data: departmentCategories, isLoading: isCategoriesLoading } = useQuery({
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

  const totalAssets = isDepartmentLoading
    ? []
    : departmentAssets
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

  const assetColumns = [
    { field: "srNo", headerName: "Sr No" },
    { field: "assetId", headerName: "Asset Id" },
    { field: "department", headerName: "Department" },
    { field: "subCategory", headerName: "Sub-Category" },
    { field: "brand", headerName: "Brand" },
    {
      field: "price",
      headerName: "Price (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   pinned: "right",
    //   cellRenderer: (params) => (
    //     <ThreeDotMenu
    //       rowId={params.data._id}
    //       menuItems={[
    //         {
    //           label: "View",
    //           onClick: () => handleView(params.data),
    //         },
    //         {
    //           label: "Edit",
    //           onClick: () => handleEdit(params.data),
    //         },
    //       ]}
    //     />
    //   ),
    // },
  ];

  const tableData = isDepartmentLoading
    ? []
    : totalAssets.map((item, index) => {
         const data = {
          ...item,
          srNo: index + 1,
          assetId: item.assetId,
          department: item?.department?.name,
          subCategory: item?.subCategory?.subCategoryName,
          category: item?.subCategory?.category.categoryName,
          brand: item?.brand,
          warranty: item?.warranty,
          purchaseDate: item?.purchased,
          price: `INR ${item?.price}`,
        };

        console.log("asset data:",data)
        return data
      });

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
            data={[]}
            options={assetUtilizationOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 5,
      widgets: [
        <Card
          route={"/app/assets/view-assets"}
          title={"View Assets"}
          icon={<RiPagesLine />}
        />,
        <Card
          route={"/app/assets/manage-assets"}
          title={"Manage Assets"}
          icon={<MdFormatListBulleted />}
        />,
        <Card route={"#"} title={"Mix Bag"} icon={<MdFormatListBulleted />} />,
        <Card
          route={"/app/assets/reports"}
          title={"Reports"}
          icon={<CgProfile />}
        />,
        <Card
          route={"/app/assets/settings"}
          title={"Settings"}
          icon={<MdMiscellaneousServices />}
        />,
      ],
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
          data={"75"}
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
      layout: 2,
      widgets: [
        <WidgetSection
          layout={1}
          title={"Assigned v/s Unassigned Assets"}
          border
        >
          <PieChartMui
            data={assetAvailabilityData}
            options={assetAvailabilityOptions}
          />
        </WidgetSection>,
        <WidgetSection layout={1} title={"Physical v/s Digital Assets"} border>
          <PieChartMui
            data={physicalDigitalPieData}
            options={physicalDigitalOptions}
            width={475}
          />
        </WidgetSection>,
      ],
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
            rows={tableData}
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
