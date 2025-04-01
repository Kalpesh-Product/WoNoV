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

const AssetsDashboard = () => {
  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection
          key="assets-value"
          layout={1}
          border
          title={"Assets Value"}
        >
          <BarGraph
            height={400}
            data={assetUtilizationSeries}
            options={assetUtilizationOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card
          key="categories"
          route={"/app/assets/categories"}
          title={"Categories"}
          icon={<RiPagesLine />}
        />,
        <Card
          key="assets-list"
          route={"/app/assets/categories/list-of-assets"}
          title={"Assets List"}
          icon={<RiPagesLine />}
        />,
        <Card
          key="manage-assets"
          route={"/app/assets/manage-assets"}
          title={"Manage Assets"}
          icon={<MdFormatListBulleted />}
        />,
        <Card
          key="mix-bag"
          route={"/app/meetings/calendar"}
          title={"Mix Bag"}
          icon={<MdFormatListBulleted />}
        />,
        <Card
          key="reports"
          route={"/app/assets/reports"}
          title={"Reports"}
          icon={<CgProfile />}
        />,
        <Card
          key="settings"
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
          key="total-assets"
          title={"Total"}
          data={"10K"}
          description={"Assets Owned"}
        />,
        <DataCard
          key="total-categories"
          title={"Total"}
          data={"75"}
          description={"Assets Categories"}
        />,
        <DataCard
          key="total-value"
          title={"Total"}
          data={"6Cr"}
          description={"Assets Value"}
        />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard
          key="in-use"
          title={"Total"}
          data={"9K"}
          description={"Assets In Use"}
        />,
        <DataCard
          key="unassigned"
          title={"Total"}
          data={"1K"}
          description={"Unassigned Assets"}
        />,
        <DataCard
          key="under-maintenance"
          title={"Total"}
          data={"700"}
          description={"Assets Under Maintenance"}
        />,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          key="assigned-unassigned"
          layout={1}
          title={"Assigned v/s Unassigned Assets"}
          border
        >
          <PieChartMui
            data={assetAvailabilityData}
            options={assetAvailabilityOptions}
          />
        </WidgetSection>,
        <WidgetSection
          key="physical-digital"
          layout={1}
          title={"Physical v/s Digital Assets"}
          border
        >
          <PieChartMui
            data={physicalDigitalPieData}
            options={physicalDigitalOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection key="recent-assets" layout={1} padding>
          <MuiTable
            Title="Recently Added Assets"
            columns={recentAssetsColumns}
            rows={recentAssetsData}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection
          key="department-wise"
          layout={1}
          title={"Department Wise Asset Usage"}
          border
        >
          <PieChartMui
            data={departmentPieData}
            options={departmentPieOptions}
          />
        </WidgetSection>,
        <WidgetSection
          key="asset-categories"
          layout={1}
          title={"Asset Categories"}
          border
        >
          <DonutChart {...assetCategoriesData} />
        </WidgetSection>,
      ],
    },
  ];
  return (
    <div>
      <div className="flex flex-col p-4 gap-4">
        {meetingsWidgets.map((widget, index) => (
          <div key={`widget-${index}`}>
            <WidgetSection
              key={`widget-section-${index}`}
              layout={widget.layout}
              padding
            >
              {widget.widgets.map((child, childIndex) => (
                <div key={`widget-child-${index}-${childIndex}`}>{child}</div>
              ))}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsDashboard;
