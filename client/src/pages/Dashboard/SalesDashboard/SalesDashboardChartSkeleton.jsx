import { Skeleton } from "@mui/material";

const barHeights = [140, 205, 175, 245, 160, 220, 185, 235, 150, 200, 170, 215];

const SalesDashboardChartSkeleton = ({ circular = false, title = "chart", height = 300 }) => (
  <div className="flex w-full min-w-0 items-center justify-center px-4 py-5" style={{ height }} role="status" aria-label={`Loading ${title}`}>
    {circular ? (
      <Skeleton variant="circular" width={200} height={200} />
    ) : (
      <div className="flex h-full w-full min-w-0 items-end gap-2 overflow-hidden border-b border-gray-200">
        {barHeights.map((height, index) => (
          <Skeleton key={index} variant="rectangular" height={height} className="min-w-0 flex-1 rounded-t" />
        ))}
      </div>
    )}
  </div>
);

export default SalesDashboardChartSkeleton;
