import { Skeleton } from "@mui/material";
import TableLoadingSkeleton from "../../../components/Tables/TableLoadingSkeleton";

const placeholderColumns = Array.from({ length: 7 }, (_, index) => ({
  field: `loading-${index}`,
  flex: 1,
}));

const FinanceLoadingSkeleton = ({ variant = "chart", columns = placeholderColumns, cardCount = 6, sections = [] }) => {
  if (variant === "table") {
    return (
      <div className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200" aria-busy="true">
        <TableLoadingSkeleton columns={columns} />
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className={`grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 ${cardCount === 8 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`} aria-busy="true">
        {Array.from({ length: cardCount }, (_, index) => (
          <Skeleton key={index} variant="rounded" width="100%" height={cardCount === 8 ? 100 : 120} />
        ))}
      </div>
    );
  }

  if (variant === "page") {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4 p-4" aria-busy="true">
        <FinanceLoadingSkeleton variant="chart" />
        <FinanceLoadingSkeleton variant="table" columns={columns} />
      </div>
    );
  }

  if (variant === "pie" || variant === "donut") {
    return (
      <div className="flex h-80 w-full min-w-0 flex-col rounded-lg border border-gray-200 p-4" role="status" aria-label={`Loading ${variant} chart`}>
        <Skeleton variant="text" width="45%" height={32} />
        <div className="flex min-h-0 flex-1 items-center justify-center">
          <div className="relative">
            <Skeleton variant="circular" width={184} height={184} />
            {variant === "donut" && <div className="absolute inset-12 rounded-full bg-white" />}
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Skeleton variant="text" width={72} />
          <Skeleton variant="text" width={72} />
        </div>
      </div>
    );
  }

  if (variant === "dashboard") {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4 p-4" aria-busy="true">
        {sections.filter(({ count }) => count > 0).map(({ type, count, types }, sectionIndex) => (
          type === "cards" ? (
            <FinanceLoadingSkeleton key={sectionIndex} variant="cards" cardCount={count} />
          ) : (
            <div key={sectionIndex} className={`grid min-w-0 grid-cols-1 gap-4 ${count > 1 ? "lg:grid-cols-2" : ""}`}>
              {Array.from({ length: count }, (_, index) => (
                <FinanceLoadingSkeleton key={index} variant={types?.[index] || type} columns={columns} />
              ))}
            </div>
          )
        ))}
      </div>
    );
  }

  if (variant === "dashboard1") {
    return (
      <div className="flex w-full min-w-0 flex-col gap-4 p-4" aria-busy="true">
        <Skeleton variant="rounded" width="100%" height={300} />
        <FinanceLoadingSkeleton variant="cards" cardCount={8} />
        <FinanceLoadingSkeleton variant="chart" />
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          <FinanceLoadingSkeleton variant="chart" />
          <FinanceLoadingSkeleton variant="chart" />
        </div>
        <FinanceLoadingSkeleton variant="table" columns={columns} />
      </div>
    );
  }

  return (
    <div className="flex h-72 w-full min-w-0 items-end gap-2 overflow-hidden px-4 py-5" role="status" aria-label="Loading chart">
      {[55, 72, 63, 84, 76, 92, 69, 81, 58, 74, 66, 87].map((height, index) => (
        <Skeleton key={index} variant="rounded" className="min-w-0 flex-1" height={`${height}%`} />
      ))}
    </div>
  );
};

export default FinanceLoadingSkeleton;
