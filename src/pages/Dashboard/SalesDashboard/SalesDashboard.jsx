import { RiPagesLine } from "react-icons/ri";
import { MdFormatListBulleted, MdMiscellaneousServices } from "react-icons/md";
import { CgProfile } from "react-icons/cg";
import Card from "../../../components/Card";
import WidgetSection from "../../../components/WidgetSection";
import DataCard from "../../../components/DataCard";
import MuiTable from "../../../components/Tables/MuiTable";
import BarGraph from "../../../components/graphs/BarGraph";
import PieChartMui from "../../../components/graphs/PieChartMui";
import {

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
  upcomingBirthdaysColumns,
  upcomingBirthdays,
} from "./SalesData/SalesData";

const SalesDashboard = () => {
  const meetingsWidgets = [
    {
      layout: 1,
      widgets: [
        <WidgetSection key="annual-revenue" layout={1} border title={"Annual Monthly Revenue"}>
          <BarGraph
            customLegend={true}
            firstParam={{ title: "Actual Revenue", data: totalActualRevenue }}
            secondParam={{
              title: "Projected Revenue",
              data: totalProjectedRevenue,
            }}
            height={400}
            data={annualMonthlyData}
            options={annualMonthlyOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 6,
      widgets: [
        <Card key="actual-business" route={""} title={"Actual Business"} icon={<RiPagesLine />} />,
        <Card key="targets" route={""} title={"Targets"} icon={<RiPagesLine />} />,
        <Card key="finance" route={""} title={"Finance"} icon={<MdFormatListBulleted />} />,
        <Card key="mix-bag" route={""} title={"Mix Bag"} icon={<MdFormatListBulleted />} />,
        <Card key="reports" route={""} title={"Reports"} icon={<CgProfile />} />,
        <Card key="settings" route={""} title={"Settings"} icon={<MdMiscellaneousServices />} />,
      ],
    },
    {
      layout: 3,
      widgets: [
        <DataCard key="actual" title={"Actual"} data={"92%"} description={"Occupancy"} />,
        <DataCard key="total-revenue" title={"Total"} data={"80L"} description={"Revenues"} />,
        <DataCard key="unique-clients" title={"Unique"} data={"400"} description={"Clients"} />,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection key={""} layout={1} title={"Monthly Unique Leads"} border>
          <BarGraph
            height={400}
            data={monthlyLeadsData}
            options={monthlyLeadsOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 1,
      widgets: [
        <WidgetSection key={""} layout={1} title={"Sourcing Channels"} border>
          <BarGraph
            height={400}
            data={sourcingChannelsData}
            options={sourcingChannelsOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection key={""} layout={1} title={"Client-wise Occupancy"} border>
          <PieChartMui
            data={clientOccupancyPieData}
            options={clientOccupancyPieOptions}
          />
        </WidgetSection>,
        <WidgetSection key={""} layout={1} title={"Sector-wise Occupancy"} border>
          <PieChartMui
            data={sectorPieChartData}
            options={sectorPieChartOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection key={""} layout={1} title={"Gender-wise data"} border>
          <PieChartMui
            data={clientGenderData}
            options={clientGenderPieChartOptions}
          />
        </WidgetSection>,
        <WidgetSection key={""} layout={1} title={"Sector-wise Occupancy"} border>
          <PieChartMui
            data={locationPieChartData}
            options={locationPieChartOptions}
          />
        </WidgetSection>,
      ],
    },
    {
      layout: 2,
      widgets: [
        <WidgetSection key={""} layout={1} padding>
          <MuiTable
            Title="Client Anniversary"
            columns={companyTableColumns}
            rows={formattedCompanyTableData}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
            className="h-full"
          />
        </WidgetSection>,
        <WidgetSection key={""} layout={1} padding>
          <MuiTable
            Title="Client Member Birthday"
            columns={upcomingBirthdaysColumns}
            rows={upcomingBirthdays}
            rowKey="id"
            rowsToDisplay={10}
            scroll={true}
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
          <div key={index}>
            <WidgetSection key={index} layout={widget.layout} padding>
              {widget?.widgets}
            </WidgetSection>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SalesDashboard;
