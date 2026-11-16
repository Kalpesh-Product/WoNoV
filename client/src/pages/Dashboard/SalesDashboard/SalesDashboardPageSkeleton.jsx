import WidgetSection from "../../../components/WidgetSection";
import TableLoadingSkeleton from "../../../components/Tables/TableLoadingSkeleton";
import SalesDashboardChartSkeleton from "./SalesDashboardChartSkeleton";

const fallbackColumns = Array.from({ length: 7 }, (_, index) => ({
  field: `column-${index}`,
  flex: 1,
}));

const SalesDashboardPageSkeleton = ({
  chartTitle,
  tableTitle,
  columns = fallbackColumns,
  circular = false,
}) => (
  <div className="flex w-full min-w-0 flex-col gap-4" aria-busy="true">
    {chartTitle && (
      <WidgetSection border title={chartTitle}>
        <SalesDashboardChartSkeleton circular={circular} title={chartTitle} />
      </WidgetSection>
    )}
    {tableTitle && (
      <WidgetSection border title={tableTitle}>
        <TableLoadingSkeleton columns={columns} />
      </WidgetSection>
    )}
  </div>
);

export default SalesDashboardPageSkeleton;
